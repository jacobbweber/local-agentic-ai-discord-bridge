---
name: framework-requirement-intake
description: Collaborative intake process that works with the user to define exactly what their new agent or skill should do.
user-invocable: true
disable-model-invocation: false
---

# Purpose
This is the first step in the agent-factory workflow. Before building anything, work with the user to understand what they actually need. The output is a clear, agreed-upon spec that drives the rest of the build.

# Instructions

## Phase 1 — Listen and Ask
The user has an idea for a new agent or skill. Your job is to draw out the details:

1. **What problem does this solve?** — What task, workflow, or domain should the agent handle?
2. **What does "done" look like?** — What outputs, actions, or responses should the agent produce?
3. **Who's the audience?** — Is this for the user themselves, their team, or a public server?
4. **What tools does it need?** — Does it need to run commands (`execute_powershell`), read/write files, or just have conversations with interactive buttons (`ask_user_clarification`)?
5. **What knowledge does it need?** — Should it carry specialized instructions (skills), or is general LLM knowledge sufficient?

Use `ask_user_clarification` to ask these questions with clickable options when choices are clear-cut. Use open-ended follow-ups in conversation when the topic is exploratory.

## Phase 2 — Check What Already Exists
Use `read_file` to scan the current project state:

1. **Existing agents** (`src/agents/`) — Does an agent already cover this use case? Could the new one be an extension or subagent of an existing one?
2. **Existing skills** (`src/skills/`) — Are there reusable skills the new agent can reference instead of reinventing?
3. **Tool definitions** (`src/powershell/tools.js`) — Confirm the available tools match what the user needs.

## Phase 3 — Shape the Spec
Synthesize what you've learned into a proposal. Don't overcomplicate it — match the complexity to the user's actual need.

# Output
Present the user with a **Build Spec** for approval:

```
## Build Spec: [Agent or Skill Name]

### Purpose
[1-2 sentences: what it does and why]

### Behaviors
- [What the agent does when invoked]
- [How it interacts with the user]
- [What outputs it produces]

### Tools Needed
- [List which of the four tools are relevant]

### Skills to Create
- `skill-name` — [What this skill provides]

### Skills to Reuse (Existing)
- `existing-skill` — [Already exists, agent will reference it]

### Subagent Coordination
- @agent-name — [When and why to hand off]
```

Wait for user approval before proceeding to build.
