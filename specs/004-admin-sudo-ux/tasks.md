# Tasks: Admin & Sudo UX Enhancement

**Input**: Design documents from `/specs/004-admin-sudo-ux/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not requested — manual verification via acceptance scenarios.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project (Next.js monolith)**: `src/` at repository root
- Models: `src/lib/models/`
- API routes: `src/pages/api/`
- Components: `src/components/admin/`
- Hooks: `src/hooks/`
- Types: `src/utils/types.ts`
- Pages: `src/pages/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Type definitions and schema updates that all user stories depend on

- [x] T001 Add SubjectChangeRequest and related TypeScript types to src/utils/types.ts — include ISubjectChangeRequest interface (all fields from data-model.md), ChangeType union, ChangeStatus union, and SubjectWithPending display type
- [x] T002 [P] Update ISubject interface in src/lib/models/class.ts — add `shared: { type: Boolean, default: false }` field to the subjects subdocument schema and update the ISubject TypeScript interface

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core model and reusable components that MUST be complete before ANY user story can be implemented

- [x] T003 Create SubjectChangeRequest Mongoose model in src/lib/models/subject-change-request.ts — define ISubjectChangeRequest interface, schema with all fields from data-model.md (classId ref, changeType enum, subjectName, subjectAbbreviation, shared, semesterIndex, originalSubjectName, originalSubjectAbbreviation, status enum, requestedBy, reviewedBy, reviewedAt), compound indexes ({ classId: 1, status: 1 }, { status: 1, createdAt: -1 }, { requestedBy: 1, status: 1 }), and timestamps
- [x] T004 [P] Create SkeletonGrid component in src/components/admin/SkeletonGrid.tsx — reusable MUI Skeleton-based grid loader that accepts `count` and `cardHeight` props, renders MUI Skeleton rectangles in a responsive CSS Grid matching the card grid layout used across admin and sudo-1337 pages (FR-020)
- [x] T005 [P] Create PendingBadge component in src/components/admin/PendingBadge.tsx — reusable MUI Chip-based badge that accepts `status` prop ("pending" | "rejected" | "pending_edit" | "pending_delete"), renders appropriate color and label ("Pending Approval", "Pending Edit", "Pending Deletion", "Rejected"), and includes a dismiss button for rejected badges that calls an onDismiss callback (FR-006, FR-015)

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Admin Manages Subjects with Approval (Priority: P1) MVP

**Goal**: Admin sees assigned class and subjects as cards, can create/edit/delete subjects that enter pending state, can edit/cancel own pending changes. No class selector — auto-locked to assigned class.

**Independent Test**: Sign in as admin with assigned class → see subject cards → create subject → see "Pending Approval" badge → edit pending → cancel pending → verify no student visibility.

### Implementation for User Story 1

