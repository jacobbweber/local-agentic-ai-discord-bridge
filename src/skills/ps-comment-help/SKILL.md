---
name: ps-comment-help
description: Apply this skill to inject strict Comment-Based Help (CBH) blocks when writing or refactoring public PowerShell functions for the ZVM automation project.
user-invocable: true
disable-model-invocation: false
---

# Intent
Enforce a standardized documentation layer for all public functions to ensure maintainability, discoverability, and alignment with metadata standards.

# When to use this skill
- When generating a new PowerShell function in the `src/Modules/` directory.
- When an agent specifically requests documentation or Comment-Based Help.

# Instructions
1. Inspect the function signature and determine all input parameters.
2. Inject the Mandatory Template immediately above the `function` declaration.
3. **Mandatory Sections:** Ensure `.SYNOPSIS`, `.DESCRIPTION`, `.PARAMETER` (for all inputs), `.EXAMPLE` (minimum one), and `.OUTPUTS` are fully populated.
4. **Parameter Precision:** Describe every parameter and specify its exact type expectation (e.g., `[string]`, `[DateTime]`, or `[System.Collections.Generic.List[object]]`).
5. **Output Definition:** Explicitly define the `[PSCustomObject]` fields returned in `.OUTPUTS`.

# Mandatory Template
```powershell
<#
.SYNOPSIS
  [Short, one sentence description of the function]

.DESCRIPTION
  [Detailed multi-line description including what APIs it talks to and what data it mutates.]

.PARAMETER <ParamName>
  [Description of the parameter, including type expectations]

.EXAMPLE
  Get-SystemStatus -Verbose
  [Explanation of what this example command returns]

.OUTPUTS
  [PSCustomObject]
  Returns a custom object representing the data.
#>
function Get-SystemStatus { ... }
```
