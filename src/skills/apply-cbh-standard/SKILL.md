---
name: apply-cbh-standard
description: Apply this skill whenever creating or modifying exported/public PowerShell functions to ensure they meet mandatory Comment-Based Help (CBH) metadata requirements.
---

# Intent
Enforce a standardized documentation layer for all public functions to ensure maintainability, discoverability, and alignment with the Zerto ZVM automation project's metadata standards.

# Requirements
* **Mandatory Sections:** Every function MUST include `.SYNOPSIS`, `.DESCRIPTION`, `.PARAMETER` (for all inputs), `.EXAMPLE` (minimum one), and `.OUTPUTS`.
* **Parameter Precision:** Describe every parameter and specify its type expectation (e.g., `[string]`, `[DateTime]`, or `ISO8601 string`).
* **Example Context:** In the `.EXAMPLE` section, provide a sample invocation and a brief description of the expected result.
* **Output Definition:** The `.OUTPUTS` section must explicitly define the fields returned, especially when mapping from external JSON/Swagger payloads.

# Mandatory Template
Place this block immediately above the function declaration:

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