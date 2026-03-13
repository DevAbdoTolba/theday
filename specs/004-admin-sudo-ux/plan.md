# Implementation Plan: Admin & Sudo UX Enhancement

**Branch**: `004-admin-sudo-ux` | **Date**: 2026-03-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-admin-sudo-ux/spec.md`

## Summary

Enhance the admin and sudo-1337 panels with a subject approval workflow, category/content CRUD, cross-class content sharing, and AAA-level card/tab UI replacing all dropdown-based navigation. New `SubjectChangeRequest` collection stores pending subject operations. Admin pages are rebuilt with card grids and inline editing; sudo-1337 panel gains a pending approvals section. All primary selection uses cards/tabs/segments — zero dropdowns.

## Technical Context

**Language/Version**: TypeScript 5.2.2 (strict mode)
**Primary Dependencies**: Next.js 15 (Pages Router), React 19, MUI v6, Mongoose 8.4, Firebase 12.10.0, Firebase Admin 13.7.0, googleapis 118, Framer Motion, Dexie (IndexedDB)
**Storage**: MongoDB (users, classes, content_items, subject_change_requests [new]), Google Drive (files), IndexedDB (client cache)
**Testing**: No test framework currently installed — manual verification via acceptance scenarios
**Target Platform**: Web (Vercel deployment)
**Project Type**: Web application (Next.js Pages Router — fullstack)
**Performance Goals**: Primary content load < 3s (constitution P-I), login-to-upload < 30s (SC-001), pending review < 10s/item (SC-003), zero layout shifts (SC-004)
**Constraints**: No `any` types (constitution P-II), MUI sx/theme tokens only (P-III), new API calls must document cache strategy (P-IV), YAGNI (P-V)
**Scale/Scope**: Small educational platform — ~10-50 admins, 1 sudo-1337, ~50-200 classes, ~10-30 subjects per class

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. User-Centered Performance | PASS | Card/tab UI eliminates dropdown round-trips. Skeleton loading for all views (FR-020). SC-001 targets < 30s login-to-upload. |
| II. TypeScript Strict | PASS | All new models, components, API routes will be strict-typed. No `any`. |
| III. Component Reusability | PASS | Subject cards, category tabs, pending badge, approval cards are all reusable MUI-composed components. |
| IV. Performance & Caching | PASS | Pending change requests are low-volume — no caching needed. Class/subject data already cached via IndexedDB (Dexie). New API calls documented in contracts. |
| V. Simplicity (YAGNI) | PASS | No new abstractions beyond what's needed. SubjectChangeRequest is a flat collection. Polling for approval updates (no SSE/WebSocket complexity). |

**Gate result: PASS — proceed to Phase 0.**

### Post-Phase 1 Re-Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. User-Centered Performance | PASS | All new endpoints target < 500ms. Polling at 30s interval is negligible. Skeleton loaders specified. |
| II. TypeScript Strict | PASS | All new interfaces fully typed (SubjectChangeRequest, updated ISubject). No `any` in contracts. |
| III. Component Reusability | PASS | 10 new reusable components (SubjectCard, CategoryTabs, PendingBadge, etc.) all composing MUI primitives. SubjectForm reused for create and edit. |
| IV. Performance & Caching | PASS | Load-time impact documented in api-contracts.md. SWR caching strategy for all read endpoints. IndexedDB patterns preserved. |
| V. Simplicity (YAGNI) | PASS | Single flat collection (SubjectChangeRequest). Polling over SSE/WebSocket. localStorage for dismissal. No new abstractions beyond direct needs. |

**Post-design gate: PASS.**

## Project Structure

### Documentation (this feature)

```text
specs/004-admin-sudo-ux/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api-contracts.md
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── models/
│   │   ├── user.ts                    # Existing — no changes needed
│   │   ├── class.ts                   # Update: add shared flag to ISubject
│   │   ├── content-item.ts            # Existing — no changes needed
│   │   └── subject-change-request.ts  # NEW: pending subject CRUD model
│   ├── auth-middleware.ts             # Existing — no changes needed
│   ├── firebase-admin.ts             # Existing
│   ├── firebase-client.ts            # Existing
│   └── google-auth-write.ts          # Existing
├── pages/
│   ├── admin/
│   │   └── index.tsx                  # REWRITE: card grid UI, subject detail view
│   ├── sudo-1337/
│   │   └── index.tsx                  # REWRITE: card UI + pending approvals section
│   └── api/
│       ├── admin/
│       │   ├── subjects.ts            # NEW: subject change request CRUD for admins
│       │   ├── categories.ts          # NEW: category CRUD within subjects
│       │   ├── classes.ts             # Existing
│       │   ├── content.ts             # Existing
│       │   ├── drive-file.ts          # Existing
│       │   ├── drive-folders.ts       # Existing
│       │   └── upload-session.ts      # Existing
│       └── sudo/
│           ├── approvals.ts           # NEW: approve/reject pending subject changes
│           ├── classes.ts             # Existing
│           └── users.ts              # Existing
├── components/
│   └── admin/
│       ├── AdminGuard.tsx             # Existing
│       ├── AuthGuard.tsx              # Existing
│       ├── SuperAdminGuard.tsx        # Existing
│       ├── SubjectCard.tsx            # NEW: subject display card with pending badges
│       ├── SubjectGrid.tsx            # NEW: grid layout for subject cards
│       ├── SubjectForm.tsx            # NEW: create/edit subject inline form
│       ├── CategoryTabs.tsx           # NEW: horizontal tabs for categories
│       ├── ContentPanel.tsx           # NEW: content list within a category tab
│       ├── PendingBadge.tsx           # NEW: reusable badge for pending/rejected states
│       ├── ApprovalCard.tsx           # NEW: pending change card for sudo-1337 panel
│       ├── ApprovalList.tsx           # NEW: list of pending approvals
│       ├── ClassCard.tsx              # NEW: class display card for sudo-1337
│       ├── ClassGrid.tsx              # NEW: grid layout for class cards
│       ├── SkeletonGrid.tsx           # NEW: skeleton loader for card grids
│       ├── UserManagement.tsx         # Existing — update to card-based UI
│       ├── ClassManagement.tsx        # Existing — replace with ClassCard/ClassGrid
│       ├── ContentList.tsx            # Existing — integrate into ContentPanel
│       ├── ContentUploader.tsx        # Existing — integrate into ContentPanel
│       ├── LinkForm.tsx               # Existing
│       └── EasterEggForm.tsx          # Existing
├── hooks/
│   ├── useAuth.ts                     # Existing
│   ├── useSubjectChanges.ts          # NEW: fetch/mutate subject change requests
│   └── useApprovals.ts               # NEW: fetch/mutate approvals for sudo-1337
└── utils/
    └── types.ts                       # Update: add SubjectChangeRequest types
```

**Structure Decision**: Follows existing Next.js Pages Router monolith structure. New files are added alongside existing ones — no new directories beyond what already exists. Components follow the existing `src/components/admin/` pattern.

## Complexity Tracking

> No constitution violations detected. All new patterns (SubjectChangeRequest collection, card grid components, approval workflow) are simple, flat, and directly required by the spec.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