- [x] T006 [P] [US1] Create useSubjectChanges hook in src/hooks/useSubjectChanges.ts — custom hook that fetches GET /api/admin/subjects?classId={classId} with 30s polling interval, provides subjects and pendingChanges arrays, exposes createChange, updateChange, cancelChange mutation functions that POST/PUT/DELETE to /api/admin/subjects and trigger refetch, manages loading/error state, and reads dismissed rejections from localStorage to filter rejected items
- [x] T007 [P] [US1] Implement GET /api/admin/subjects endpoint in src/pages/api/admin/subjects.ts — requireAdmin middleware, accept classId query param, verify admin's assignedClassId matches, fetch class from MongoDB to get active subjects from data[].subjects[], fetch pending+rejected SubjectChangeRequests for this classId from subject_change_requests collection, return combined response per api-contracts.md GET shape
- [x] T008 [US1] Implement POST /api/admin/subjects endpoint in src/pages/api/admin/subjects.ts — requireAdmin middleware, validate request body (changeType, subjectName, subjectAbbreviation, semesterIndex, shared, originalSubjectName for edit/delete), enforce subject name uniqueness within class (query classes collection), check admin's assignedClassId matches classId, create SubjectChangeRequest with status "pending" and requestedBy from auth, return 201 with created document
- [x] T009 [US1] Implement PUT and DELETE handlers in src/pages/api/admin/subjects.ts — PUT: accept id query param, verify request is pending and requestedBy matches current admin, update allowed fields (subjectName, subjectAbbreviation, shared, semesterIndex), return updated document. DELETE: accept id query param, verify request is pending and requestedBy matches, delete document, return { deleted: true }. Both return 403 if not owner or not pending, 404 if not found
- [x] T010 [P] [US1] Implement GET /api/admin/subjects/check-name endpoint in src/pages/api/admin/subjects/check-name.ts — requireAdmin middleware, accept classId and name query params, search all classes for subjects with matching name (case-insensitive) excluding the requesting class, return { existsInOtherClasses: boolean, matchingClasses: [{ classId, className }] } per api-contracts.md
- [x] T011 [P] [US1] Create SubjectCard component in src/components/admin/SubjectCard.tsx — MUI Card displaying subject name, abbreviation, and semester index. Show PendingBadge overlay when subject has a pending change. For active subjects: show edit (pencil) and delete (trash) icon buttons that call onRequestEdit and onRequestDelete callbacks. For pending subjects: show edit and cancel icon buttons. Use MUI sx prop and theme tokens, Framer Motion for hover/tap feedback. Accept subject data, pendingChange data, and callback props
- [x] T012 [P] [US1] Create SubjectForm component in src/components/admin/SubjectForm.tsx — inline MUI form (not modal) for creating or editing a subject. Fields: subject name (TextField), abbreviation (TextField), semester selector (segmented buttons, not dropdown). Include real-time subject name uniqueness check via debounced call to /api/admin/subjects/check-name — if name exists in another class, show inline MUI Alert with "Create as shared?" toggle (FR-005b). Accept mode prop ("create" | "edit"), initialValues for edit mode, onSubmit and onCancel callbacks. Validate required fields before submit
- [x] T013 [US1] Create SubjectGrid component in src/components/admin/SubjectGrid.tsx — responsive MUI CSS Grid layout that renders SubjectCard components for active subjects and pending create requests. Include a prominent "Add Subject" card (dashed border, plus icon) that toggles SubjectForm inline (not modal). Accept subjects array, pendingChanges array, and CRUD callback props. Show SkeletonGrid while loading. Group subjects by semesterIndex with visual section headers
- [x] T014 [US1] Rewrite admin dashboard page src/pages/admin/index.tsx — replace existing dropdown-based UI with card grid layout. On mount: use useAuth to get assignedClassId, use useSubjectChanges hook with that classId. Layout: DashboardHeader showing class name prominently (FR-001), SubjectGrid below. If no assignedClassId: show "No class assigned — contact sudo-1337" empty state (FR-010). Wire SubjectGrid callbacks to useSubjectChanges mutations. Handle 403 errors (class unassigned during session) by showing empty state. Keep AdminGuard wrapper. Remove all dropdown selectors for class/subject

**Checkpoint**: Admin can view subjects as cards, create/edit/delete subjects with pending state, edit/cancel own pending changes. No categories or content yet.

---

## Phase 4: User Story 2 — Admin Manages Categories & Content Freely (Priority: P2)

**Goal**: After clicking a subject card, admin sees categories as horizontal tabs, can CRUD categories (Drive folders), and manage content (upload, links, easter eggs) inline — all immediate, no approval.

**Independent Test**: Click active subject card → see category tabs → create category → upload file → add link → add easter egg → delete content → rename category → delete category.

**Depends on**: US1 (admin page structure with SubjectGrid/SubjectCard to navigate into subject detail)

### Implementation for User Story 2

