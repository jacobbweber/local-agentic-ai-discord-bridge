# Adding a New Agent

This guide walks you through creating a new AI agent and making it available via the `/agent` Discord slash command.

---

## Step 1: Create the Agent Definition File

Create a new Markdown file in `src/agents/` following the naming convention:

```
src/agents/<agent-name>.agent.md
```

> **Important:** The filename (minus `.agent.md`) becomes the agent's identifier. Use lowercase with hyphens (e.g., `tutorial-writer`, `data-engineer`).

### File Structure

Every agent file must have a YAML frontmatter block and a body:

```markdown
---
name: my-new-agent
description: A one-line description of what this agent does.
agents: ["bridge", "ps-dev"]   # Other agents this one can delegate to
tools: [vscode, execute, read, agent, edit, search]
---

# Role
Describe the agent's persona and primary responsibility.

# Core Instructions
* Rule 1
* Rule 2
* Rule 3

# Skills
* `skill-name-one` (What this skill does).
* `skill-name-two` (What this skill does).
```

### Key Rules

1. **Backtick-wrapped skill names** are automatically detected and loaded. If you write `` `jargon-simplifier` `` in the agent file, the bot will look for `src/skills/jargon-simplifier/SKILL.md` and inject its content into the AI context.
2. Keep the `# Role` section concise — it becomes part of the system prompt and consumes tokens.
3. Use the `agents:` frontmatter to document which other agents this one can coordinate with.

---

## Step 2: Register the Agent in the Slash Command

Open `src/commands/agent.js` and add a new entry to the `.addChoices()` array:

```diff
 .addChoices(
     { name: "🌉 Bridge (Orchestrator)", value: "bridge" },
     { name: "💻 PS-Dev (PowerShell Developer)", value: "ps-dev" },
     { name: "🏗️ Architect (System Design)", value: "architect" },
     { name: "🔍 Analyst (Data & API Analysis)", value: "analyst" },
     { name: "📝 Tutorial Writer (Technical Docs)", value: "tutorial-writer" },
+    { name: "🔧 My New Agent (Short Description)", value: "my-new-agent" }
 )
```

> **Important:** The `value` must exactly match the agent filename (without `.agent.md`).

> **Discord Limit:** Slash commands support a maximum of **25 choices**. If you exceed this, consider grouping agents or using a different input method.

---

## Step 3: Restart the Bot

```bash
npm start
```

The bot will re-register the updated slash commands with Discord on startup. The new agent will appear in the `/agent` dropdown immediately.

---

## Step 4: Test

1. Open Discord and type `/agent`
2. Select your new agent from the dropdown
3. Enter a prompt and submit
4. Check the bot console for:
   ```
   [Bot] [DEBUG] Loading agent context: my-new-agent
   [Bot] [DEBUG] Loading skill context: skill-name-one
   ```

---

## Alternative Invocation (No Slash Command Required)

Agents can also be invoked via regular messages without editing `agent.js`:

- `@Kitty my-new-agent do something...` (first word match)
- `@Kitty agent: my-new-agent do something...` (explicit parameter)
- `@Kitty @my-new-agent do something...` (tag syntax)

These methods work immediately — no restart required — as long as the `.agent.md` file exists on disk.

---

## Checklist

- [ ] Created `src/agents/<name>.agent.md` with YAML frontmatter
- [ ] Agent file references skills using backtick syntax
- [ ] Added choice to `src/commands/agent.js` (for slash command support)
- [ ] Restarted the bot
- [ ] Verified agent loads in console logs
