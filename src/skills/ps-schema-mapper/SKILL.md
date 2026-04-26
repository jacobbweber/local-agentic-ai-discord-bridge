---
name: ps-schema-mapper
description: Guides the extraction, analysis, and mapping of complex JSON schemas into flat, type-safe PowerShell Objects.
user-invocable: true
disable-model-invocation: false
---

# Intent
Ensure the transition from raw API JSON data to PowerShell objects is strongly typed and deterministic.

# When to use this skill
- When the `@system-analyst` agent is reviewing new Zerto API documentation or raw JSON payloads.
- When generating `[PSCustomObject]` definitions for REST API output.

# Instructions
1. Analyze the JSON hierarchy and flatten nested objects where practical using dot notation.
2. Explicitly map data types. `strings` remain `[string]`, but timestamps must be cast to `[DateTime]` and numbers to `[int]` or `[float]`.
3. Create a Markdown table containing: JSON Key, PowerShell Property Name (PascalCase), and Data Type.
4. Output a PowerShell script snippet demonstrating the object instantiation.

# Example Mapping
```markdown
| JSON Key | PS Property | Type |
|---|---|---|
| `vpgIdentifier` | `VpgIdentifier` | `[string]` |
| `actualRpo` | `ActualRpoSeconds` | `[int]` |
| `lastTest` | `LastTestTime` | `[DateTime]` |
```

```powershell
$obj = [PSCustomObject]@{
    VpgIdentifier    = [string]$json.vpgIdentifier
    ActualRpoSeconds = [int]$json.actualRpo
    LastTestTime     = [DateTime]$json.lastTest
}
```
