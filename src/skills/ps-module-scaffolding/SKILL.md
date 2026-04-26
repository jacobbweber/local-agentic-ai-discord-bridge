---
name: ps-module-scaffolding
description: Defines the repository hierarchy and isolation patterns for the ZVM automation Engine Room.
user-invocable: true
disable-model-invocation: false
---

# Intent
Prevent "spaghetti code" by strictly enforcing the separation of orchestration (Controllers) from execution (Modules) according to the Engine Room pattern.

# When to use this skill
- When the `@solution-architect` agent is designing a new feature.
- When organizing a chaotic pile of PowerShell scripts into a cohesive module.

# Instructions
1. **Controllers:** Scripts placed in `src/Controllers/` must contain less than 10% logic density. They only orchestrate variables and call modules sequentially.
2. **Core Modules:** Pure business logic and state transformations go in `src/Modules/[System].Core/`.
3. **API Wrappers:** Raw HTTP calls go in `src/Modules/[System].APIWrapper/`. They do not transform data; they only send and receive.
4. Ensure cross-module dependencies are explicitly documented at the top of the Controller script.

# Directory Reference
```text
src/
├── Controllers/
│   └── Deploy-NewDatacenter.ps1
├── Modules/
│   ├── Zerto.Core/
│   │   ├── Get-VpgStatus.ps1
│   │   └── Zerto.Core.psd1
│   └── Zerto.APIWrapper/
│       └── Invoke-ZertoAuth.ps1
└── Utilities/
    └── InfraCode.Logging.psm1
```
