# Data Model: Admin Class-Level Authorization

**Feature**: 006-admin-class-auth | **Date**: 2026-03-14

## Overview

No new entities or schema changes are required. This feature adds authorization logic using existing data model fields.

## Existing Entities Used

### User (MongoDB: `users`)

| Field | Type | Relevance |
|-------|------|-----------|
| `firebaseUid` | string | Unique identifier, used for token verification |
| `email` | string | Used for super admin identification |
| `isAdmin` | boolean | Gate for admin-level endpoints |
| `assignedClassId` | string (nullable) | **Key field** — links admin to their authorized class |

### Class (MongoDB: `classes`)

| Field | Type | Relevance |
|-------|------|-----------|
| `_id` | ObjectId | Target of authorization check — compared against `user.assignedClassId` |
| `class` | string | Display name |
| `data` | array | Semester/subject structure (not modified by this feature) |

## Authorization Flow

```
Request arrives
  → verifyAuth() → { user, isSuperAdmin }
  → if isSuperAdmin → ALLOW (skip class check)
  → if !user.isAdmin → DENY (403 Forbidden)
  → if user.assignedClassId !== requestedClassId → DENY (403 "Admin not assigned to this class")
  → if user.assignedClassId is null/undefined → DENY (403)
  → ALLOW → proceed with endpoint logic
```

## No Schema Migrations

- No new collections
- No new fields on existing collections
- No index changes
