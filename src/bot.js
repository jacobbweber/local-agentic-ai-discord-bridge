import {
	Client,
	Events,
	GatewayIntentBits,
	MessageType,
	Partials,
	REST,
	Routes,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle
} from "discord.js";
import { Logger, LogLevel } from "./meklog.js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import axios from "axios";
import OpenAI from "openai";
import commands from "./commands/commands.js";
import { tools } from "./powershell/tools.js";
import { executePowerShell, readFile, writeFile, SafetyError } from "./powershell/executor.js";

dotenv.config();

const model = process.env.MODEL;
const stableDiffusionServers = process.env.STABLE_DIFFUSION ? process.env.STABLE_DIFFUSION.split(",").map(url => ({ url: new URL(url), available: true })) : [];
const channels = process.env.CHANNELS.split(",");

const openai = new OpenAI({
    baseURL: process.env.OLLAMA ? `${process.env.OLLAMA.replace(/\/$/, "")}/v1` : (process.env.LM_STUDIO_URL || "http://localhost:1234/v1"),
    apiKey: process.env.OPENAI_API_KEY || "ollama"
});

let log = new Logger(false, "Bot");
process.on("message", data => {
	if (data.shardID) client.shardID = data.shardID;
	if (data.logger) log = new Logger(data.logger);
});

async function startBackendAutoDetector() {
	const endpoints = [];
	const ollamaUrl = process.env.OLLAMA ? `${process.env.OLLAMA.replace(/\/$/, "")}/v1` : "http://localhost:11434/v1";
	const lmStudioUrl = process.env.LM_STUDIO_URL || "http://localhost:1234/v1";

	endpoints.push({ name: "Ollama", url: ollamaUrl });
	endpoints.push({ name: "LM Studio", url: lmStudioUrl });

	let currentBackendName = "Unknown";

	while (true) {
		let foundActive = false;
		for (const endpoint of endpoints) {
			try {
				await axios.get(`${endpoint.url}/models`, { timeout: 2000 });
				if (openai.baseURL !== endpoint.url) {
					log(LogLevel.Info, `Auto-switched backend to: ${endpoint.name} (${endpoint.url})`);
					openai.baseURL = endpoint.url;
					currentBackendName = endpoint.name;
				}
				foundActive = true;
				break;
			} catch (e) {
				// Ignore and try next
			}
		}
		
		if (!foundActive && currentBackendName !== "Disconnected") {
			log(LogLevel.Warning, `Both Ollama and LM Studio seem to be offline. Please start one of them!`);
			currentBackendName = "Disconnected";
		}

		await new Promise(r => setTimeout(r, 10000));
	}
}
startBackendAutoDetector();

const logError = (error) => {
	if (error.response) {
		let str = `Error ${error.response.status} ${error.response.statusText}: ${error.request.method} ${error.request.path}`;
		if (error.response.data?.error) {
			str += ": " + error.response.data.error;
		}
		log(LogLevel.Error, str);
	} else {
		log(LogLevel.Error, error);
	}
};

function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

// Ollama makeRequest function removed

async function makeStableDiffusionRequest(path, method, data) {
	while (stableDiffusionServers.filter(server => server.available).length == 0) {
		// wait until a server is available
		await new Promise(res => setTimeout(res, 1000));
	}

	let error = null;
	// randomly loop through the servers available, don't shuffle the actual array because we want to be notified of any updates
	let order = new Array(stableDiffusionServers.length).fill().map((_, i) => i);
	if (randomServer) order = shuffleArray(order);
	for (const j in order) {
		if (!order.hasOwnProperty(j)) continue;
		const i = order[j];
		// try one until it succeeds
		try {
			// make a request to stable diffusion
			if (!stableDiffusionServers[i].available) continue;
			const url = new URL(stableDiffusionServers[i].url); // don't modify the original URL

			stableDiffusionServers[i].available = false;

			if (path.startsWith("/")) path = path.substring(1);
			if (!url.pathname.endsWith("/")) url.pathname += "/"; // safety
			url.pathname += path;
			log(LogLevel.Debug, `Making stable diffusion request to ${url}`);
			const result = await axios({
				method, url, data
			});
			stableDiffusionServers[i].available = true;
			return result.data;
		} catch (err) {
			stableDiffusionServers[i].available = true;
			error = err;
			logError(error);
		}
	}
	if (!error) {
		throw new Error("No servers available");
	}
	throw error;
}

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.MessageContent
	],
	allowedMentions: { users: [], roles: [], repliedUser: false },
	partials: [
		Partials.Channel
	]
});

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

