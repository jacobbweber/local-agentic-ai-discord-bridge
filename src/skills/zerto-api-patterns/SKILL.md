---
name: zerto-api-patterns
description: Provides standardized templates and JSON payload structures for interacting with the Zerto ZVM REST API.
---

# Instructions
* Use `Invoke-RestMethod` with standardized headers (e.g., `x-zerto-session`).
* Ensure all JSON payloads are validated against known Zerto API schemas (VPG settings, site details).
* Implement authentication refreshes if a 401 Unauthorized response is simulated or detected.

# Reference Patterns
* **GET VPGs:** `/v1/vpgs`
* **POST Failover Test:** `/v1/vpgs/{vpgIdentifier}/vms/failovertests`