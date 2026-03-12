# Implementation Plan: Admin Content Dashboard

**Branch**: `002-admin-dashboard` | **Date**: 2026-03-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-admin-dashboard/spec.md`

## Summary

Build an admin content dashboard where flagged admin users can upload content (files, links, easter eggs) to classes, and a super admin page (sudo-1337) restricted to mtolba2004@gmail.com for managing admin access and classes. Authentication via Firebase (Google sign-in only). File uploads use a Direct Client-to-Drive Resumable Upload pattern: the Vercel API route only generates a session URI, and the browser uploads directly to Google Drive, bypassing Vercel's payload and execution limits.

## Technical Context

**Language/Version**: TypeScript 5.2.2 (strict mode)
**Primary Dependencies**: Next.js 15 (Pages Router), React 19, MUI v6, Mongoose 8.4, googleapis 118 + NEW: firebase, firebase-admin
**Storage**: MongoDB (users, classes, content_items), Google Drive (files), IndexedDB (client cache via Dexie)
**Testing**: No test framework currently configured — manual testing workflow
**Target Platform**: Web (Vercel deployment)
**Project Type**: Web application (Next.js Pages Router)
**Performance Goals**: Admin pages load within 3s, upload session creation <2s, direct-to-Drive upload limited only by network speed
**Constraints**: Vercel serverless 4.5 MB body limit, 10s default timeout — mitigated by direct-to-Drive upload pattern
**Scale/Scope**: ~20 concurrent admin users, ~50+ classes in MongoDB

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. User-Centered Performance | PASS | Admin dashboard serves admins (not students), but follows same 3s load target. Direct-to-Drive upload eliminates Vercel bottleneck. |
| II. TypeScript Strict | PASS | All new code in TypeScript strict mode. No `any` types. |
| III. Component Reusability | PASS | Admin components (ContentUploader, ContentList, forms) designed as reusable MUI-based components with props. |
| IV. Performance & Caching | PASS | File uploads bypass Vercel entirely. Admin data fetched from MongoDB (no Drive API on every render). IndexedDB not needed for admin pages (small data set). |
| V. Simplicity (YAGNI) | PASS | Only 2 new dependencies (firebase, firebase-admin) — both required by spec. No unnecessary abstractions. Mongoose models are simple schemas. |

### Post-Design Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. User-Centered Performance | PASS | Upload session URI generated in <2s. File upload progress shown in UI. |
| II. TypeScript Strict | PASS | All models, API handlers, components, and hooks fully typed. |
| III. Component Reusability | PASS | AdminGuard and SuperAdminGuard are reusable wrappers. Content forms are composable. |
| IV. Performance & Caching | PASS | Google Drive API called only for folder listing (cacheable). No per-render Drive calls. |
| V. Simplicity (YAGNI) | PASS | No ORM abstraction over Mongoose. No state management library. Context + hooks pattern matches existing codebase. |

### New Dependencies Justification

| Dependency | Justification |
|------------|---------------|
| `firebase` | Required by spec: "Auth made by Firebase". Client-side Google sign-in. |
| `firebase-admin` | Required for server-side token verification in API routes. No alternative for Firebase Auth validation. |

## Project Structure

### Documentation (this feature)

```text
specs/002-admin-dashboard/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 research decisions
├── data-model.md        # MongoDB schemas
├── quickstart.md        # Developer setup guide
├── contracts/
│   └── api-routes.md    # API endpoint contracts
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── firebase-client.ts       # Firebase client SDK initialization
│   ├── firebase-admin.ts        # Firebase Admin SDK initialization
│   ├── google-auth-write.ts     # Google Auth with drive write scope (upload)
│   ├── google-auth.js           # (existing) read-only Drive auth
│   └── auth-middleware.ts       # verifyAuth, requireAdmin, requireSuperAdmin helpers
├── pages/
│   ├── admin/
│   │   └── index.tsx            # Admin content dashboard page
│   ├── sudo-1337/
│   │   └── index.tsx            # Super admin management page
│   └── api/
│       ├── auth/
│       │   └── login.ts         # Firebase token verify + user upsert
│       ├── admin/
│       │   ├── upload-session.ts # Generate resumable upload session URI
│       │   ├── content.ts       # CRUD for links/easter eggs (MongoDB)
│       │   ├── drive-file.ts    # Delete files from Google Drive
│       │   └── drive-folders.ts # List Drive category folders for a subject
│       └── sudo/
│           ├── users.ts         # Super admin: list/toggle user admin status
│           └── classes.ts       # Super admin: CRUD classes in MongoDB
├── context/
│   └── AuthContext.tsx          # Firebase auth state + user role context
├── hooks/
│   └── useAuth.ts              # Sign in, sign out, get token, check admin
└── components/
    └── admin/
        ├── AdminGuard.tsx       # Redirects non-admins away from admin routes
        ├── SuperAdminGuard.tsx  # Redirects non-super-admins from sudo-1337
        ├── ContentUploader.tsx  # File upload with resumable progress bar
        ├── LinkForm.tsx         # Add/edit URL link content
        ├── EasterEggForm.tsx    # Add/edit easter egg content
        ├── ContentList.tsx      # Unified content list (Drive files + MongoDB items)
        ├── UserManagement.tsx   # Admin flag toggle table
        └── ClassManagement.tsx  # Class CRUD interface
```

**Structure Decision**: Follows existing Pages Router convention. New files placed in existing directory structure (`lib/`, `pages/`, `context/`, `hooks/`, `components/`). Admin components grouped under `components/admin/`. API routes grouped by access level (`api/auth/`, `api/admin/`, `api/sudo/`).

## Key Architecture: Direct Client-to-Drive Resumable Upload

```
┌──────────┐     1. POST /api/admin/upload-session      ┌──────────────┐
│          │     { fileName, mimeType, folderId }        │              │
│  Browser │ ──────────────────────────────────────────► │ Vercel API   │
│  Client  │                                             │ Route        │
│          │ ◄────────────────────────────────────────── │              │
│          │     { sessionUri: "https://..." }            │ (auth only,  │
│          │                                             │  <2s, <1KB)  │
│          │     2. PUT file bytes directly               └──────────────┘
│          │ ──────────────────────────────────────────►  ┌──────────────┐
│          │     (progress events via XHR)                │ Google Drive │
│          │ ◄────────────────────────────────────────── │ API          │
│          │     { id, name, ... } (created file)        └──────────────┘
└──────────┘

The API route authenticates with a Google Service Account (drive write scope)
and creates a resumable upload session. The session URI is returned to the
client, which uploads file bytes directly to Google Drive. Vercel never
sees the file payload.
```

## Complexity Tracking

No constitution violations. No complexity tracking entries needed.
