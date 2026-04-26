---
name: doc-procedural-structurer
description: Enforces a strict Markdown hierarchy for procedural tutorials to ensure clear visual progression.
user-invocable: true
disable-model-invocation: false
---

# Requirements
* Use `##` for Major Phases and `###` for Sub-steps.
* Use **Bold** for UI elements or buttons.
* Use `Code Blocks` for commands.
* Include a `> [!TIP]` or `> [!IMPORTANT]` block for common pitfalls in every phase.

# Layout Pattern
1. **Title**
2. **Context** (The "Why")
3. **Action** (The "How")
4. **Result** (The "Check")
