---
name: ps-pester-testing
description: Provides instructions and templates for generating and executing Pester 5 unit tests for PowerShell modules.
user-invocable: true
disable-model-invocation: false
---

# Intent
Ensure all PowerShell modules and functions are backed by deterministic Pester 5 tests, focusing on `Describe`, `Context`, and `It` blocks with proper mocking.

# When to use this skill
- When a user asks to "write tests" or "validate" a PowerShell script.
- When a newly generated function requires unit testing before deployment.

# Instructions
1. Group tests using a `Describe` block named after the function being tested.
2. Use `Context` blocks to differentiate between "Success" and "Failure" execution paths.
3. Use `Mock` to intercept external dependencies, especially `Invoke-RestMethod` or Active Directory cmdlets.
4. Name the test file identically to the source file, appended with `.Tests.ps1` (e.g., `Get-ZertoVPG.Tests.ps1`).

# Example Pester 5 Template
```powershell
BeforeAll {
    . $PSScriptRoot\..\src\Modules\Zerto.Core\Get-ZertoVPG.ps1
}

Describe "Get-ZertoVPG" {
    Context "When API returns a valid response" {
        BeforeAll {
            Mock Invoke-RestMethod { return @{ VpgIdentifier = "123" } }
        }
        It "Should return the VPG object" {
            $result = Get-ZertoVPG -VpgName "TestVPG"
            $result.VpgIdentifier | Should -Be "123"
        }
    }
}
```
