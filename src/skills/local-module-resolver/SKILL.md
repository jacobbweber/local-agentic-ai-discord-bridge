---
name: local-module-resolver
description: Use this skill to locate, document, and generate Import-Module statements for local modules in the ./modules folder.

---

# Instructions
* Scan the `./srcw/modules/` directory for `.psm1` or `.psd1` files.
* When the user asks to use a local module, generate the code to import it using a relative path.
* Ensure `RequiredModules` are identified within the manifest files of local modules.

# Example Logic
```powershell
$modulePath = Join-Path -Path $PSScriptRoot -ChildPath "..\modules\ZertoCore\ZertoCore.psd1"
Import-Module -Name $modulePath -Force