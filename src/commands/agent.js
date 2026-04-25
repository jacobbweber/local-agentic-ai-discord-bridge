import { SlashCommandBuilder } from "discord.js";

const agent = new SlashCommandBuilder()
	.setName("agent")
	.setDescription("Send a request to an AI agent (bridge, ps-dev, architect, analyst, agent-factory)")
	.addStringOption((option) =>
		option
			.setName("name")
			.setDescription("Which agent to invoke")
			.setRequired(true)
			.addChoices(
				{ name: "🌉 Bridge (Orchestrator)", value: "bridge" },
				{ name: "💻 PS-Dev (PowerShell Developer)", value: "ps-dev" },
				{ name: "🏗️ Architect (System Design)", value: "architect" },
				{ name: "🔍 Analyst (Data & API Analysis)", value: "analyst" },
				{ name: "📝 Tutorial Writer (Technical Docs)", value: "tutorial-writer" },
				{ name: "🏭 Agent Factory (Meta-Agent Builder)", value: "agent-factory" }
			)
	)
	.addStringOption((option) =>
		option
			.setName("prompt")
			.setDescription("Your request for the agent")
			.setRequired(true)
	);

export default agent;
