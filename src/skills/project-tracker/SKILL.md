---
name: project-tracker
description: Manages high-level projects and links them to tasks in secretary/projects.json.
---

# Instructions

## 1. Create Project
- **Input**: `name`, `description`.
- **Action**:
    1. Use `read_file` on `secretary/projects.json`.
    2. Append new project with unique ID, `status: "active"`, and `created_at`.
    3. Use `write_file` to save back.

## 2. List Projects
- **Input**: `status` filter (optional).
- **Action**: Read and return projects, optionally filtered by status.

## 3. Link Task to Project
- **Input**: `task_id`, `project_id`.
- **Action**:
    1. Use `read_file` on `secretary/tasks.json`.
    2. Set `project_id` for the matching task.
    3. Use `write_file` to save back.

# Output
Confirm actions: "✅ Project created: [name]" or "✅ Task [id] linked to project [name]".
