---
name: map-api-dependencies
description: Sequences Zerto ZVM API calls and maps the data flow between endpoints.
---

# Logic Requirements
* **Session Management:** All sequences must begin by validating an active session or invoking the auth module.
* **Payload Mapping:** Explicitly map which fields from a `GET` request (e.g., `VpgIdentifier`) are required for a subsequent `POST` or `PUT`.
* **Error Scoping:** Identify specific Zerto error codes (e.g., 404 for missing VPG, 409 for task in progress) that the `@ps-dev` must handle in the `try/catch` blocks.

# Mapping Template
* **Step 1:** Call `GET /v1/vpgs` -> Extract `VpgIdentifier`.
* **Step 2:** Validate state -> `VpgState` must be 'MeetingSLA'.
* **Step 3:** Call `POST /v1/vpgs/{id}/failovertest`.