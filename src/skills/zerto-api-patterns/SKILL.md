---
name: zerto-api-patterns
description: Provides standardized templates and header structures for Zerto ZVM REST API interactions.
user-invocable: true
disable-model-invocation: false
---

# Intent
Ensure all PowerShell HTTP interactions with the ZVM API follow consistent authentication, header injection, and schema mapping rules.

# When to use this skill
- When generating `Invoke-RestMethod` or `Invoke-WebRequest` calls targeting the ZVM.
- When an agent is confused about how to authenticate to the Zerto API.

# Instructions
1. Always inject the authorization header. For Zerto, this is typically `x-zerto-session`.
2. Construct the URI securely, avoiding hardcoded IP addresses. Rely on a configuration object or parameters (e.g., `$ZvmApiUri`).
3. Set the `Content-Type` to `application/json` for all POST/PUT operations.
4. Catch `[System.Net.WebException]` to handle 401 Unauthorized responses gracefully by triggering an authentication refresh.

# Reference Boilerplate
```powershell
$headers = @{
    "x-zerto-session" = $SessionKey
    "Accept"          = "application/json"
    "Content-Type"    = "application/json"
}

try {
    $response = Invoke-RestMethod -Uri "$ZvmApiUri/v1/vpgs" -Method Get -Headers $headers -ErrorAction Stop
    return $response
} catch {
    # Handle token expiration or network errors
    throw "Zerto API Request Failed: $_"
}
```