client.once(Events.ClientReady, async () => {
	await client.guilds.fetch();
	client.user.setPresence({ activities: [], status: "online" });
	await rest.put(Routes.applicationCommands(client.user.id), {
		body: commands
	});

	log(LogLevel.Info, "Successfully reloaded application slash (/) commands.");
});

const messages = {};

// split text so it fits in a Discord message
function splitText(str, length) {
	// trim matches different characters to \s
	str = str
		.replace(/\r\n/g, "\n").replace(/\r/g, "\n")
		.replace(/^\s+|\s+$/g, "");
	const segments = [];
	let segment = "";
	let word, suffix;
	function appendSegment() {
		segment = segment.replace(/^\s+|\s+$/g, "");
		if (segment.length > 0) {
			segments.push(segment);
			segment = "";
		}
	}
	// match a word
	while ((word = str.match(/^[^\s]*(?:\s+|$)/)) != null) {
		suffix = "";
		word = word[0];
		if (word.length == 0) break;
		if (segment.length + word.length > length) {
			// prioritise splitting by newlines over other whitespaces
			if (segment.includes("\n")) {
				// append up all but last paragraph
				const beforeParagraph = segment.match(/^.*\n/s);
				if (beforeParagraph != null) {
					const lastParagraph = segment.substring(beforeParagraph[0].length, segment.length);
					segment = beforeParagraph[0];
					appendSegment();
					segment = lastParagraph;
					continue;
				}
			}
			appendSegment();
			// if word is larger than the split length
			if (word.length > length) {
				word = word.substring(0, length);
				if (length > 1 && word.match(/^[^\s]+$/)) {
					// try to hyphenate word
					word = word.substring(0, word.length - 1);
					suffix = "-";
				}
			}
		}
		str = str.substring(word.length, str.length);
		segment += word + suffix;
	}
	appendSegment();
	return segments;
}

function getBoolean(str) {
	return !!str && str != "false" && str != "no" && str != "off" && str != "0";
}

function parseJSONMessage(str) {
	return str.split(/[\r\n]+/g).map(line => {
		const result = JSON.parse(`"${line}"`);
		if (typeof result !== "string") throw new "Invalid syntax in .env file";
		return result;
	}).join("\n");
}

function parseEnvString(str) {
	return typeof str === "string" ?
		parseJSONMessage(str).replace(/<date>/gi, new Date().toUTCString()) : null;
}

const customSystemMessage = parseEnvString(process.env.SYSTEM);
const useCustomSystemMessage = getBoolean(process.env.USE_SYSTEM) && !!customSystemMessage;
const useModelSystemMessage = getBoolean(process.env.USE_MODEL_SYSTEM);
const showStartOfConversation = getBoolean(process.env.SHOW_START_OF_CONVERSATION);
const randomServer = getBoolean(process.env.RANDOM_SERVER);
let modelInfo = null;
const initialPrompt = parseEnvString(process.env.INITIAL_PROMPT);
const useInitialPrompt = getBoolean(process.env.USE_INITIAL_PROMPT) && !!initialPrompt;

const requiresMention = getBoolean(process.env.REQUIRES_MENTION);

async function replySplitMessage(replyMessage, content) {
	const responseMessages = splitText(content, 2000).map(text => ({ content: text }));

	const replyMessages = [];
	for (let i = 0; i < responseMessages.length; ++i) {
		if (i == 0) {
			replyMessages.push(await replyMessage.reply(responseMessages[i]));
		} else {
			replyMessages.push(await replyMessage.channel.send(responseMessages[i]));
		}
	}
	return replyMessages;
}

