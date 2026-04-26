---
name: ps-logging-contract
description: Injects standard telemetry and audit logging patterns into PowerShell scripts, ensuring strict key=value data structures.
user-invocable: true
disable-model-invocation: false
---

# Intent
Standardize all logging output to support automated SIEM ingestion (e.g., Splunk, Datadog) by strictly enforcing the `key=value` string format in `Write-Host`, `Write-Verbose`, and custom logger calls.

# When to use this skill
- When adding diagnostic output or try/catch error handling to a PowerShell script.
- When an agent needs to add "telemetry" to a module.

# Instructions
1. Never use plain prose for logging (e.g., "The server failed to connect").
2. Always construct log messages as space-separated `key=value` pairs.
3. Enclose variable values in single quotes if they may contain spaces.
4. Mandatory keys for error logging: `status=error`, `message='...'`, `exception='...'`.

# Example Pattern
```powershell
# Good
Write-Verbose "action=Get-ZertoVPG status=success target='$VpgName' duration_ms=$elapsed"

# Error Handling
catch {
    Write-Error "action=Create-ZertoVPG status=error target='$VpgName' exception='$($_.Exception.Message)'"
    throw
}
```
