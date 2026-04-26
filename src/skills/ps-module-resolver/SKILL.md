---
name: ps-module-resolver
description: Locate and document relative Import-Module paths for local modules in the monolithic repository.
user-invocable: true
disable-model-invocation: false
---

# Intent
Ensure robust module imports by calculating dynamic, relative paths based on `$PSScriptRoot` instead of hardcoding absolute paths.

# When to use this skill
- When writing a Controller script that needs to load logic from `src/Modules/`.
- When encountering "CommandNotFoundException" for custom project functions.

# Instructions
1. Use `#tool:search` or `#tool:read` to locate the target `.psm1` or `.psd1` file in the `src/Modules/` directory.
2. Determine the relative path from the script currently being written.
3. Construct the module path using `Join-Path` and `$PSScriptRoot`.
4. Generate the `Import-Module` statement using the `-Force` flag if in development context.

# Example Pattern
```powershell
# In a controller script located at src/Controllers/Orchestrator.ps1
$modulePath = Join-Path -Path $PSScriptRoot -ChildPath "..\Modules\Zerto.Core\Zerto.Core.psd1"
Import-Module -Name $modulePath -Force
```
