# API Contract Changes: Admin Class-Level Authorization

**Feature**: 006-admin-class-auth | **Date**: 2026-03-14

## Summary

All admin endpoints that operate on class-specific data will enforce class assignment authorization. Endpoints that currently lack a `classId` parameter will require one. All changes are backward-compatible for correctly-authorized requests (admins operating on their own class).

## New Error Response (all endpoints below)

When an admin requests a class they are not assigned to:

```
HTTP 403
{ "error": "Admin not assigned to this class" }
```

## Endpoint Changes

### POST `/api/admin/link`

**Before**: `{ url, title, folderId }`
**After**: `{ url, title, folderId, classId }` — classId is now **required**

- Returns 400 if classId missing
- Returns 403 if classId !== user.assignedClassId (unless super admin)

---

### POST `/api/admin/upload`

**Before**: Query params `?fileName=...&folderId=...&mimeType=...`
**After**: Query params `?fileName=...&folderId=...&mimeType=...&classId=...` — classId is now **required**

- Returns 400 if classId missing
- Returns 403 if classId !== user.assignedClassId (unless super admin)

---

### POST `/api/admin/upload-session`

**Before**: `{ fileName, mimeType, folderId }`
**After**: `{ fileName, mimeType, folderId, classId }` — classId is now **required**

- Returns 400 if classId missing
- Returns 403 if classId !== user.assignedClassId (unless super admin)

---

### DELETE `/api/admin/drive-file`

**Before**: `{ fileId }`
**After**: `{ fileId, classId }` — classId is now **required**

- Returns 400 if classId missing
- Returns 403 if classId !== user.assignedClassId (unless super admin)

---

### GET `/api/admin/drive-folders`

**Before**: Query params `?subject=...`
**After**: Query params `?subject=...&classId=...` — classId is now **required**

- Returns 400 if classId missing
- Returns 403 if classId !== user.assignedClassId (unless super admin)

---

### GET `/api/admin/content`

**Before**: Query params `?classId=...&category=...` (classId accepted but **not validated**)
**After**: Same params, but classId is now **validated** against user.assignedClassId

- Returns 403 if classId !== user.assignedClassId (unless super admin)
- No parameter changes — just adds server-side validation

---

### POST `/api/admin/content`

**Before**: `{ type, classId, category, ... }` (classId accepted but **not validated**)
**After**: Same body, but classId is now **validated** against user.assignedClassId

- Returns 403 if classId !== user.assignedClassId (unless super admin)
- No parameter changes — just adds server-side validation

---

### PUT `/api/admin/categories`

**Before**: `{ folderId, newName }`
**After**: `{ folderId, newName, classId }` — classId is now **required**

- Returns 400 if classId missing
- Returns 403 if classId !== user.assignedClassId (unless super admin)

---

### DELETE `/api/admin/categories`

**Before**: Query params `?folderId=...`
**After**: Query params `?folderId=...&classId=...` — classId is now **required**

- Returns 400 if classId missing
- Returns 403 if classId !== user.assignedClassId (unless super admin)

## Unchanged Endpoints (already secure)

These endpoints already validate classId and require no changes:

- `GET /api/admin/subjects` — checks assignedClassId
- `POST /api/admin/subjects` — checks assignedClassId
- `GET /api/admin/categories` — checks assignedClassId
- `POST /api/admin/categories` — checks assignedClassId
- `DELETE /api/admin/content` — checks classId ownership on the item
