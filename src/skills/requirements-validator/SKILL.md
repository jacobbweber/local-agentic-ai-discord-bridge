---
name: requirements-validator
description: Validates that a Zerto automation request contains all necessary technical identifiers and PowerShell environmental context.
---

# Logic
When a user provides a task, check it against this mandatory checklist. If any item is "Missing," ask the user specifically for it.

### Zerto Technical Checklist
* **ZVM Version:** (e.g., 10.0 U4). Required for API endpoint compatibility.
* **Site Identity:** Local vs. Remote Site IDs or IPs.
* **VPG Context:** Specific VPG names or a pattern (regex) to match.
* **Auth Method:** Session-based (x-zerto-session) or Keycloak.

### PowerShell Context Checklist
* **Module Dependency:** Which local modules from `./modules/` are required?
* **Output Format:** Does it require the `Doctor` contract (CSV) or standard objects?
* **Risk Level:** Is this a "Change State" operation (requires `-WhatIf` support)?

# Output Example
"Requirement Check: 
- [OK] VPG Names provided.
- [MISSING] ZVM Version (to determine if we use /v1/ or /v2/ endpoints).
- [MISSING] Local module dependencies."