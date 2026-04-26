---
name: ps-idempotency-guard
description: Forces PowerShell scripts to check for existing resource state ("Get") before attempting mutations ("Create" / "Update").
user-invocable: true
disable-model-invocation: false
---

# Intent
Prevent script failures and duplicate resource allocation by ensuring all automation scripts are fully idempotent.

# When to use this skill
- Whenever generating a script that executes `New-*`, `Add-*`, `Set-*`, or POST/PUT REST API calls.
- When reviewing code for destructive or state-changing operations.

# Instructions
1. Identify the target resource being created (e.g., VPG, Site, Folder).
2. Generate a read query (`Get-*` or `Invoke-RestMethod -Method Get`) to check if the resource already exists.
3. Wrap the creation logic in an `if` block that only executes if the read query returns `$null`.
4. Output a `Write-Verbose` or `Write-Information` statement if the resource already exists, allowing the script to proceed cleanly.

# Example Implementation
```powershell
$existingVpg = Get-ZertoVPG -Name $VpgName -ErrorAction SilentlyContinue

if (-not $existingVpg) {
    Write-Verbose "VPG '$VpgName' not found. Initiating creation sequence."
    New-ZertoVPG -Name $VpgName -SiteId $SiteId
} else {
    Write-Verbose "VPG '$VpgName' already exists. Skipping creation."
}
```
