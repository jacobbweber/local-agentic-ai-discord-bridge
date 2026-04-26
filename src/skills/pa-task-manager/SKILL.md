---
name: pa-task-manager
description: Manages creation, retrieval, and updating of tasks within secretary/tasks.json.
user-invocable: true
disable-model-invocation: false
---

# Instructions

## 1. Create Task
- **Input**: `title`, `description`, `priority`, `project_id` (optional).
- **Action**:
    1. Use `read_file` on `secretary/tasks.json`.
    2. Generate a unique ID (use timestamp or short random string).
    3. Append the new task object with `status: "todo"`, `time_spent_minutes: 0`, and `created_at` as current ISO8601.
    4. Use `write_file` to save back to `secretary/tasks.json`.

## 2. Update Task Status/Time
- **Input**: `task_id`, `new_status` (optional), `additional_minutes` (optional).
- **Action**:
    1. Use `read_file` on `secretary/tasks.json`.
    2. Find the task by `id`.
    3. If `new_status` is provided, update `status`.
    4. If `additional_minutes` is provided, increment `time_spent_minutes`.
    5. Use `write_file` to save back.

## 3. List Tasks
- **Input**: `filter` (optional: status, project_id, priority).
- **Action**: Read and return tasks matching the filter. Format as a clean bulleted list.

# Output
Always confirm the action taken: "✅ Task created: [title]" or "✅ Task [id] updated to [status]".
