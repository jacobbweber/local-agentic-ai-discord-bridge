---
name: ps-doctor-pattern
description: Apply this skill when generating PowerShell Controller scripts to ensure output complies with the Doctor Contract for CSV intake.
user-invocable: true
disable-model-invocation: false
---

# Intent
The Doctor pattern provides a lightweight, standardized CSV output stream for high‑speed parsing. 

# Implementation Rules
* **Parameter:** Every script MUST include `[Parameter(Mandatory = $false)] [bool]$Doctor = $true`.
* **Output Type:** If `$Doctor` is true, return a headerless, quote-stripped CSV string. If false, return standard objects.
* **Formatting:**
    * Use `,` as the delimiter.
    * Flatten arrays within objects using `;`.
    * Remove all double quotes (`"`) from the final output.
* **Placement:** Place the logic in the "Finalization & Output" phase of the script.

# Reference Template
```powershell
if ($Doctor) {
    $Results | ForEach-Object {
        $Object = $_
        # Flatten arrays: example $Object.Tags = $Object.Tags -join ';'
        $Object
    } | Select-Object -Property 'ID', 'Status', 'Message' |
        ConvertTo-Csv -NoTypeInformation |
        Select-Object -Skip 1 |
        ForEach-Object {
            $_ -replace '^"', '' -replace '"$', '' -replace '","', ','
        }
} else {
    return $Results
}
