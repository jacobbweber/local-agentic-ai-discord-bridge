# Adding a New Skill

Skills are modular knowledge files that agents reference to gain specialized capabilities. When an agent's `.agent.md` file mentions a skill name in backticks, the bot automatically loads the corresponding `SKILL.md` file into the AI context.

---

## Step 1: Create the Skill Directory

Create a new folder in `src/skills/` with your skill name:

```
src/skills/<skill-name>/SKILL.md
```

> **Important:** The folder name must match exactly what the agent references in backticks. If the agent says `` `my-new-skill` ``, the bot looks for `src/skills/my-new-skill/SKILL.md`.

---

## Step 2: Write the SKILL.md File

Every skill file must have YAML frontmatter and instruction content:

```markdown
---
name: my-new-skill
description: A one-line description of what this skill provides.
---

# Instructions
* Detailed instruction 1
* Detailed instruction 2
* Detailed instruction 3

# Example
Provide a concrete example of the skill in action.
```

### Best Practices

1. **Keep it focused** — A skill should do ONE thing well. Don't combine multiple concerns.
2. **Keep it short** — Every line becomes part of the system prompt and costs tokens. Aim for under 30 lines.
3. **Include examples** — The LLM performs significantly better when it has a concrete example to follow.
4. **Use imperative language** — Write instructions as commands: "Use X", "Apply Y", "Never do Z".

---

## Step 3: Reference the Skill in an Agent

Open the agent file that should use this skill (e.g., `src/agents/my-agent.agent.md`) and add a reference using backtick syntax:

```markdown
# Skills
* `my-new-skill` (Description of what this skill does).
```

> **How auto-loading works:** The bot uses a regex (`/\`([a-zA-Z0-9_-]+)\`/g`) to find all backtick-wrapped strings in the agent file. For each match, it checks if `src/skills/<match>/SKILL.md` exists on disk. If it does, the skill content is appended to the system prompt.

---

## Step 4: Test

No restart is required for skill changes — the bot reads skill files from disk on every request.

1. Send a message to your bot invoking the agent that references the new skill
2. Check the console for:
   ```
   [Bot] [DEBUG] Loading skill context: my-new-skill
   ```
3. If the log doesn't appear, verify:
   - The skill folder name matches the backtick reference exactly
   - The file is named `SKILL.md` (case-sensitive)
   - The agent file actually contains the backtick reference

---

## Existing Skills Reference

| Skill | Used By | Purpose |
|---|---|---|
| `project-scoping` | bridge | Formalize requirement specs |
| `requirements-validator` | bridge | Check for missing technical details |
| `apply-cbh-standard` | ps-dev | Mandatory Comment-Based Help |
| `apply-doctor-pattern` | ps-dev | CSV flattening in Controllers |
| `enforce-logging-contract` | ps-dev | key=value audit trails |
| `idempotency-guard` | ps-dev | Get-before-Create logic |
| `local-module-resolver` | ps-dev | Manage imports for monolithic repos |
| `zerto-api-patterns` | ps-dev | Templates for ZVM REST calls |
| `pester-runner` | ps-dev | Validate code with unit tests |
| `design-module-structure` | architect | Module design patterns |
| `map-api-dependencies` | analyst | API dependency mapping |
| `schema-mapper` | analyst | JSON-to-PowerShell type mapping |
| `persona-drafter` | tutorial-writer | Builds expert persona profiles |
| `jargon-simplifier` | tutorial-writer | Translates jargon to layman terms |
| `procedural-structurer` | tutorial-writer | Enforces step-by-step Markdown format |

---

## Checklist

- [ ] Created `src/skills/<skill-name>/SKILL.md` with YAML frontmatter
- [ ] Skill content is concise and includes examples
- [ ] Referenced the skill in at least one agent file using backtick syntax
- [ ] Verified `Loading skill context:` appears in console logs
