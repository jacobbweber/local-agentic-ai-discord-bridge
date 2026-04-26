---
name: pm-project-scoping
description: Transforms a refined conversation into a structured Technical Specification for the Architect and Developer.
user-invocable: true
disable-model-invocation: false
---

# Instructions
Once the `@intake-coordinator` agent has gathered all details, use this skill to output a **Handoff Manifest**. This manifest should be pasted into the chat when switching to the `@solution-architect` or `@powershell-developer` agent.

# Handoff Manifest Template

## PROJECT SCOPE: [Project Name]
- **Goal:** [One sentence summary]
- **Technical Specs:** [ZVM Version, Site IDs, etc.]
- **Controller Name:** [Proposed script name]
- **Module Requirements:** [List of local psm1 files needed]
- **Output Requirements:** [Standard Object | Doctor CSV]
- **Logic Flow:**
  1. [Define step-by-step technical sequence here]
  2. [Continue sequence until completion...]
  n. [Finalization & Error Handling]