client.on(Events.MessageCreate, async message => {
	let typing = false;
	try {
		await message.fetch();

		// return if not in the right channel
		const channelID = message.channel.id;
		if (message.guild && !channels.includes(channelID)) return;

		// return if user is a bot, or non-default message
		if (!message.author.id) return;
		if (message.author.bot || message.author.id == client.user.id) return;

		const botRole = message.guild?.members?.me?.roles?.botRole;
		const myMention = new RegExp(`<@((!?${client.user.id}${botRole ? `)|(&${botRole.id}` : ""}))>`, "g"); // RegExp to match a mention for the bot

		if (typeof message.content !== "string" || message.content.length == 0) {
			return;
		}

		let context = null;
		if (message.type == MessageType.Reply) {
			const reply = await message.fetchReference();
			if (!reply) return;
			if (reply.author.id != client.user.id) return;
			if (messages[channelID] == null) return;
			if ((context = messages[channelID][reply.id]) == null) return;
		} else if (message.type != MessageType.Default) {
			return;
		}

		// LM Studio / OpenAI doesn't support /api/show to fetch system messages from the model.
		if (modelInfo == null) {
			modelInfo = { system: "" };
		}

		const systemMessages = [];

		if (useModelSystemMessage && modelInfo.system) {
			systemMessages.push(modelInfo.system);
		}

		if (useCustomSystemMessage) {
			systemMessages.push(customSystemMessage);
		}

		// join them together
		const systemMessage = systemMessages.join("\n\n");

		// deal with commands first before passing to LLM
		let userInput = message.content
			.replace(new RegExp("^s*" + myMention.source, ""), "").trim();

		// may change this to slash commands in the future
		// i'm using regular text commands currently because the bot interacts with text content anyway
		if (userInput.startsWith(".")) {
			const args = userInput.substring(1).split(/\s+/g);
			const cmd = args.shift();
			switch (cmd) {
				case "reset":
				case "clear":
					if (messages[channelID] != null) {
						// reset conversation
						const cleared = messages[channelID].amount;

						// clear
						delete messages[channelID];

						if (cleared > 0) {
							await message.reply({ content: `Cleared conversation of ${cleared} messages` });
							break;
						}
					}
					await message.reply({ content: "No messages to clear" });
					break;
				case "help":
				case "?":
				case "h":
					await message.reply({ content: "Commands:\n- `.reset` `.clear`\n- `.help` `.?` `.h`\n- `.ping`\n- `.model`\n- `.system`" });
					break;
				case "model":
					await message.reply({
						content: `Current model: ${model}`
					});
					break;
				case "system":
					await replySplitMessage(message, `System message:\n\n${systemMessage}`);
					break;
				case "ping":
					// get ms difference
					try {
						const beforeTime = Date.now();
						const reply = await message.reply({ content: "Ping" });
						const afterTime = Date.now();
						const difference = afterTime - beforeTime;
						await reply.edit({ content: `Ping: ${difference}ms` });
					} catch (error) {
						logError(error);
						await message.reply({ content: "Error, please check the console" });
					}
					break;
				case "":
					break;
				default:
					await message.reply({ content: "Unknown command, type `.help` for a list of commands" });
					break;
			}
			return;
		}

		if (message.type == MessageType.Default && (requiresMention && message.guild && !message.content.match(myMention))) return;

		// Removed aggressive guild.channels.fetch() and guild.members.fetch() to prevent opcode 8 rate limits.

		userInput = userInput
			.replace(myMention, "")
			.replace(/<#([0-9]+)>/g, (_, id) => {
				if (message.guild) {
					const chn = message.guild.channels.cache.get(id);
					if (chn) return `#${chn.name}`;
				}
				return "#unknown-channel";
			})
			.replace(/<@!?([0-9]+)>/g, (_, id) => {
				if (id == message.author.id) return message.author.username;
				if (message.guild) {
					const mem = message.guild.members.cache.get(id);
					if (mem) return `@${mem.user.username}`;
				}
				return "@unknown-user";
			})
			.replace(/<:([a-zA-Z0-9_]+):([0-9]+)>/g, (_, name) => {
				return `emoji:${name}:`;
			})
			.trim();

		if (userInput.length == 0) return;

		// Process text files if attached
		if (message.attachments.size > 0) {
			const textAttachments = Array.from(message.attachments, ([, value]) => value).filter(att => att.contentType.startsWith("text"));
			if (textAttachments.length > 0) {
				try {
					await Promise.all(textAttachments.map(async (att, i) => {
						const response = await axios.get(att.url);
						userInput += `\n${i + 1}. File - ${att.name}:\n${response.data}`;
					}));
				} catch (error) {
					log(LogLevel.Error, `Failed to download text files: ${error}`);
					await message.reply({ content: "Failed to download text files" });
					return; // Stop processing if file download fails
				}
			}
		}

		// create conversation
		if (messages[channelID] == null) {
			messages[channelID] = { history: [] };
		}

		// log user's message
		log(LogLevel.Debug, `${message.guild ? `#${message.channel.name}` : "DMs"} - ${message.author.username}: ${userInput}`);

		// start typing
		typing = true;
		await message.channel.sendTyping();
		let typingInterval = setInterval(async () => {
			try {
				await message.channel.sendTyping();
			} catch (error) {
				logError(error);
				if (typingInterval != null) {
					clearInterval(typingInterval);
				}
				typingInterval = null;
			}
		}, 7000);

		try {
			if (useInitialPrompt && messages[channelID].history.length == 0) {
				userInput = `${initialPrompt}\n\n${userInput}`;
				log(LogLevel.Debug, "Adding initial prompt to message");
			}

			const responseText = await processAgentRequest({
				channelID,
				userInput,
				systemMessage,
				authorId: message.author.id,
				channel: message.channel,
			});

			if (typingInterval != null) {
				clearInterval(typingInterval);
			}
			typingInterval = null;

			log(LogLevel.Debug, `Response: ${responseText}`);

			const prefix = showStartOfConversation && messages[channelID].history.length == 2 ?
				"> This is the beginning of the conversation, type `.help` for help.\n\n" : "";

			await replySplitMessage(message, `${prefix}${responseText}`);

		} catch (error) {
			if (typingInterval != null) {
				clearInterval(typingInterval);
			}
			typingInterval = null;
			throw error;
		}
	} catch (error) {
		if (typing) {
			try {
				await message.reply({ content: "Error, please check the console" });
			} catch (ignored) {
				logError(ignored);
			}
		}
		logError(error);
	}
});

