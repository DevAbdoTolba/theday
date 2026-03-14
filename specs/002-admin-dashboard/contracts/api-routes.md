# API Contracts: Admin Content Dashboard

**Branch**: `002-admin-dashboard` | **Date**: 2026-03-12

All admin and sudo API routes require `Authorization: Bearer <firebase-id-token>` header.

---

## Authentication

### POST `/api/auth/login`

Verifies Firebase ID token and returns/creates user record. Called on first sign-in and session refresh.

**Headers**: `Authorization: Bearer <firebase-id-token>`

**Response 200**:
```json
{
  "user": {
    "firebaseUid": "abc123",
    "email": "user@example.com",
    "displayName": "John Doe",
    "photoURL": "https://...",
    "isAdmin": false,
    "isSuperAdmin": false
  }
}
```

**Response 401**: `{ "error": "Invalid or expired token" }`

**Behavior**:
- Verifies Firebase ID token via `firebase-admin`
- Upserts user in MongoDB `users` collection (creates on first sign-in)
- Returns `isSuperAdmin: true` if `email === "mtolba2004@gmail.com"`
- Does NOT auto-grant admin flag — super admin must explicitly grant it

---

## Super Admin Routes (sudo-1337)

All routes check: token valid + `email === "mtolba2004@gmail.com"`. Returns 403 for any other user.

### GET `/api/sudo/users`

Lists all registered users with their admin status.

**Response 200**:
```json
{
  "users": [
    {
      "_id": "...",
      "email": "user@example.com",
      "displayName": "John Doe",
      "isAdmin": true,
      "createdAt": "2026-03-12T..."
    }
  ]
}
```

### PATCH `/api/sudo/users`

Toggle admin status for a user.

**Request body**:
```json
{
  "firebaseUid": "abc123",
  "isAdmin": true
}
```

**Response 200**: `{ "success": true, "user": { ... } }`
**Response 400**: `{ "error": "Cannot remove super admin privileges" }` (if targeting mtolba2004@gmail.com)
**Response 403**: `{ "error": "Forbidden" }`

### GET `/api/sudo/classes`

Lists all classes from MongoDB.

**Response 200**:
```json
{
  "classes": [
    {
      "_id": "...",
      "class": "Class of 2025",
      "data": [{ "index": 1, "subjects": [...] }]
    }
  ]
}
```

### POST `/api/sudo/classes`

Create a new class.

**Request body**:
```json
{
  "class": "Class of 2026",
  "data": []
}
```

**Response 201**: `{ "success": true, "class": { ... } }`

### PUT `/api/sudo/classes`

Update an existing class.

**Request body**:
```json
{
  "_id": "...",
  "class": "Updated Name",
  "data": [...]
}
```

**Response 200**: `{ "success": true, "class": { ... } }`

### DELETE `/api/sudo/classes`

Delete a class.

**Request body**:
```json
{
  "_id": "..."
}
```

**Response 200**: `{ "success": true }`
**Response 400**: `{ "error": "Class has content — delete content first" }` (safety check)

---

## Admin Routes

All routes check: token valid + `isAdmin === true` in MongoDB. Returns 403 for non-admins.

### POST `/api/admin/upload-session`

Creates a Google Drive resumable upload session URI. Does NOT receive the file — only metadata.

**Request body**:
```json
{
  "fileName": "lecture-notes.pdf",
  "mimeType": "application/pdf",
  "folderId": "google-drive-folder-id"
}
```

**Response 200**:
```json
{
  "sessionUri": "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&upload_id=..."
}
```

**Response 400**: `{ "error": "Missing required fields" }`
**Response 403**: `{ "error": "Forbidden" }`

**Notes**:
- The API route authenticates with the Google Service Account (write scope)
- The returned session URI is pre-authorized — the client uploads directly to it
- No file data passes through Vercel

### GET `/api/admin/content?classId=...&category=...`

Lists non-file content items (links, easter eggs) for a class + category.

**Response 200**:
```json
{
  "items": [
    {
      "_id": "...",
      "type": "link",
      "title": "Course Website",
      "url": "https://...",
      "category": "Resources",
      "uploadedBy": "abc123",
      "createdAt": "2026-03-12T..."
    },
    {
      "_id": "...",
      "type": "easter_egg",
      "name": "Hidden Quiz",
      "triggerDescription": "Click logo 5 times",
      "payload": "Bonus quiz content...",
      "category": "Resources",
      "uploadedBy": "abc123",
      "createdAt": "2026-03-12T..."
    }
  ]
}
```

### POST `/api/admin/content`

Create a link or easter egg content item.

**Request body (link)**:
```json
{
  "type": "link",
  "classId": "...",
  "category": "Resources",
  "title": "Course Website",
  "url": "https://example.com"
}
```

**Request body (easter_egg)**:
```json
{
  "type": "easter_egg",
  "classId": "...",
  "category": "Resources",
  "name": "Hidden Quiz",
  "triggerDescription": "Click logo 5 times",
  "payload": "Bonus quiz content..."
}
```

**Response 201**: `{ "success": true, "item": { ... } }`

### DELETE `/api/admin/content`

Delete a content item.

**Request body**:
```json
{
  "_id": "..."
}
```

**Response 200**: `{ "success": true }`

### DELETE `/api/admin/drive-file`

Delete a file from Google Drive.

**Request body**:
```json
{
  "fileId": "google-drive-file-id"
}
```

**Response 200**: `{ "success": true }`
**Response 404**: `{ "error": "File not found" }`

### GET `/api/admin/drive-folders?subject=...`

Lists category folders for a subject in Google Drive. Reuses existing Drive folder traversal logic.

**Response 200**:
```json
{
  "folders": [
    { "id": "folder-id-1", "name": "Lectures" },
    { "id": "folder-id-2", "name": "Assignments" }
  ]
}
```

---

## Auth Middleware Pattern

All admin/sudo API routes use a shared verification function:

```
verifyAuth(req) → { user, isSuperAdmin }
  1. Extract Bearer token from Authorization header
  2. Verify token via firebase-admin
  3. Lookup/upsert user in MongoDB users collection
  4. Return user record + super admin flag
```

```
requireAdmin(req) → { user }
  1. Call verifyAuth(req)
  2. Check user.isAdmin === true
  3. Return 403 if not admin

requireSuperAdmin(req) → { user }
  1. Call verifyAuth(req)
  2. Check user.email === "mtolba2004@gmail.com"
  3. Return 403 if not super admin
```
