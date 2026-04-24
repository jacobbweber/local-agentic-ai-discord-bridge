---
name: idempotency-guard
description: Ensures PowerShell scripts check for existing state before attempting to create or modify Zerto resources.
---

# Instructions
* Before generating a "Create" command (e.g., `New-ZertoVPG`), always generate a "Get" check first.
* Use `if ($null -eq (Get-Item...))` patterns to prevent duplicate resource creation.
* Implement `WhatIf` support in every functional script generated.

# Implementation Pattern
```powershell
$existingVpg = Get-ZertoVPG -Name $VpgName -ErrorAction SilentlyContinue
if (-not $existingVpg) {
    # Logic to create VPG
} else {
    Write-Verbose "VPG $VpgName already exists. Skipping creation."
}