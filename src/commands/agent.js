import { SlashCommandBuilder } from "discord.js";

const agent = new SlashCommandBuilder()
	.setName("agent")
	.setDescription("Send a request to an AI agent (bridge, ps-dev, architect, analyst)")
	.addStringOption((option) =>
		option
			.setName("name")
			.setDescription("Which agent to invoke")
			.setRequired(true)
			.addChoices(
				{ name: "🌉 Bridge (Orchestrator)", value: "bridge" },
				{ name: "💻 PS-Dev (PowerShell Developer)", value: "ps-dev" },
				{ name: "🏗️ Architect (System Design)", value: "architect" },
				{ name: "🔍 Analyst (Data & API Analysis)", value: "analyst" }
			)
	)
	.addStringOption((option) =>
		option
			.setName("prompt")
			.setDescription("Your request for the agent")
			.setRequired(true)
	);

export default agent;
