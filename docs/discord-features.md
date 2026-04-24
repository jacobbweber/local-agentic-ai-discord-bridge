# Discord Features Guide

This document covers all Discord-specific interactive features implemented in the bot, how they work under the hood, and how to extend them.

---

## Slash Commands

### How They Work

Slash commands are registered with Discord on bot startup via the `commands.js` registry. When the bot goes online, it calls `rest.put(Routes.applicationCommands(...))` to sync all commands.

### Current Commands

| Command | File | Description |
|---|---|---|
| `/agent` | `src/commands/agent.js` | Invoke an AI agent with a dropdown selector |
| `/text2img` | `src/commands/text2img.js` | Generate images via Stable Diffusion |

### Adding a New Slash Command

1. Create a new file in `src/commands/`:
   ```javascript
   import { SlashCommandBuilder } from "discord.js";

   const myCommand = new SlashCommandBuilder()
       .setName("mycommand")
       .setDescription("What this command does")
       .addStringOption(option =>
           option.setName("input").setDescription("User input").setRequired(true)
       );

   export default myCommand;
   ```

2. Register it in `src/commands/commands.js`:
   ```javascript
   import myCommand from "./mycommand.js";
   export default [text2img, agent, myCommand];
   ```

3. Handle it in `bot.js` inside the `InteractionCreate` event handler:
   ```javascript
   case "mycommand":
       const input = options.getString("input");
       await interaction.deferReply();
       // ... your logic ...
       await interaction.editReply({ content: "Done!" });
       break;
   ```

4. Restart the bot to re-register commands with Discord.

---

## Interactive Buttons

### Clarification Buttons

When the AI needs user input, it calls the `ask_user_clarification` tool. This sends a Discord message with up to 5 clickable buttons.

**How it works:**
1. AI calls tool with `{ question: "...", options: ["A", "B", "C"] }`
2. Bot creates an `ActionRowBuilder` with `ButtonBuilder` components
3. Bot sends the message and calls `clarMsg.awaitMessageComponent()` to pause execution
4. User clicks a button → the collector resolves → AI receives the selection
5. Bot sends a "⏳ Processing..." message and continues the LLM loop

**Button ID format:** `clarify_<index>` (e.g., `clarify_0`, `clarify_1`)

**Timeout:** 5 minutes. If the user doesn't respond, the AI is told to proceed with its best judgment.

### Safe Mode Buttons

When the AI tries to run a destructive PowerShell command (`Remove-Item`, `Stop-Process`, etc.), the command is blocked and presented as Approve/Deny buttons.

**How it works:**
1. `executor.js` throws a `SafetyError`
2. Bot generates a unique `commandId` and stores the pending command in `global.pendingCommands`
3. Bot sends Approve (green) / Deny (red) buttons
4. The `InteractionCreate` handler catches the button click, looks up the command, and either executes or denies it

**Button ID format:** `approve_<commandId>` or `deny_<commandId>`

**Adding unsafe commands:** Edit the `UNSAFE_REGEX` in `src/powershell/executor.js`:
```javascript
const UNSAFE_REGEX = /(Remove-Item|Stop-Process|Restart-Computer|...)/i;
```

---

## Message Handling

### How Messages Are Routed

1. User sends a message mentioning the bot (or in a configured channel)
2. Bot strips the mention and processes the text
3. If the message starts with `.` → it's a dot-command (`.help`, `.reset`, etc.)
4. Otherwise → it's sent to the LLM via `processAgentRequest()`

### Agent Detection in Messages

The bot checks for agents in this priority order:
1. `@agent-name` tags in the message
2. First word of the message (after mention is stripped)
3. Explicit `agent: name` or `--agent name` parameter

### Conversation Memory

Each channel has its own conversation history stored in memory (not persisted to disk). Use `.reset` to clear it.

---

## Typing Indicator

The bot shows "typing..." in Discord while processing. It sends a typing indicator every 7 seconds to keep it visible during long LLM calls.

---

## Response Splitting

Discord has a 2000-character message limit. The bot automatically splits long responses into multiple messages using an intelligent word-boundary algorithm that preserves paragraphs and code blocks.

---

## Extending the Button System

To add a new type of interactive button:

1. **Send the buttons** in your tool handler:
   ```javascript
   const row = new ActionRowBuilder().addComponents(
       new ButtonBuilder()
           .setCustomId("myaction_someId")
           .setLabel("Click Me")
           .setStyle(ButtonStyle.Primary)
   );
   await channel.send({ content: "Choose:", components: [row] });
   ```

2. **Handle the click** — you have two options:

   **Option A: Inline collector** (for tools that need to pause and wait):
   ```javascript
   const response = await msg.awaitMessageComponent({
       filter: i => i.user.id === authorId,
       time: 300000
   });
   ```

   **Option B: Global handler** (for fire-and-forget actions):
   Add a case in the `InteractionCreate` handler in `bot.js`:
   ```javascript
   if (interaction.isButton()) {
       const [action, id] = interaction.customId.split("_");
       if (action === "myaction") {
           // Handle the button click
       }
   }
   ```

> **Important:** If you use the global handler approach, your button ID prefix must be unique and not conflict with `approve`, `deny`, or `clarify`.
