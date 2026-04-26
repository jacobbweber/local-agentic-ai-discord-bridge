---
name: pa-idea-vault
description: Lightweight repository for capturing thoughts, brainstorms, and ideas in secretary/ideas.json.
user-invocable: true
disable-model-invocation: false
---

# Instructions

## 1. Capture Idea
- **Input**: `content`, `tags` (optional).
- **Action**:
    1. Use `read_file` on `secretary/ideas.json`.
    2. Create a new idea object with unique ID, timestamp, and optional tags.
    3. Use `write_file` to save back.

## 2. Retrieve Ideas
- **Input**: `tag` (optional).
- **Action**: Read `secretary/ideas.json`, filter by tag if provided, return list.

## 3. Search Ideas
- **Input**: `keyword`.
- **Action**: Filter ideas where `content` contains the keyword.

# Output
Confirm captures: "💡 Idea saved: [first 50 chars]..." and list ideas in a clean bulleted format.
