---
name: design-module-structure
description: Designs the filesystem layout for a new feature, ensuring strict separation between controllers and modules.
---

# Structural Standards
* **Controller:** Must be a single `.ps1` file in `src/Controller/`.
* **Module:** Must be a `.psm1` (and optional `.psd1`) in `src/Modules/[ModuleName]/`.
* **Private vs Public:** Identify which functions are internal to the module and which are exported for the Controller.

# Output Format
The architect must output a tree-view of the proposed changes:
```text
src/
├── Controller/
│   └── [New-Controller].ps1
└── Modules/
    └── [New-Module]/
        ├── [New-Module].psm1
        ├── [New-Module].psd1
        └── Private/
            └── [privte-Functions].ps1
        └── Public/
            └── [public-Functions].ps1
        └── Tests/
            └── [Helper-Functions].ps1
        └── [ReadMe.md]
```