---
name: schema-mapper
description: Generates standardized PowerShell Object maps from raw JSON schemas to ensure type-safe function generation.
---

# Instructions
* **Deconstruction:** If a JSON file is large, focus on one "Object Root" at a time (e.g., the `VpgApi` object).
* **Translation Map:** Always output a "Contract Table" before the `@ps-dev` writes any code.

# Contract Table Template
| JSON Field | PS Property | PS Type | Cast Logic | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `vpgIdentifier` | `VpgId` | `[string]` | None | UUID format |
| `lastTest` | `LastTestDate` | `[DateTime]` | `[DateTime]::Parse()` | ISO8601 |
| `vms` | `VmList` | `[array]` | `[PSCustomObject[]]` | Nested array |

# Script Extraction Tool
If the user's file is too large, use this logic to help them extract a sample:
```powershell
# Run this to get a clean schema overview of a large JSON
$Data = Get-Content "path/to/large.json" | ConvertFrom-Json
$Data.psobject.Properties.Name | Out-Clipboard