# Implementation Plan: Direct Upload & Video Content Type

**Branch**: `007-direct-upload-video` | **Date**: 2026-03-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-direct-upload-video/spec.md`

## Summary

Replace the Vercel-proxied file upload (`/api/admin/upload`) with direct-to-Google-Drive uploads using the existing resumable upload session endpoint (`/api/admin/upload-session`). The browser obtains a session URI from the server (auth + CORS) then streams file bytes directly to Google Drive. Additionally, add a "Video" tab to the admin AddContent component with YouTube Link and Video File Upload sub-options. Introduces two-tier file size limits (2 GB soft / 5 GB hard) and auto-resume on failure (up to 3 retries).

## Technical Context

**Language/Version**: TypeScript 5.2.2 (strict mode)
**Primary Dependencies**: Next.js 15 (Pages Router), React 19, MUI v6, googleapis v118, Firebase Admin 13.7.0, Framer Motion 11.3.28
**Storage**: Google Drive (files via service account), MongoDB (users, classes — unchanged), Session cache (client-side in-memory, 5-min TTL)
**Testing**: No test framework configured; manual testing only. Storybook for UI component documentation.
**Target Platform**: Web (Vercel deployment), modern browsers (admin-only)
**Project Type**: Web application (Next.js Pages Router, SSR + API routes)
**Performance Goals**: Progress bar updates every 2s, page load < 3s (Constitution Principle I)
**Constraints**: Vercel serverless function body limit (current 50 MB — being bypassed), Google Drive resumable upload protocol, service account auth for Drive API
**Scale/Scope**: Admin-only feature, low concurrency (< 10 concurrent admins)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. User-Centered Performance | PASS | Direct upload eliminates serverless bottleneck. Progress bar preserved. Large file support improves admin experience. |
| II. TypeScript Strict | PASS | All new code will be TypeScript with explicit types. No `any` needed. |
| III. Component Reusability | PASS | Video tab extends existing AddContent component via new mode. Upload logic extracted into a reusable helper function shared across File and Video tabs. |
| IV. Performance & Caching | PASS | Reduces Vercel bandwidth to near-zero per upload. Optimistic UI cache pattern preserved. No new API calls on page render. |
| V. Simplicity (YAGNI) | PASS | Reuses existing upload-session endpoint. No new abstractions, npm dependencies, or database models. Direct upload is simpler than the current proxy approach. |

No gate violations. Proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/007-direct-upload-video/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api-changes.md   # API contract changes
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
src/
├── components/
│   └── admin/
│       └── AddContent.tsx          # MODIFY: Add Video tab, switch to direct upload
├── pages/
│   └── api/
│       └── admin/
│           ├── upload.ts           # DEPRECATE: No longer used for file transfer
│           ├── upload-session.ts   # MODIFY: Minor adjustments if needed
│           └── link.ts             # REUSE: For YouTube link file creation
├── lib/
│   ├── google-auth-write.ts        # READ-ONLY: Token generation
│   ├── auth-middleware.ts          # READ-ONLY: Authorization
│   ├── session-cache.ts            # READ-ONLY: Optimistic UI cache
│   └── constants.ts                # MODIFY: Add VIDEO_STAGING_FOLDER_ID, size limits
└── utils/
    ├── helpers.ts                  # MODIFY: Strip __{category}__{subject} from YouTube display names
    ├── upload.ts                   # NEW: Direct upload helper (resumable upload + progress + retry)
    └── types.ts                    # MODIFY: Add upload-related types if needed
```

**Structure Decision**: Follows existing Next.js Pages Router layout. One new utility file (`src/utils/upload.ts`) extracts direct upload logic into a reusable function shared by File tab and Video tab. All other changes are modifications to existing files.

## Complexity Tracking

No violations to justify. All changes use existing patterns and dependencies.
