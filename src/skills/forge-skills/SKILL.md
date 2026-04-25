---
name: forge-skills
description: Process for creating new skill directories and SKILL.md files in this bot.
---

# Purpose
Skills are reusable knowledge modules that get injected into an agent's context when referenced. This skill defines how to create them properly.

# How Skills Work in This Bot
1. Skills live at `src/skills/<skill-name>/SKILL.md` (singular, uppercase).
2. When an agent is loaded, the bot scans its `.agent.md` for backtick-wrapped names.
3. For each match, it checks if `src/skills/<that-name>/SKILL.md` exists.
4. If it does, the full content is appended to the LLM system prompt.

# How to Create a Skill

## Step 1 — Create the Directory
```
execute_powershell: New-Item -ItemType Directory -Path "src/skills/<skill-name>" -Force
```

## Step 2 — Write SKILL.md
```
write_file: src/skills/<skill-name>/SKILL.md
```

Content template:
```markdown
---
name: <skill-name>
description: <What this skill provides to the agent>
---

# Instructions
1. [Step one]
2. [Step two]
3. [Step three]

# Output
[What the agent should produce when using this skill]
```

## Step 3 — Reference in Agent
Add to the agent's `# Skills` section:
```markdown
* `<skill-name>` ([Brief description])
```

## Step 4 — Verify
Use `read_file` to confirm:
- File exists at the correct path
- YAML frontmatter has `name` and `description`
- The agent file references it in backticks

# Guidelines
- **Keep it under 50 lines.** Every line is injected into the context window.
- **Use steps, not prose.** Numbered instructions are followed more reliably.
- **One skill, one purpose.** If a skill is doing two things, split it into two skills.
- **No hardcoded secrets.** Never put API keys, tokens, or passwords in skill files.
- **Name it well.** Lowercase, hyphenated, descriptive: `code-reviewer`, `meeting-notes`, `budget-tracker`.