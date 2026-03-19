# Data Model: Admin Content Dashboard

**Branch**: `002-admin-dashboard` | **Date**: 2026-03-12

## Entities

### User (new collection: `users`)

Stores authenticated users with admin privileges.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `_id` | ObjectId | auto | auto | MongoDB auto-generated |
| `firebaseUid` | string | yes | — | Firebase Auth UID (unique index) |
| `email` | string | yes | — | User's Google email (unique index) |
| `displayName` | string | yes | — | From Google profile |
| `photoURL` | string | no | null | Google profile photo URL |
| `isAdmin` | boolean | yes | false | Admin dashboard access flag |
| `createdAt` | Date | yes | now | First sign-in timestamp |
| `updatedAt` | Date | yes | now | Last profile update |

**Indexes**: `{ firebaseUid: 1 }` (unique), `{ email: 1 }` (unique)

**Validation rules**:
- `email` must be a valid email format
- `firebaseUid` must be non-empty string
- Super admin check: `email === "mtolba2004@gmail.com"` (hardcoded, not stored as a field)

**Lifecycle**:
- Created on first Google sign-in (upsert by `firebaseUid`)
- `isAdmin` toggled by super admin via sudo-1337
- Super admin cannot set their own `isAdmin` to false

### Class (existing collection: `classes`)

Already exists in MongoDB. Used as-is for class listing. Super admin gains CRUD access.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | auto | MongoDB auto-generated (used as "class key" in existing system) |
| `class` | string | yes | Class display name |
| `data` | array | yes | Semesters with subjects: `[{ index, subjects: [{ name, abbreviation }] }]` |

**No schema changes needed** — existing structure is sufficient. Super admin CRUD operates on this existing collection.

### ContentItem (new collection: `content_items`)

Stores non-file content (links and easter eggs). Files remain in Google Drive.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `_id` | ObjectId | auto | auto | MongoDB auto-generated |
| `type` | string (enum) | yes | — | `"link"` or `"easter_egg"` |
| `classId` | ObjectId | yes | — | Reference to `classes._id` |
| `category` | string | yes | — | Category name (matches Drive folder name) |
| `uploadedBy` | string | yes | — | Firebase UID of the uploading admin |
| `createdAt` | Date | yes | now | Creation timestamp |
| `updatedAt` | Date | yes | now | Last update timestamp |

**Type-specific fields (link)**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | yes | Display title for the link |
| `url` | string | yes | Full URL (validated) |

**Type-specific fields (easter_egg)**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | yes | Easter egg display name |
| `triggerDescription` | string | yes | How users discover/trigger it |
| `payload` | string | yes | The hidden content or instruction |

**Indexes**: `{ classId: 1, category: 1 }` (compound), `{ type: 1 }`

**Validation rules**:
- `type` must be one of: `"link"`, `"easter_egg"`
- `url` must be a valid URL (for links)
- `category` must be non-empty
- `classId` must reference an existing class

**Lifecycle**:
- Created by admin via content dashboard
- Deleted by admin (with confirmation)
- Replaced by uploading new content with same category + name

## Relationships

```
User (users)
  └── uploads → ContentItem (content_items) via uploadedBy = firebaseUid

Class (classes)
  └── contains → ContentItem (content_items) via classId = _id
  └── contains → Google Drive files (via subject name → folder lookup)

ContentItem (content_items)
  └── belongs to → Class via classId
  └── created by → User via uploadedBy
```

## Content Display Model (read-time)

When displaying content for a class + category, the admin dashboard merges:

1. **Google Drive files** — fetched via existing Drive API (by subject folder → category subfolder)
2. **MongoDB content items** — queried by `{ classId, category }` for links and easter eggs

This produces a unified content list per category without duplicating file storage.
