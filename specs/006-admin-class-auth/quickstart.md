# Quickstart: Admin Class-Level Authorization

**Feature**: 006-admin-class-auth | **Date**: 2026-03-14

## What This Feature Does

Adds missing authorization checks to admin API endpoints so that an admin assigned to one class cannot read, write, or delete data belonging to another class. The super admin retains full access to all classes.

## Implementation Approach

### 1. New Middleware Helper

Add `requireAdminForClass(req, classId)` to `src/lib/auth-middleware.ts`:
- Calls `verifyAuth(req)` to get user + isSuperAdmin
- If super admin → return user (allow all)
- If not admin → throw Forbidden
- If `user.assignedClassId !== classId` → throw Forbidden
- Return user

### 2. Backend Endpoint Updates (7 files)

For each vulnerable endpoint:
- Replace `await requireAdmin(req)` with `await requireAdminForClass(req, classId)`
- Add `classId` as a required parameter if not already present
- Ensure the check runs before any Drive API call or DB operation

**Files to modify:**
- `src/pages/api/admin/content.ts` (GET, POST)
- `src/pages/api/admin/categories.ts` (PUT, DELETE)
- `src/pages/api/admin/link.ts`
- `src/pages/api/admin/upload.ts`
- `src/pages/api/admin/upload-session.ts`
- `src/pages/api/admin/drive-file.ts`
- `src/pages/api/admin/drive-folders.ts`

### 3. Frontend Updates (4 files)

Pass `classId` in API calls that currently omit it:
- `src/components/admin/AddContent.tsx` — add classId to link, upload, drive-file calls
- `src/components/admin/ContentUploader.tsx` — add classId prop, pass to upload and drive-file calls
- `src/components/admin/ContentList.tsx` — add classId to drive-file DELETE call
- `src/pages/admin/index.tsx` — add classId to categories PUT/DELETE calls, pass classId prop to ContentUploader

## Testing

Manual testing checklist:
1. Log in as an admin assigned to a class → all operations on own class work normally
2. Attempt to call any admin endpoint with a different classId → all return 403
3. Log in as super admin → all operations on any class work
4. Admin with no assignedClassId → all class operations return 403
