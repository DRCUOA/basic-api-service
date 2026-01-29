# API Testing with cURL

This document provides a set of cURL commands to test all CRUD operations for the Task API.

## Base URL

The API runs on `http://localhost:3000` by default (configurable via `PORT` environment variable).

All endpoints are prefixed with `/api`.

## Prerequisites

- API server must be running
- Database must be configured and migrations applied
- Tasks now use UUIDs as identifiers

---

## 1. Create Task (POST)

Create a new task with a title (required) and optional description and completed status.

### Minimal Request (title only)
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Completeroject documentation"
  }'
```

### Full Request (all fields)
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Review code changes",
    "description": "Review pull request #42 and provide feedback",
    "completed": false
  }'
```

### Create Completed Task
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Set up development environment",
    "description": "Install dependencies and configure local database",
    "completed": true
  }'
```

**Expected Response:** `201 Created`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Complete project documentation",
  "description": null,
  "completed": false,
  "createdAt": "2026-01-29T20:00:00.000Z",
  "updatedAt": "2026-01-29T20:00:00.000Z"
}
```

**Note:** Save the `id` from the response for use in UPDATE and DELETE operations.

---

## 2. List All Tasks (GET)

Retrieve all tasks from the database.

```bash
curl -X GET http://localhost:3000/api/tasks \
  -H "Content-Type: application/json"
```

**Expected Response:** `200 OK`
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Complete project documentation",
    "description": null,
    "completed": false,
    "createdAt": "2026-01-29T20:00:00.000Z",
    "updatedAt": "2026-01-29T20:00:00.000Z"
  },
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "title": "Review code changes",
    "description": "Review pull request #42",
    "completed": false,
    "createdAt": "2026-01-29T20:05:00.000Z",
    "updatedAt": "2026-01-29T20:05:00.000Z"
  }
]
```

---

## 3. Update Task (PATCH)

Update an existing task by its UUID. You can update any combination of fields.

**Important:** Replace `{TASK_UUID}` with an actual UUID from a created task.

### Update Title Only
```bash
curl -X PATCH http://localhost:3000/api/tasks/{TASK_UUID} \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated task title"
  }'
```

### Update Description
```bash
curl -X PATCH http://localhost:3000/api/tasks/{TASK_UUID} \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated description with more details"
  }'
```

### Mark Task as Completed
```bash
curl -X PATCH http://localhost:3000/api/tasks/{TASK_UUID} \
  -H "Content-Type: application/json" \
  -d '{
    "completed": true
  }'
```

### Update Multiple Fields
```bash
curl -X PATCH http://localhost:3000/api/tasks/{TASK_UUID} \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated task title",
    "description": "Updated description",
    "completed": true
  }'
```

**Expected Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Updated task title",
  "description": "Updated description",
  "completed": true,
  "createdAt": "2026-01-29T20:00:00.000Z",
  "updatedAt": "2026-01-29T20:10:00.000Z"
}
```

**Error Response (Task Not Found):** `500 Internal Server Error`
```json
{
  "error": "Failed to update task. Please try again later or contact support."
}
```

---

## 4. Delete Task (DELETE)

Delete a task by its UUID.

**Important:** Replace `{TASK_UUID}` with an actual UUID from a created task.

```bash
curl -X DELETE http://localhost:3000/api/tasks/{TASK_UUID} \
  -H "Content-Type: application/json"
```

**Expected Response:** `204 No Content` (empty body)

**Error Response (Task Not Found):** `500 Internal Server Error`
```json
{
  "error": "Failed to delete task. Please try again later or contact support."
}
```

---

## Complete Workflow Example

Here's a complete workflow that creates, lists, updates, and deletes a task:

```bash
# 1. Create a new task
RESPONSE=$(curl -s -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test task for API testing",
    "description": "This is a test task",
    "completed": false
  }')

# Extract the UUID from the response (requires jq)
TASK_UUID=$(echo $RESPONSE | jq -r '.id')
echo "Created task with UUID: $TASK_UUID"

# 2. List all tasks
curl -X GET http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" | jq

# 3. Update the task
curl -X PATCH http://localhost:3000/api/tasks/$TASK_UUID \
  -H "Content-Type: application/json" \
  -d '{
    "completed": true
  }' | jq

# 4. Delete the task
curl -X DELETE http://localhost:3000/api/tasks/$TASK_UUID \
  -H "Content-Type: application/json"

# 5. Verify deletion (should not appear in list)
curl -X GET http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" | jq
```

---

## Error Scenarios

### Invalid Request Body (Missing Title)
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Task without title"
  }'
```

**Expected Response:** `500 Internal Server Error`
```json
{
  "error": "Failed to create task. Please try again later or contact support."
}
```

### Invalid UUID Format
```bash
curl -X PATCH http://localhost:3000/api/tasks/invalid-uuid \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated title"
  }'
```

**Expected Response:** `500 Internal Server Error`

### Empty Title
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": ""
  }'
```

**Expected Response:** `500 Internal Server Error`

---

## Pretty Printing JSON Responses

For better readability, pipe responses through `jq`:

```bash
curl -X GET http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" | jq
```

Or use Python's json.tool:

```bash
curl -X GET http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" | python -m json.tool
```

---

## Notes

- All task IDs are now UUIDs (v4 format)
- The `id` field is auto-generated and should not be included in POST requests
- The `createdAt` and `updatedAt` fields are automatically managed
- PATCH requests allow partial updates (only send fields you want to change)
- All endpoints return JSON responses except DELETE (204 No Content)