// ─────────────────────────────────────────────────────────────
// Shared agent processing function
// Used by both MessageCreate and /agent slash command
// ─────────────────────────────────────────────────────────────
async function processAgentRequest({ channelID, userInput, systemMessage, authorId, channel, forceAgents }) {
	// create conversation
	if (messages[channelID] == null) {
		messages[channelID] = { history: [] };
	}

	const messagesForOpenAI = [];
	let finalSystemMessage = systemMessage || "";

	// Determine which agents to load
	let potentialAgents = forceAgents ? [...forceAgents] : [];

	if (!forceAgents || forceAgents.length === 0) {
		// 1. Check for @agent tags
		const agentMatches = userInput.match(/@([a-zA-Z0-9_-]+)/g);
		if (agentMatches) potentialAgents.push(...agentMatches.map(a => a.substring(1)));

		// 2. Check the first word in the message
		const firstWordMatch = userInput.match(/^([a-zA-Z0-9_-]+)/);
		if (firstWordMatch) potentialAgents.push(firstWordMatch[1]);

		// 3. Check for explicit parameters like 'agent: bridge' or '--agent bridge'
		const explicitAgentMatch = userInput.match(/(?:agent:\s*|--agent\s+)([a-zA-Z0-9_-]+)/i);
		if (explicitAgentMatch) potentialAgents.push(explicitAgentMatch[1]);
	}

	const uniqueAgents = [...new Set(potentialAgents)];
	let agentLoaded = false;

	if (uniqueAgents.length > 0) {
		const agentsDir = path.join(process.cwd(), "src", "agents");
		const skillsDir = path.join(process.cwd(), "src", "skills");

		for (const agentName of uniqueAgents) {
			const agentPath = path.join(agentsDir, `${agentName}.agent.md`);
			if (fs.existsSync(agentPath)) {
				agentLoaded = true;
				log(LogLevel.Debug, `Loading agent context: ${agentName}`);
				const agentContent = fs.readFileSync(agentPath, "utf-8");
				finalSystemMessage += `\n\n--- AGENT CONTEXT: ${agentName} ---\n${agentContent}`;

				// Find mentioned skills formatted as `skill-name`
				const skillMatches = agentContent.match(/`([a-zA-Z0-9_-]+)`/g);
				if (skillMatches) {
					const uniqueSkills = [...new Set(skillMatches.map(s => s.replace(/`/g, "")))];
					for (const skillName of uniqueSkills) {
						const skillPath = path.join(skillsDir, skillName, "SKILL.md");
						if (fs.existsSync(skillPath)) {
							log(LogLevel.Debug, `Loading skill context: ${skillName}`);
							const skillContent = fs.readFileSync(skillPath, "utf-8");
							finalSystemMessage += `\n\n--- SKILL CONTEXT: ${skillName} ---\n${skillContent}`;
						}
					}
				}
			}
		}
	}

	// Inject mandatory tool-use instruction when an agent is loaded
	if (agentLoaded) {
		finalSystemMessage += `\n\n--- CRITICAL INTERACTION RULES ---
When you need ANY information from the user — missing details, architectural decisions, clarifications, or choices between options — you MUST call the "ask_user_clarification" tool. NEVER ask questions as plain text in your response.
Call the tool with:
- "question": your question text
- "options": an array of 2-5 short clickable choices the user can pick from
The user will click a button in Discord to respond. Only after receiving their selection should you proceed.
If you have multiple missing details, ask about the MOST CRITICAL one first using a single tool call.`;
	}

	if (finalSystemMessage) {
		messagesForOpenAI.push({ role: "system", content: finalSystemMessage });
	}

	messagesForOpenAI.push(...messages[channelID].history);
	messagesForOpenAI.push({ role: "user", content: userInput });
	messages[channelID].history.push({ role: "user", content: userInput });

	let responseText = "";
	let keepRunning = true;
	let loopIteration = 0;
	while (keepRunning) {
		loopIteration++;
		log(LogLevel.Debug, `[Agent Loop #${loopIteration}] Sending ${messagesForOpenAI.length} messages to LLM (model=${model})...`);
		const llmStartTime = Date.now();
		let completion;
		try {
			completion = await openai.chat.completions.create({
				model: model || "lm-studio",
				messages: messagesForOpenAI,
				tools: tools,
				tool_choice: "auto",
			});
		} catch (llmError) {
			log(LogLevel.Error, `[Agent Loop #${loopIteration}] LLM API call FAILED after ${((Date.now() - llmStartTime) / 1000).toFixed(1)}s: ${llmError.message || llmError}`);
			throw llmError;
		}
		const llmElapsed = ((Date.now() - llmStartTime) / 1000).toFixed(1);
		const finishReason = completion.choices?.[0]?.finish_reason || "unknown";
		log(LogLevel.Debug, `[Agent Loop #${loopIteration}] LLM responded in ${llmElapsed}s — finish_reason=${finishReason}`);

		const responseMessage = completion.choices[0].message;
		messagesForOpenAI.push(responseMessage);
		messages[channelID].history.push(responseMessage);

		if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
			log(LogLevel.Debug, `[Agent Loop #${loopIteration}] ${responseMessage.tool_calls.length} tool call(s): ${responseMessage.tool_calls.map(t => t.function.name).join(", ")}`);
			for (const toolCall of responseMessage.tool_calls) {
				let toolResult = "";
				let args;
				try {
					args = JSON.parse(toolCall.function.arguments);
				} catch (e) {
					args = {};
				}
				log(LogLevel.Debug, `[Tool] Executing: ${toolCall.function.name}`);

				try {
					if (toolCall.function.name === "execute_powershell") {
						toolResult = await executePowerShell(args.command);
					} else if (toolCall.function.name === "read_file") {
						toolResult = await readFile(args.filename);
					} else if (toolCall.function.name === "write_file") {
						toolResult = await writeFile(args.filename, args.content);
					} else if (toolCall.function.name === "ask_user_clarification") {
						const options = args.options || ["Yes", "No"];
						const question = args.question || "Please choose an option:";

						const row = new ActionRowBuilder();
						options.slice(0, 5).forEach((opt, index) => {
							row.addComponents(
								new ButtonBuilder()
									.setCustomId(`clarify_${index}`)
									.setLabel(opt.length > 80 ? opt.substring(0, 77) + "..." : opt)
									.setStyle(ButtonStyle.Primary)
							);
						});

						const clarMsg = await channel.send({
							content: `🤔 **Clarification needed:**\n${question}`,
							components: [row]
						});

						log(LogLevel.Debug, `[Clarification] Waiting for user button click...`);
						try {
							const btnInteraction = await clarMsg.awaitMessageComponent({
								filter: i => i.user.id === authorId,
								time: 60000 * 5
							});

							const selectedIndex = parseInt(btnInteraction.customId.split('_')[1], 10);
							const selectedOption = options[selectedIndex];
							log(LogLevel.Debug, `[Clarification] User clicked button #${selectedIndex}: "${selectedOption}"`);

							try {
								await btnInteraction.update({
									content: `🤔 **Clarification needed:**\n${question}\n\n✅ *You selected:* **${selectedOption}**`,
									components: []
								});
							} catch (updateErr) {
								log(LogLevel.Error, `[Clarification] interaction.update() failed: ${updateErr.message}`);
								try { await clarMsg.edit({ content: `🤔 ${question}\n\n✅ *You selected:* **${selectedOption}**`, components: [] }); } catch (_) {}
							}

							// Send visible progress indicator
							try {
								const thinkingMsg = await channel.send("⏳ *Processing your response...*");
								setTimeout(() => { try { thinkingMsg.delete(); } catch (_) {} }, 60000);
							} catch (_) {}

							toolResult = `User selected: "${selectedOption}"`;
						} catch (e) {
							log(LogLevel.Debug, `[Clarification] awaitMessageComponent error: ${e.message || 'timeout'}`);
							try {
								await clarMsg.edit({
									content: `🤔 **Clarification needed:**\n${question}\n\n⏰ *(Timed out — no response)*`,
									components: []
								});
							} catch (_) {}
							toolResult = "User did not respond within 5 minutes. Proceed with your best judgment.";
						}
					} else {
						toolResult = "Unknown tool.";
					}
				} catch (e) {
					if (e instanceof SafetyError) {
						const commandId = Math.random().toString(36).substring(7);
						global.pendingCommands = global.pendingCommands || new Map();
						global.pendingCommands.set(commandId, { command: args.command, channelID });

						const safeRow = new ActionRowBuilder()
							.addComponents(
								new ButtonBuilder()
									.setCustomId(`approve_${commandId}`)
									.setLabel('Approve')
									.setStyle(ButtonStyle.Success),
								new ButtonBuilder()
									.setCustomId(`deny_${commandId}`)
									.setLabel('Deny')
									.setStyle(ButtonStyle.Danger),
							);

						await channel.send({
							content: `⚠️ **[SAFE MODE]** Command blocked: \`${args.command}\`\nPlease approve or deny.`,
							components: [safeRow]
						});

						toolResult = `ERROR: SafetyError: ${e.message}. The user has been asked for confirmation. Do not proceed until approved.`;
					} else {
						toolResult = `ERROR: ${e.message}`;
					}
				}

				log(LogLevel.Debug, `[Agent Loop] Tool "${toolCall.function.name}" result: ${toolResult.substring(0, 200)}${toolResult.length > 200 ? '...' : ''}`);
				const toolMessage = {
					role: "tool",
					tool_call_id: toolCall.id,
					content: toolResult
				};
				messagesForOpenAI.push(toolMessage);
				messages[channelID].history.push(toolMessage);
			}
			log(LogLevel.Debug, `[Agent Loop #${loopIteration}] All tool calls processed. Looping back to LLM...`);
		} else {
			responseText = responseMessage.content;
			log(LogLevel.Debug, `[Agent Loop #${loopIteration}] Final text response received (${responseText?.length || 0} chars). Done.`);
			keepRunning = false;
		}
	}

	if (!responseText || responseText.length == 0) {
		responseText = "(No response)";
	}

	return responseText;
}

client.on(Events.InteractionCreate, async (interaction) => {
	if (interaction.isButton()) {
		const [action, commandId] = interaction.customId.split("_");
		if (action === "approve" || action === "deny") {
			const pending = global.pendingCommands?.get(commandId);
			if (!pending) {
				return interaction.reply({ content: "Command expired or not found.", ephemeral: true });
			}
			
			if (action === "approve") {
				await interaction.reply({ content: `Executing command...` });
				try {
					const result = await executePowerShell(pending.command, true);
					if (messages[pending.channelID]) {
						messages[pending.channelID].history.push({ role: "system", content: `Command approved and executed. Output:\n${result}` });
					}
					await replySplitMessage(interaction.message, `Command Output:\n\`\`\`\n${result}\n\`\`\``);
				} catch (err) {
					await interaction.channel.send(`Error executing command: ${err.message}`);
				}
			} else {
				await interaction.reply({ content: "Command denied." });
				if (messages[pending.channelID]) {
					messages[pending.channelID].history.push({ role: "system", content: `Command was denied by the user.` });
				}
			}
			global.pendingCommands.delete(commandId);
			return;
		}
	}

	if (!interaction.isCommand()) return;

	const { commandName, options } = interaction;

	switch (commandName) {
		case "agent":
			try {
				const agentName = options.getString("name");
				const prompt = options.getString("prompt");
				const channelID = interaction.channelId;

				await interaction.deferReply();

				// Build system message
				const systemMessages = [];
				if (useModelSystemMessage && modelInfo?.system) systemMessages.push(modelInfo.system);
				if (useCustomSystemMessage) systemMessages.push(customSystemMessage);
				const systemMessage = systemMessages.join("\n\n");

				// Create conversation if needed
				if (messages[channelID] == null) {
					messages[channelID] = { history: [] };
				}

				log(LogLevel.Debug, `[/agent] ${interaction.user.username} -> @${agentName}: ${prompt}`);

				const responseText = await processAgentRequest({
					channelID,
					userInput: prompt,
					systemMessage,
					authorId: interaction.user.id,
					channel: interaction.channel,
					forceAgents: [agentName],
				});

				// Split response if needed (editReply for first, channel.send for rest)
				const responseMessages = splitText(responseText, 2000);
				await interaction.editReply({ content: responseMessages[0] });
				for (let i = 1; i < responseMessages.length; i++) {
					await interaction.channel.send({ content: responseMessages[i] });
				}
			} catch (error) {
				logError(error);
				try {
					await interaction.editReply({ content: "Error processing agent request, please check the console." });
				} catch (ignored) {
					logError(ignored);
				}
			}
			break;
		case "text2img":
			try {
				const prompt = options.getString("prompt");
				const width = options.getNumber("width") || 256;
				const height = options.getNumber("height") || 256;
				const steps = options.getNumber("steps") || 10;
				const batch_count = options.getNumber("batch_count") || 1;
				const batch_size = options.getNumber("batch_size") || 1;
				const enhance_prompt = (options.getBoolean("enhance_prompt") && true) ? "yes" : "no";

				await interaction.deferReply();
				const stableDiffusionResponse = await makeStableDiffusionRequest(
					"/sdapi/v1/txt2img",
					"post",
					{
						prompt,
						width,
						height,
						steps,
						num_inference_steps: steps,
						batch_count,
						batch_size,
						enhance_prompt
					}
				);
				const images = stableDiffusionResponse.images.map((image) =>
					Buffer.from(image, "base64")
				);
				await interaction.editReply({
					content: `Here are images from prompt \`${prompt}\``,
					files: images
				});
			} catch (error) {
				logError(error);
				await interaction.editReply({
					content: "Error, please check the console"
				});
			}
			break;
	}
});

client.login(process.env.TOKEN);
