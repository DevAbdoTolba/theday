# Tasks: Admin Class-Level Authorization

**Input**: Design documents from `/specs/006-admin-class-auth/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-changes.md

**Tests**: Not requested — manual testing only (see quickstart.md).

**Organization**: Tasks are grouped by user story. US2 and US3 are combined into one phase because they modify overlapping frontend files.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Foundational (Blocking Prerequisite)

**Purpose**: Create the shared authorization helper that all endpoint fixes depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T001 Add `requireAdminForClass(req, classId)` helper to `src/lib/auth-middleware.ts` — calls `verifyAuth()`, returns user if super admin (bypass), throws Forbidden if not admin or if `user.assignedClassId !== classId` or if assignedClassId is null/undefined

**Checkpoint**: Helper is exported and ready for use by all admin endpoints

---

## Phase 2: User Story 1 - Admin Cannot Modify Another Class's Content (Priority: P1) 🎯 MVP

**Goal**: Prevent admins from reading or creating content items for classes they are not assigned to

**Independent Test**: Send a POST to `/api/admin/content` with a classId different from the admin's assignedClassId → expect 403. Send with own classId → expect success.

### Implementation for User Story 1

- [X] T002 [US1] Add classId authorization check to GET handler in `src/pages/api/admin/content.ts` — replace `requireAdmin(req)` with `requireAdminForClass(req, classId)` after extracting classId from query params (classId is already sent by frontend)
- [X] T003 [US1] Add classId authorization check to POST handler in `src/pages/api/admin/content.ts` — replace `requireAdmin(req)` with `requireAdminForClass(req, classId)` after extracting classId from request body (classId is already sent by frontend)

**Checkpoint**: Content GET and POST reject cross-class requests with 403. Content DELETE already has its own classId check and is unchanged.

---

## Phase 3: User Stories 2 & 3 - Drive Upload/Link/Delete Authorization (Priority: P1)

**Goal**: Prevent admins from uploading files, creating links, deleting files, or modifying category folders in classes they are not assigned to

**Independent Test**: Send a POST to `/api/admin/link` with a classId different from the admin's assignedClassId → expect 403. Send a DELETE to `/api/admin/drive-file` with a different classId → expect 403. Send with own classId → expect success.

**Note**: US2 and US3 are combined because they modify overlapping frontend files (AddContent.tsx, ContentUploader.tsx, admin/index.tsx).

### Backend Implementation (all parallelizable — different files)

- [X] T004 [P] [US2] Add classId as required body field and authorization check to `src/pages/api/admin/link.ts` — replace `requireAdmin(req)` with `requireAdminForClass(req, classId)`, return 400 if classId missing
- [X] T005 [P] [US2] Add classId as required query param and authorization check to `src/pages/api/admin/upload.ts` — replace `requireAdmin(req)` with `requireAdminForClass(req, classId)`, return 400 if classId missing
- [X] T006 [P] [US2] Add classId as required body field and authorization check to `src/pages/api/admin/upload-session.ts` — replace `requireAdmin(req)` with `requireAdminForClass(req, classId)`, return 400 if classId missing
- [X] T007 [P] [US3] Add classId as required body field and authorization check to `src/pages/api/admin/drive-file.ts` — replace `requireAdmin(req)` with `requireAdminForClass(req, classId)`, return 400 if classId missing
- [X] T008 [P] [US3] Add classId authorization check to PUT handler in `src/pages/api/admin/categories.ts` — add classId as required body field, replace `requireAdmin(req)` with `requireAdminForClass(req, classId)`
- [X] T009 [P] [US3] Add classId authorization check to DELETE handler in `src/pages/api/admin/categories.ts` — add classId as required query param, replace `requireAdmin(req)` with `requireAdminForClass(req, classId)`

### Frontend Implementation (all parallelizable — different files)

- [X] T010 [P] [US2] Update `src/components/admin/AddContent.tsx` — include `classId` in the POST `/api/admin/link` body, the POST `/api/admin/upload` query params, and the DELETE `/api/admin/drive-file` body (classId is already available as a prop)
- [X] T011 [P] [US2] Update `src/components/admin/ContentUploader.tsx` — add `classId: string` to `ContentUploaderProps` interface, include classId in the POST `/api/admin/upload` query params and the DELETE `/api/admin/drive-file` body
- [X] T012 [P] [US3] Update `src/components/admin/ContentList.tsx` — include `classId` in the DELETE `/api/admin/drive-file` body (classId is already available as a prop)
- [X] T013 [US3] Update `src/pages/admin/index.tsx` — include `classId` in the PUT `/api/admin/categories` body, include `classId` in the DELETE `/api/admin/categories` query params, and pass `classId` prop to `<ContentUploader>` component

**Checkpoint**: All Drive-based endpoints (link, upload, upload-session, drive-file) and categories PUT/DELETE reject cross-class requests with 403. Frontend passes classId on all calls.

---

## Phase 4: User Story 4 - Admin Cannot Browse Another Class's Drive Folders (Priority: P2)

**Goal**: Prevent admins from listing drive folders for classes they are not assigned to

**Independent Test**: Send a GET to `/api/admin/drive-folders` with a classId different from the admin's assignedClassId → expect 403.

### Implementation for User Story 4

- [X] T014 [US4] Add classId as required query param and authorization check to `src/pages/api/admin/drive-folders.ts` — replace `requireAdmin(req)` with `requireAdminForClass(req, classId)`, return 400 if classId missing (no frontend callers exist — backend-only fix)

**Checkpoint**: Drive folder browsing rejects cross-class requests. No frontend changes needed (endpoint has no frontend callers).

---

## Phase 5: User Story 5 - Super Admin Bypass Verification (Priority: P2)

**Goal**: Confirm that the super admin can operate on any class across all secured endpoints without being blocked

**Independent Test**: Log in as super admin → call every admin endpoint with any classId → all succeed regardless of assignedClassId.

### Implementation for User Story 5

- [X] T015 [US5] Verify super admin bypass is correctly implemented in the `requireAdminForClass()` helper in `src/lib/auth-middleware.ts` — ensure `isSuperAdmin` check precedes classId comparison and allows all operations (this logic was built into T001; this task is validation only)

**Checkpoint**: Super admin retains full access to all classes across all endpoints.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup

- [ ] T016 Run full manual testing checklist from `specs/006-admin-class-auth/quickstart.md` — test all 4 scenarios (admin own class, admin cross-class, super admin, admin with no assignedClassId)
- [ ] T017 Verify existing secure endpoints are unchanged — confirm `subjects.ts` GET/POST, `categories.ts` GET/POST, and `content.ts` DELETE still work correctly with no regressions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — start immediately
- **US1 (Phase 2)**: Depends on Phase 1 (T001)
- **US2+US3 (Phase 3)**: Depends on Phase 1 (T001). Can run in parallel with Phase 2.
- **US4 (Phase 4)**: Depends on Phase 1 (T001). Can run in parallel with Phases 2-3.
- **US5 (Phase 5)**: Depends on all previous phases (validation of everything)
- **Polish (Phase 6)**: Depends on all previous phases

### User Story Dependencies

- **US1 (P1)**: Can start after T001 — no dependencies on other stories
- **US2+US3 (P1)**: Can start after T001 — no dependencies on other stories. Can run in parallel with US1.
- **US4 (P2)**: Can start after T001 — no dependencies on other stories
- **US5 (P2)**: Depends on US1, US2, US3, US4 all being complete (validation pass)

### Parallel Opportunities

- T002 and T003 can run sequentially (same file: content.ts) but Phase 2 can run in parallel with Phase 3
- T004, T005, T006, T007 can all run in parallel (different backend files)
- T008, T009 modify same file (categories.ts) — run sequentially
- T010, T011, T012, T013 can all run in parallel (different frontend files)
- Phases 2, 3, and 4 can all start in parallel after T001

---

## Parallel Example: Phase 3 Backend

```
# Launch all backend endpoint fixes in parallel (different files):
T004: Add classId check to src/pages/api/admin/link.ts
T005: Add classId check to src/pages/api/admin/upload.ts
T006: Add classId check to src/pages/api/admin/upload-session.ts
T007: Add classId check to src/pages/api/admin/drive-file.ts
T008: Add classId check to PUT in src/pages/api/admin/categories.ts
```

```
# Then launch all frontend updates in parallel (different files):
T010: Update src/components/admin/AddContent.tsx
T011: Update src/components/admin/ContentUploader.tsx
T012: Update src/components/admin/ContentList.tsx
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete T001: `requireAdminForClass()` helper
2. Complete T002-T003: Content endpoint authorization
3. **STOP and VALIDATE**: Test content endpoint independently
4. The most direct vulnerability (content manipulation) is now closed

### Incremental Delivery

1. T001 → Foundation ready
2. T002-T003 → US1 complete (content auth) → Validate
3. T004-T013 → US2+US3 complete (Drive operations auth) → Validate
4. T014 → US4 complete (Drive folder browsing auth) → Validate
5. T015-T017 → US5 + polish → Full validation

### Full Parallel Strategy

1. Complete T001
2. In parallel: US1 (T002-T003) | US2+US3 backend (T004-T009) | US4 (T014)
3. After backend: US2+US3 frontend (T010-T013) in parallel
4. US5 validation (T015) + Polish (T016-T017)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- T008 and T009 modify the same file (categories.ts) — run sequentially within their parallel group
- T013 is the only non-parallelizable frontend task (admin/index.tsx depends on ContentUploader prop change in T011)
- No new npm dependencies required
- No database migrations required
- Commit after each phase checkpoint
