---
name: forge-skills
description: Process for creating new skill directories and SKILL.md files that align with the VS Code Agent Skills standard.
user-invocable: false
---

# Purpose
Agent Skills are folders of instructions, scripts, and resources that an agent can load when relevant. This skill defines how to properly create skills using the open `agentskills.io` standard.

# How Skills Work
1. Skills are stored in directories with a `SKILL.md` file. In this bot, we store them at `src/skills/<skill-name>/SKILL.md`.
2. A skill is loaded progressively when an agent references it or determines its description matches the user's intent.

# How to Create a Skill

## Step 1 — Create the Directory
Use your tools to create a directory matching the skill name:
```
src/skills/<skill-name>
```

## Step 2 — Write SKILL.md
Create the file at `src/skills/<skill-name>/SKILL.md`.

Content template:
```markdown
---
name: <skill-name>
description: Detailed description of what this skill does AND when to use it. Copilot uses this to auto-load the skill.
user-invocable: true
disable-model-invocation: false
---

# <Skill Title>
Detailed instructions, guidelines, and examples go here.

## When to use this skill
- Detail the exact scenarios this applies to.

## Instructions
1. [Step one]
2. [Step two]
3. [Step three]

## References
You can reference other files placed in this skill directory using relative paths: `[template script](./template.ps1)`.
```

## Step 3 — Add Resources (Optional)
If the skill requires templates, scripts, or examples, write them as separate files in the same `src/skills/<skill-name>/` directory and link to them in `SKILL.md`.

## Step 4 — Verify
Use `read_file` to confirm:
- File exists at the correct path.
- YAML frontmatter has a valid `name` (lowercase, hyphens, matches parent dir) and `description`.
- No special namespace prefixes in `name`.

# Guidelines
- **Description is critical:** The description must explicitly state *when* to use the skill, as it controls auto-loading logic.
- **Use steps, not prose.** Numbered instructions are followed more reliably.
- **One skill, one purpose.** If a skill is doing two things, split it into two skills.
- **No hardcoded secrets.** Never put API keys, tokens, or passwords in skill files.