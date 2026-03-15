# Implementation Plan: Admin Class-Level Authorization

**Branch**: `006-admin-class-auth` | **Date**: 2026-03-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-admin-class-auth/spec.md`

## Summary

Add class-level authorization checks to all admin API endpoints that currently lack them. Several endpoints allow any admin to operate on any class's data by simply changing the `classId` or `folderId` in the request. The fix follows the existing pattern already used in `subjects.ts` and `categories.ts` GET/POST: compare `user.assignedClassId` against the target `classId` before performing any operation. A new middleware helper `requireAdminForClass()` will centralize this check with super admin bypass. Frontend components must be updated to pass `classId` on calls that currently omit it.

## Technical Context

**Language/Version**: TypeScript 5.2.2 (strict mode)
**Primary Dependencies**: Next.js 15 (Pages Router), React 19, MUI v6, Mongoose 8.4, Firebase Admin 13.7.0
**Storage**: MongoDB (users, classes, content_items, subject_change_requests), Google Drive (files)
**Testing**: Manual testing (no automated test framework configured)
**Target Platform**: Vercel (Node.js serverless functions)
**Project Type**: Web application (Next.js Pages Router)
**Performance Goals**: N/A — authorization check is a string comparison; no measurable impact
**Constraints**: Authorization check must execute before any Drive API call or DB mutation
**Scale/Scope**: 7 API endpoint files, 4 frontend component files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. User-Centered Performance | PASS | No performance impact — adds a string comparison before existing logic |
| II. TypeScript Strict | PASS | All new code will use explicit types; no `any` |
| III. Component Reusability | PASS | New middleware helper is reusable across all admin endpoints |
| IV. Performance & Caching | PASS | No new API calls or cache changes |
| V. Simplicity (YAGNI) | PASS | Single helper function; follows existing pattern; no new abstractions |

All gates pass. No complexity violations.

## Project Structure

### Documentation (this feature)

```text
specs/006-admin-class-auth/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api-changes.md   # Endpoint contract changes
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── lib/
│   └── auth-middleware.ts          # ADD: requireAdminForClass() helper
├── pages/api/admin/
│   ├── content.ts                  # MODIFY: add classId check to GET, POST
│   ├── categories.ts              # MODIFY: add classId check to PUT, DELETE
│   ├── link.ts                    # MODIFY: require classId, add check
│   ├── upload.ts                  # MODIFY: require classId, add check
│   ├── upload-session.ts          # MODIFY: require classId, add check
│   ├── drive-file.ts              # MODIFY: require classId, add check
│   └── drive-folders.ts           # MODIFY: require classId, add check
├── components/admin/
│   ├── AddContent.tsx             # MODIFY: pass classId to link, upload, drive-file calls
│   ├── ContentUploader.tsx        # MODIFY: add classId prop, pass to upload, drive-file calls
│   └── ContentList.tsx            # MODIFY: pass classId to drive-file DELETE call
└── pages/admin/
    └── index.tsx                  # MODIFY: pass classId to categories PUT/DELETE, pass classId prop to ContentUploader
```

**Structure Decision**: No new files except the middleware helper addition to `auth-middleware.ts`. All changes modify existing files to add the missing authorization check.
