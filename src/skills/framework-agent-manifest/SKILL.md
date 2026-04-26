---
name: framework-agent-manifest
description: Structural template and rules for creating valid .agent.md files that align with VS Code standard.
user-invocable: false
user-invocable: true
disable-model-invocation: false
---

# Purpose
This skill defines the exact format for agent manifests. Every custom agent created by the factory must follow this template to be standard-compliant and portable.

# File Location
Workspace custom agents should be created at `src/agents/<name>.agent.md` for this bot.

# Required Structure

## 1. YAML Frontmatter
Every custom agent must start with YAML frontmatter.

```yaml
---
name: <agent-name>
description: <Clear description of the agent's purpose and capabilities>
target: vscode
user-invocable: true
disable-model-invocation: false
tools: ['execute', 'read', 'edit', 'search', 'agent', 'ask_user_clarification']
model: "gemma4:26b"
agents: ["subagent1", "subagent2"]
handoffs:
  - label: Review Code
    agent: code-reviewer
    prompt: Please review the implementation just completed.
---
```
- `name` (optional but recommended): Display name for the custom agent.
- `description` (required): What this agent does.
- `target`: Usually `vscode` or omitted.
- `tools`: A list of allowed tool aliases. Common ones: `execute` (shell/powershell), `read` (view files), `edit` (modify files), `search` (grep/glob), `agent` (invoke subagents), `web` (fetch URLs). (Note: Include `ask_user_clarification` for this bot's interactive prompts).
- `agents`: List of subagent names allowed to be invoked.
- `handoffs`: Optional suggested next actions to transition between agents.

## 2. Body / Instructions
```markdown
# Role
[2-3 sentences: who this agent is and what its mission is]

# Core Instructions
* **Rule Name:** [Specific behavioral instruction]
* [3-6 rules total — be concrete, not vague]

# Subagents (if applicable)
* **@name:** [When and why to invoke]
```

# Rules
- **Tools referencing:** To reference an allowed tool in the text body, use the `#tool:<tool-name>` syntax (e.g., `#tool:read`).
- **Match tools to purpose.** If the agent is conversational-only, it may not need `execute`. Only list tools the agent will actually use.
- **Keep it lean.** The entire agent file is injected into the LLM context. Long agents burn tokens on every invocation.
- **Directory scope.** New agents will run in the user's workspace directory, not the bot repo. Use relative paths for their instructions.

# After Creating the Agent
The agent must also be added to `src/commands/agent.js` in the `addChoices()` array for Discord integration:
```javascript
{ name: "🎯 Display Name (Short Description)", value: "agent-name" }
```
The `value` must match the filename stem. Pick an appropriate emoji.
