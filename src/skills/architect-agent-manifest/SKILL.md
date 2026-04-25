---
name: architect-agent-manifest
description: Structural template and rules for creating valid .agent.md files in this bot.
---

# Purpose
This skill defines the exact format for agent manifests. Every agent created by the factory must follow this template to be loadable by the bot.

# File Location
`src/agents/<name>.agent.md` — The filename stem IS the agent's invocation name.

# Required Structure

## 1. YAML Frontmatter
```yaml
---
name: <agent-name>
description: <One clear sentence describing what this agent does>
agents: ["subagent1", "subagent2"]
tools: [execute_powershell, read_file, write_file, ask_user_clarification]
---
```
- `name` must match the filename stem exactly.
- `tools` must only contain tools from `src/powershell/tools.js`: `execute_powershell`, `read_file`, `write_file`, `ask_user_clarification`.
- `agents` lists only agents with real `.agent.md` files. Omit or use `[]` if none.

## 2. Sections
```markdown
# Role
[2-3 sentences: who this agent is and what its mission is]

# Core Instructions
* **Rule Name:** [Specific behavioral instruction]
* [3-6 rules total — be concrete, not vague]

# Skills
* `skill-name` ([When to use this skill])

# Subagents (if applicable)
* **@name:** [When and why to invoke]
```

# Rules
- **Be specific.** "Help the user" is too vague. "Walk the user through a multi-step form using `ask_user_clarification` to collect inputs, then generate a report with `write_file`" is actionable.
- **Match tools to purpose.** If the agent is conversational-only, it may not need `execute_powershell`. Only list tools the agent will actually use.
- **Keep it lean.** The entire agent file is injected into the LLM context. Long agents burn tokens on every invocation.
- **Skill names in backticks.** The bot's skill loader scans for backtick-wrapped names. A skill is only loaded if its name is in backticks AND the folder `src/skills/<name>/SKILL.md` exists.
- **Directory scope.** New agents will run in the user's workspace directory (PROJECT_DIR), not the bot repo. Don't hardcode repo-specific paths in agent instructions — use relative paths that make sense for the agent's working directory.

# After Creating the Agent
The agent must also be added to `src/commands/agent.js` in the `addChoices()` array:
```javascript
{ name: "🎯 Display Name (Short Description)", value: "agent-name" }
```
The `value` must match the filename stem. Pick an appropriate emoji.