- [x] T015 [P] [US2] Implement GET /api/admin/categories endpoint in src/pages/api/admin/categories.ts — requireAdmin middleware, accept classId and subject (abbreviation) query params, use existing Google Drive API integration (reference src/pages/api/admin/drive-folders.ts pattern) to list folders for the subject, return { categories: [{ name, folderId }] } per api-contracts.md. Add Cache-Control header (max-age=60, stale-while-revalidate=300) to avoid hitting Google Drive API on every request. Client-side consumer should use SWR with 60s revalidation interval (constitution P-IV: Drive API MUST NOT be called on every render without caching)
- [x] T016 [US2] Implement POST /api/admin/categories endpoint in src/pages/api/admin/categories.ts — requireAdmin middleware, accept classId, subjectAbbreviation, categoryName in body, create Google Drive folder using existing write access pattern (reference src/lib/google-auth-write.ts), return 201 with { name, folderId }
- [x] T017 [US2] Implement PUT and DELETE handlers in src/pages/api/admin/categories.ts — PUT: accept folderId and newName in body, rename Google Drive folder via API, return { name, folderId }. DELETE: accept folderId query param, delete Google Drive folder and its contents, also delete matching content_items from MongoDB (classId + category matching the folder name), return { deleted: true }
- [x] T018 [P] [US2] Create CategoryTabs component in src/components/admin/CategoryTabs.tsx — horizontal MUI Tabs (not dropdown) displaying category names. Include "+" tab for adding new category (inline TextField that appears on click, not modal). Support rename on double-click (inline edit) and delete via context action (small icon button with tooltip confirmation, not modal — FR-021). Accept categories array, activeCategory, onChange, onAdd, onRename, onDelete callbacks. Use Framer Motion for tab transitions
- [x] T019 [US2] Create ContentPanel component in src/components/admin/ContentPanel.tsx — container below CategoryTabs that shows content for the active category. Integrate existing ContentList, ContentUploader, LinkForm, and EasterEggForm components. Layout: upload area at top, content list below. Pass classId and current category to child components. Show empty state when category has no content. All content operations (upload, add link, add easter egg, delete) take effect immediately with inline feedback (snackbar for success, inline error for failure). Use Framer Motion AnimatePresence for smooth content item add/remove transitions (FR-022)
- [x] T020 [US2] Add subject detail view to admin dashboard in src/pages/admin/index.tsx — when admin clicks an active SubjectCard, transition to a detail view within the same page (no route change). Detail view shows: back button (to return to grid), subject name header, CategoryTabs + ContentPanel. Only allow clicking into active (approved) subjects — pending subjects are not clickable for content management (clarification #1). Use Framer Motion for view transition between grid and detail. Maintain scroll position when returning to grid (FR-022)

**Checkpoint**: Admin can navigate subjects → categories → content with full CRUD on categories and content items. No dropdowns in the workflow.

---

## Phase 5: User Story 3 — Sudo Reviews and Approves Subject Changes (Priority: P3)

**Goal**: Sudo-1337 sees all pending subject changes across classes, can approve or reject each with one click. Approved changes go live; rejected show temporary badge to admin.

**Independent Test**: Sign in as sudo-1337 → see Pending Approvals section with count → approve a creation (verify subject goes live in class) → reject an edit (verify admin sees "Rejected" badge).

### Implementation for User Story 3

- [x] T021 [P] [US3] Implement GET /api/sudo/approvals endpoint in src/pages/api/sudo/approvals.ts — requireSuperAdmin middleware, fetch all SubjectChangeRequests with status "pending" sorted by createdAt descending, join with classes collection to get className, join with users collection to get requestedByName and requestedByEmail, return { pending: [...], count: number } per api-contracts.md
- [x] T022 [US3] Implement POST /api/sudo/approvals endpoint in src/pages/api/sudo/approvals.ts — requireSuperAdmin middleware, accept changeRequestId and action ("approve" | "reject") in body. For approve: execute the change on the classes collection based on changeType (create: push subject to data[].subjects[], edit: update subject in data[].subjects[], delete: remove subject from data[].subjects[] AND delete content_items with matching classId+category AND delete Google Drive folder). For reject: set status to "rejected", set reviewedBy and reviewedAt. Delete approved requests after applying. Return { action, changeRequestId }
- [x] T023 [P] [US3] Create useApprovals hook in src/hooks/useApprovals.ts — custom hook that fetches GET /api/sudo/approvals with 30s polling interval, provides pending array and count, exposes approveChange and rejectChange mutation functions that POST to /api/sudo/approvals and trigger refetch, manages loading/error state
- [x] T024 [P] [US3] Create ApprovalCard component in src/components/admin/ApprovalCard.tsx — MUI Card showing: change type badge (create/edit/delete with distinct colors), subject name and abbreviation, class name, requesting admin name and email, timestamp (relative — "2 hours ago"). Two action buttons: "Approve" (green) and "Reject" (red). Accept pending change data and onApprove/onReject callbacks. Show loading state on buttons during action
- [x] T025 [US3] Create ApprovalList component in src/components/admin/ApprovalList.tsx — renders ApprovalCard components in a vertical list. Shows count badge in section header ("Pending Approvals (3)"). Show SkeletonGrid while loading. Show empty state ("No pending approvals") when count is 0. Accept pending array, count, and action callbacks. Use Framer Motion AnimatePresence for card removal animation on approve/reject
- [x] T026 [US3] Add Pending Approvals section to sudo-1337 page in src/pages/sudo-1337/index.tsx — add a new tab or prominent section at the top showing ApprovalList. Wire to useApprovals hook. Show count badge on the tab/section header. Keep SuperAdminGuard wrapper. Inline snackbar feedback on approve/reject actions (FR-021)

**Checkpoint**: Sudo-1337 can review and act on all pending subject changes. Admin sees rejected badges. Approval workflow is fully functional end-to-end.

---

## Phase 6: User Story 4 — Sudo Manages Classes and Assigns Admins (Priority: P4)

**Goal**: Sudo-1337 manages classes as visual cards (not table), assigns admins, toggles admin status — all with card-based UI.

**Independent Test**: Sign in as sudo-1337 → see classes as cards → create class → assign admin → verify admin sees the class → edit class → delete class with warning.

### Implementation for User Story 4

- [x] T027 [P] [US4] Create ClassCard component in src/components/admin/ClassCard.tsx — MUI Card showing class name, assigned admin name (or "Unassigned"), subject count. Edit (pencil) and delete (trash) icon buttons. Show warning indicator if admin is unassigned. Accept class data, assigned admin info, onEdit, onDelete, onAssignAdmin callbacks
- [x] T028 [P] [US4] Create ClassGrid component in src/components/admin/ClassGrid.tsx — responsive MUI CSS Grid layout rendering ClassCard components. Include "Add Class" card (dashed border, plus icon). Accept classes array, admins array for assignment lookup, and CRUD callbacks. Show SkeletonGrid while loading
- [x] T029 [US4] Rewrite classes section in sudo-1337 page src/pages/sudo-1337/index.tsx — replace existing ClassManagement table/dialog pattern with ClassGrid. Wire to existing /api/sudo/classes endpoints for CRUD. For class creation: inline form (class name field) that appears below the "Add Class" card. For class edit: inline form on the card itself. For class delete: show inline warning with affected content/admin info before confirmation (FR-021, not modal). For admin assignment: on ClassCard, show a clickable admin name area that opens an inline user picker (autocomplete, not dropdown — searching by name/email). Wire to existing /api/sudo/users PATCH for assignedClassId updates
- [x] T030 [US4] Update user management in sudo-1337 page src/pages/sudo-1337/index.tsx — replace existing UserManagement table with card-based or improved list layout. Each user shows: name, email, admin toggle (MUI Switch), assigned class name. Wire to existing /api/sudo/users endpoints. Ensure one-class-per-admin constraint is enforced (if admin already has a class, show it; reassignment updates both old and new class). Super admin cannot lose admin status (existing protection preserved)

**Checkpoint**: Sudo-1337 manages all classes and admins via card-based UI. Zero table/dropdown patterns in the primary workflow.

---

## Phase 7: User Story 5 — AAA-Level UI Experience (Priority: P5)

**Goal**: All admin and sudo-1337 interfaces have polished, modern layouts with smooth transitions, zero layout shifts, and inline contextual feedback.

**Independent Test**: Walk through all admin and sudo-1337 workflows → verify: no dropdowns for primary selection, no layout shifts during loading, smooth transitions, inline feedback, clear visual hierarchy.

### Implementation for User Story 5

- [x] T031 [P] [US5] Add Framer Motion view transitions to admin dashboard in src/pages/admin/index.tsx — wrap SubjectGrid and subject detail view in AnimatePresence with slide/fade transitions. Ensure scroll position is saved before transition and restored when returning to grid. Add subtle stagger animation for card grid entrance
- [x] T032 [P] [US5] Add Framer Motion view transitions to sudo-1337 page in src/pages/sudo-1337/index.tsx — wrap tab content transitions in AnimatePresence. Add stagger animation for card grids (ClassGrid, ApprovalList). Ensure tab switches don't cause layout shifts
- [x] T033 [P] [US5] Create inline feedback system across admin components — add MUI Snackbar (auto-dismiss, bottom-left) for success confirmations on all CRUD operations (subject change created, category added, content uploaded, approval acted on). Add inline MUI Alert for error messages positioned near the action that failed. Ensure no modal dialogs for routine confirmations (FR-021). Implement in src/pages/admin/index.tsx and src/pages/sudo-1337/index.tsx
- [x] T034 [US5] Final layout stability audit across all views — verify every SkeletonGrid matches the dimensions of its loaded content (no content jumping). Verify scroll position stability on all data refetches (30s polling must not shift content). Verify Framer Motion exit animations don't cause layout reflow. Fix any remaining layout shifts in admin and sudo-1337 pages (FR-020, FR-022, SC-004)

- [x] T034a [P] [US5] Add keyboard navigation and ARIA attributes to all new components — SubjectGrid (src/components/admin/SubjectGrid.tsx): arrow key navigation between cards, Enter/Space to activate, role="grid" with role="gridcell" on cards. CategoryTabs (src/components/admin/CategoryTabs.tsx): verify MUI Tabs keyboard support works, add aria-label. ApprovalCard (src/components/admin/ApprovalCard.tsx): Approve/Reject buttons must be focusable with visible focus indicators. All icon buttons across SubjectCard, ClassCard, ApprovalCard must have aria-label attributes. Verify logical tab order across admin and sudo-1337 pages (constitution P-I accessibility requirement)

**Checkpoint**: All pages meet AAA-level UI criteria — no dropdowns, no layout shifts, smooth transitions, inline feedback, keyboard accessible.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, cleanup logic, and cross-class sharing that span multiple user stories

- [x] T035 [P] Implement rejected request cleanup — add logic to GET /api/admin/subjects in src/pages/api/admin/subjects.ts to delete SubjectChangeRequests with status "rejected" and updatedAt older than 7 days (TTL cleanup on read, per research.md R3)
- [x] T036 [P] Implement cross-class content sharing query in src/pages/api/admin/content.ts — when loading content for a shared subject (shared: true), extend the existing GET handler to also query content_items from other classes that have a subject with the same name and shared: true. Merge results with a "shared from [ClassName]" label. Content remains read-only for non-owning classes (per data-model.md cross-class sharing query)
- [x] T037 [P] Handle edge case: admin class unassignment during session — in useSubjectChanges hook (src/hooks/useSubjectChanges.ts), detect 403 response from API (class no longer assigned) and update UI to show "no class assigned" state without full page reload. Clear any cached subject data
- [x] T038 [P] Handle edge case: subject deleted while admin is viewing it — in the subject detail view in src/pages/admin/index.tsx, detect when the current subject disappears from the subjects response (sudo-1337 approved deletion) and gracefully transition back to the grid with a "Subject no longer available" snackbar message
- [x] T039 [P] Handle edge case: pending change for deleted class — add cleanup logic to DELETE /api/sudo/classes in src/pages/api/sudo/classes.ts to also delete all SubjectChangeRequests where classId matches the deleted class
- [x] T040 Run quickstart.md verification — walk through both admin and sudo-1337 flows as documented in specs/004-admin-sudo-ux/quickstart.md to validate all acceptance scenarios end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on T001 (types) — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 completion
- **US2 (Phase 4)**: Depends on US1 (admin page structure and SubjectCard)
- **US3 (Phase 5)**: Depends on Phase 2 only (SubjectChangeRequest model) — can run in parallel with US1
- **US4 (Phase 6)**: Depends on Phase 2 only — can run in parallel with US1 and US3
- **US5 (Phase 7)**: Depends on US1-US4 (applies polish to all views)
- **Polish (Phase 8)**: Depends on US1-US4 being functionally complete

### User Story Dependencies

- **US1 (P1)**: Start after Phase 2 — no other story dependencies
- **US2 (P2)**: Depends on US1 (admin page structure needed for subject detail view)
- **US3 (P3)**: Start after Phase 2 — independent of US1/US2 (separate page, only needs SubjectChangeRequest model)
- **US4 (P4)**: Start after Phase 2 — independent of US1/US2/US3 (separate section of sudo-1337 page)
- **US5 (P5)**: Depends on US1-US4 (cross-cutting polish)

### Within Each User Story

- API endpoints before components that consume them
- Hooks before page integration
- Components before page assembly
- Page assembly as final task in each story

### Parallel Opportunities

- T001 and T002 can run in parallel (Setup phase)
- T003, T004, T005 can all run in parallel (Foundational phase)
- T006, T007, T010, T011, T012 can all run in parallel (US1 — different files; T008 after T007, same file)
- T015, T018 can run in parallel (US2 — different files; T016 after T015, same file)
- T021, T023, T024 can run in parallel (US3 — different files; T022 after T021, same file)
- T027, T028 can run in parallel (US4 — different files)
- T031, T032, T033 can run in parallel (US5 — different files)
- T035, T036, T037, T038, T039 can all run in parallel (Polish — different files)
- **US1 and US3 can run in parallel** (different pages, share only the SubjectChangeRequest model)
- **US1 and US4 can run in parallel** (different pages entirely)
- **US3 and US4 can run in parallel** (different sections of sudo-1337 page)

---

## Parallel Example: User Story 1

```text
# After Phase 2 completes, launch these in parallel:
Task T006: "useSubjectChanges hook in src/hooks/useSubjectChanges.ts"
Task T007: "GET /api/admin/subjects in src/pages/api/admin/subjects.ts"
Task T008: "POST /api/admin/subjects in src/pages/api/admin/subjects.ts"
Task T010: "GET /api/admin/subjects/check-name in src/pages/api/admin/subjects/check-name.ts"
Task T011: "SubjectCard in src/components/admin/SubjectCard.tsx"
Task T012: "SubjectForm in src/components/admin/SubjectForm.tsx"

# After T007-T009 (API complete) and T011-T012 (components complete):
Task T013: "SubjectGrid in src/components/admin/SubjectGrid.tsx"

# After T006 (hook) and T013 (grid):
Task T014: "Admin dashboard page rewrite in src/pages/admin/index.tsx"
```

## Parallel Example: User Stories 1 + 3 + 4 (cross-story parallelism)

```text
# After Phase 2 completes, these three stories can start simultaneously:

# Developer A: User Story 1
Task T006-T014 (admin subject management)

# Developer B: User Story 3
Task T021-T026 (sudo approval workflow)

# Developer C: User Story 4
Task T027-T030 (sudo class/admin management)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Foundational (T003-T005)
3. Complete Phase 3: User Story 1 (T006-T014)
4. **STOP and VALIDATE**: Admin can see subjects as cards, create/edit/delete with pending state
5. Deploy/demo if ready — core new functionality is usable

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (admin subjects) → Test independently → **MVP Deploy**
3. Add US2 (categories & content) → Test independently → Deploy
4. Add US3 (sudo approvals) → Test independently → Deploy (approval workflow now complete)
5. Add US4 (sudo classes/admins) → Test independently → Deploy
6. Add US5 (polish) → Final validation → Deploy
7. Polish phase (edge cases, sharing) → Final deploy

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: US1 → then US2 (sequential, US2 depends on US1)
   - Developer B: US3 → then US5 polish for sudo page
   - Developer C: US4 → then US5 polish for admin page
3. Polish phase: all developers handle edge cases in parallel

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- No test framework installed — validate via acceptance scenarios in spec.md
- All components use MUI v6 sx prop + theme tokens — no inline CSS strings
- All API routes follow existing auth-middleware.ts patterns (requireAdmin, requireSuperAdmin)
