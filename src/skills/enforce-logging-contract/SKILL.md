---
name: enforce-logging-contract
description: Use this skill to implement standardized logging and directory initialization. Enforces the key=value string format and PSD1-based path resolution.
---

# Intent
Ensure consistent, searchable audit trails. All Controller scripts must produce flat-text logs that remain queryable via `key=value` pairs and maintain a dual-stream (Full/Minimal) output.

# I. Logging Implementation Rules
* **No Native Cmdlets:** Do not use `Write-Host`, `Write-Output`, or `Write-Verbose` for status updates. Use `Write-Log`.
* **Mandatory Parameters:** All log calls must include `-Level` (Info, Warn, Error, Debug), `-Message`, and `-LogPath`.
* **The Key=Value Rule:** Every variable or identifier inside a message string MUST use the `key=value` format.
    * *Correct:* `"Processing started for vpgname=$vpgName"`
    * *Incorrect:* `"Processing started for $vpgName"`
* **Line Integrity:** All log entries must be a single line. Flatten complex objects into `key=value` strings.
* **Simulation:** If `-WhatIf` is present, `Write-Log` messages must be prepended with `[SIMULATION]`.

# II. Infrastructure & Directory Rules
* **Centralized Authority:** Use `./src/config/project-directories.psd1` for all path definitions.
* **Token Resolution:** Replace `{scriptname}` and `{datetime}` tokens at runtime using `Initialize-ProjectDirectories`.
* **Initialization Flow:** 1. Resolve tokens.
    2. Rotate existing data to `\archive[date]\`.
    3. Create new directories.
    4. Throw a terminal error if any directory creation fails.

# III. Directory Schema Reference
| Path Key | Purpose |
| :--- | :--- |
| **State** | Persistent metadata/JSON tracking files. |
| **Backup** | Original configurations before modification. |
| **Logs** | Destination for Full and Minimal log files. |
| **Telemetry** | Local JSON telemetry backups. |
| **Archive** | Long-term repository for rotated data. |
| **Report** | Destination for CSV/HTML reports. |

# IV. Code Templates
### Standard Log Call
```powershell
Write-Log -Level 'Info' -LogPath $LogPath -Message "Task initiated by user=$env:USERNAME with action=VpgCleanup"