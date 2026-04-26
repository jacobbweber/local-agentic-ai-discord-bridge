---
name: framework-quality-audit
description: Final validation checklist to run before declaring an agent or skill production-ready.
user-invocable: true
disable-model-invocation: false
---

# Purpose
Run this checklist after building any agent or skill. It catches the structural and design issues that would cause the bot to fail at runtime.

# Checklist

## File Structure
- [ ] Agent file is at `src/agents/<name>.agent.md`?
- [ ] Skill file is at `src/skills/<name>/SKILL.md` (singular, not SKILLS.md)?
- [ ] YAML frontmatter has `name` and `description`?
- [ ] Agent `name` in YAML matches filename stem?

## Tool Integrity
- [ ] Agent `tools` array only lists real tools: `execute_powershell`, `read_file`, `write_file`, `ask_user_clarification`?
- [ ] No phantom tools (e.g., `web`, `browser`, `search`, `vscode` are NOT callable)?

## Skill Wiring
- [ ] Every skill name in backticks in the agent file has a matching `src/skills/<name>/SKILL.md`?
- [ ] Every subagent name in the `agents` array has a matching `src/agents/<name>.agent.md`?

## Registration
- [ ] Agent added to `src/commands/agent.js` `addChoices()` with correct `value`?

## Token Efficiency
- [ ] Each skill file is under 50 lines?
- [ ] Instructions use numbered steps, not long paragraphs?
- [ ] No large data blobs embedded — use `read_file` references instead?

## Interaction Design
- [ ] Agent uses `ask_user_clarification` for ambiguous inputs (not plain-text questions)?
- [ ] Button options are 2-5 items, each ≤80 characters?

## Security
- [ ] No secrets, API keys, or tokens hardcoded in any file?
- [ ] Destructive PowerShell commands rely on the bot's built-in Safe Mode?

# Output
```
| Check            | Status  | Notes                        |
|------------------|---------|------------------------------|
| File Structure   | 🟢/🔴  | [Details]                    |
| Tool Integrity   | 🟢/🔴  | [Details]                    |
| Skill Wiring     | 🟢/🔴  | [Details]                    |
| Registration     | 🟢/🔴  | [Details]                    |
| Token Efficiency | 🟢/🔴  | [Details]                    |
| Interaction      | 🟢/🔴  | [Details]                    |
| Security         | 🟢/🔴  | [Details]                    |
```

For any 🔴 items, provide the specific file and fix needed.
