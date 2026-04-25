---
name: time-logger
description: Tracks time spent on tasks and generates weekly work summaries.
---

# Instructions

## 1. Log Time
- **Input**: `task_id`, `minutes`.
- **Action**: Use the `task-manager` update flow to increment `time_spent_minutes` on the matching task.

## 2. Generate Weekly Summary (The "For Work" Trigger)
- **Trigger**: User says "For work" or starts a message with "For work".
- **Action**:
    1. Use `read_file` on `secretary/tasks.json`.
    2. Filter tasks where `time_spent_minutes > 0` and created/updated within the last 7 days.
    3. For each task, look up `project_id` in `secretary/projects.json` to get the project name.
    4. Format output as a bulleted list:
       `* [Task Title] - [X hours Y minutes] (Project: [Project Name])`
    5. Return the formatted summary.

# Output
Present time logs as confirmations: "⏱️ Logged [X] minutes on [Task Title]".
Present weekly summaries with a header: "📋 **Weekly Work Summary**" followed by the bulleted list.
