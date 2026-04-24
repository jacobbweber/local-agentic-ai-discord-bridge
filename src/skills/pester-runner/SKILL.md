---
name: pester-runner
description: Runs Pester test suites in controlled environments, handles test output formatting, and ensures compliance with repository testing standards.
argument-hint: "Test scope (unit|integration)"
---

# Pester Runner

## Procedural Capability
Defines the mechanism for executing and reporting test results inside the repository.

# Testing Policy
All automated testing within this repository uses **Pester (v5+)**.

## Code Coverage
- Minimum **80%** test coverage is required for all logic-heavy module functions.

## Mocking
- All network interactions, API requests (e.g., `Invoke-RestMethod`), and complex environmental boundaries MUST be mocked using Pester's `Mock` block. Tests must be fast and deterministic without external dependencies.

## Structure
- Test files must end in `.Tests.ps1` and live alongside the code they test (e.g., `src/Modules/<Name>/tests/`).
- Utilize `BeforeAll`/`AfterAll` blocks for environment setup within test execution.
- `Describe` and `Context` strings should ideally match the requirements and scenarios mapped out during intake.

## Integration Tests
- Integration tests can exist in `src/Controller/tests/integration/` but must target safe sandboxes and avoid mutating production environments.

## Steps
1. Import `Pester` module.
2. Determine execution context based on input parameter (Unit vs Integration).
3. For Unit tests: Run `Invoke-Pester -Path src/Modules/ -Output Detailed`.
4. For Integration tests: Activate sandbox mode and execute `Invoke-Pester -Path src/Controller/tests/integration/`.
5. Validate zero failures and log results to `.github/artifacts/test-report.txt`.

