# Research: Admin Class-Level Authorization

**Feature**: 006-admin-class-auth | **Date**: 2026-03-14

## R1: Authorization Pattern

**Decision**: Add a `requireAdminForClass(req, classId)` helper to `auth-middleware.ts` that centralizes the admin + class assignment check with super admin bypass.

**Rationale**: The codebase already has `requireAdmin()` and `requireSuperAdmin()`. The new helper extends this pattern by combining admin verification with class assignment validation. This avoids duplicating the check inline in every endpoint.

**Alternatives considered**:
- Inline check in each endpoint (rejected: code duplication, easy to forget super admin bypass)
- Middleware wrapper (rejected: Next.js Pages Router API routes don't support middleware chaining cleanly)
- Separate `verifyClassAccess()` utility (rejected: unnecessary indirection when extending existing auth module)

## R2: Frontend classId Availability

**Decision**: All vulnerable frontend components either already have `classId` available as a prop (AddContent, ContentList, admin/index.tsx) or can access it via `useAuth()` → `user?.assignedClassId`. The one exception is `ContentUploader.tsx` which needs `classId` added to its props interface.

**Rationale**: The admin dashboard page (`pages/admin/index.tsx`) already resolves `classId` from `user?.assignedClassId` and passes it to child components. ContentUploader receives `folderId` but not `classId` — adding it as a prop is trivial since the parent already has it.

**Alternatives considered**:
- Read classId from useAuth() inside ContentUploader (rejected: prop is more explicit and testable)
- Derive classId from folderId via server lookup (rejected: adds complexity and Drive API call; violates YAGNI)

## R3: Super Admin Bypass Strategy

**Decision**: The `requireAdminForClass()` helper will use `verifyAuth()` to get both the user and `isSuperAdmin` flag. If `isSuperAdmin` is true, skip the classId check entirely.

**Rationale**: `verifyAuth()` already returns `isSuperAdmin` based on email comparison. This is the established pattern — no new auth mechanism needed.

**Alternatives considered**:
- Check super admin inside each endpoint (rejected: duplication, already rejected in R1)
- Firebase custom claims for super admin (rejected: email check is simpler and already works)

## R4: Unused Endpoints

**Decision**: `upload-session` and `drive-folders` have no frontend callers but will still be secured with the classId check.

**Rationale**: These endpoints exist and are publicly accessible. Even without current frontend callers, they can be hit directly by anyone who knows the URL. Security must not depend on frontend obscurity.

**Alternatives considered**:
- Remove unused endpoints (rejected: they may be used by features in development on other branches)
- Ignore them (rejected: security vulnerability remains)
