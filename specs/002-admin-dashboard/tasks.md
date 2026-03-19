# Tasks: Admin Content Dashboard

**Input**: Design documents from `/specs/002-admin-dashboard/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-routes.md, quickstart.md

**Tests**: Not included — no test framework configured in this project.

**Organization**: Tasks grouped by user story. US4 (access control) is implemented as the foundational phase since it blocks all other stories.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and create SDK initialization modules

- [x] T001 Install firebase and firebase-admin npm dependencies via `npm install firebase firebase-admin`
- [x] T002 [P] Create Firebase client SDK initialization (initializeApp, getAuth, GoogleAuthProvider) in src/lib/firebase-client.ts — use NEXT_PUBLIC_FIREBASE_* env vars per quickstart.md
- [x] T003 [P] Create Firebase Admin SDK initialization (initializeApp with cert, getAuth) in src/lib/firebase-admin.ts — use FIREBASE_ADMIN_* env vars, handle \\n replacement in private key
- [x] T004 [P] Create Google Auth write-scope client for Drive uploads in src/lib/google-auth-write.ts — use existing CLIENT_EMAIL/PRIVATE_KEY env vars with `https://www.googleapis.com/auth/drive` scope; export function that returns access token

**Checkpoint**: All SDK modules initialized — auth and upload infrastructure ready

---

## Phase 2: Foundational / US4 - Auth & Access Control (Priority: P1)

**Purpose**: Core auth infrastructure that MUST be complete before ANY user story. Implements User Story 4 (non-admin access denial) as a cross-cutting concern.

**Goal**: Any unauthenticated or non-admin user is denied access to admin routes. Super admin restriction enforced on sudo-1337.

**Independent Test**: Log in as a non-admin user → attempt to visit /admin and /sudo-1337 → both should deny access and redirect.

**CRITICAL**: No user story work can begin until this phase is complete.

- [x] T005 Create User Mongoose model (firebaseUid, email, displayName, photoURL, isAdmin, timestamps) with unique indexes on firebaseUid and email in src/lib/models/user.ts — per data-model.md schema
- [x] T006 Create auth middleware with three functions (verifyAuth, requireAdmin, requireSuperAdmin) in src/lib/auth-middleware.ts — verifyAuth extracts Bearer token, verifies via firebase-admin, upserts user in MongoDB; requireAdmin checks isAdmin flag; requireSuperAdmin checks email === "mtolba2004@gmail.com"; per contracts/api-routes.md Auth Middleware Pattern
- [x] T007 Implement POST /api/auth/login endpoint in src/pages/api/auth/login.ts — verify Firebase ID token, upsert user in MongoDB users collection, return user record with isSuperAdmin flag; per contracts/api-routes.md POST /api/auth/login
- [x] T008 Create AuthContext provider in src/context/AuthContext.tsx — wrap app with Firebase onAuthStateChanged listener, store current user + role (admin/superAdmin) in context, call /api/auth/login on sign-in, expose loading/error states
- [x] T009 Create useAuth hook in src/hooks/useAuth.ts — expose signInWithGoogle (signInWithPopup), signOut, getIdToken, user object, isAdmin, isSuperAdmin from AuthContext
- [x] T010 [P] Create AdminGuard route protection component in src/components/admin/AdminGuard.tsx — wraps children, checks useAuth for isAdmin, redirects to / if not admin, shows login prompt if not authenticated; uses MUI components
- [x] T011 [P] Create SuperAdminGuard route protection component in src/components/admin/SuperAdminGuard.tsx — wraps children, checks useAuth for isSuperAdmin, redirects to / if not super admin (including regular admins); uses MUI components
- [x] T012 Wire AuthContext into app by wrapping _app.tsx with AuthProvider in src/pages/_app.tsx — add AuthProvider inside existing theme/context providers

**Checkpoint**: Auth system complete. Non-admin users denied from /admin, non-super-admins denied from /sudo-1337. US4 acceptance scenarios satisfied.

---

## Phase 3: User Story 1 - Super Admin Manages Admin Access (Priority: P1)

**Goal**: Super admin (mtolba2004@gmail.com) can access sudo-1337 to toggle admin flags on users and CRUD classes.

**Independent Test**: Sign in as mtolba2004@gmail.com → navigate to /sudo-1337 → see user list with admin toggles + class management → grant admin to a user → verify they can access /admin.

### Implementation for User Story 1

- [x] T013 [P] [US1] Implement GET/PATCH /api/sudo/users endpoint in src/pages/api/sudo/users.ts — GET lists all users with admin status; PATCH toggles isAdmin for a user by firebaseUid; use requireSuperAdmin middleware; prevent self-demotion (return 400 if targeting mtolba2004@gmail.com for demotion); per contracts/api-routes.md
- [x] T014 [P] [US1] Implement GET/POST/PUT/DELETE /api/sudo/classes endpoint in src/pages/api/sudo/classes.ts — CRUD operations on existing MongoDB classes collection using existing Transcript schema pattern; use requireSuperAdmin middleware; DELETE checks for associated content_items before allowing; per contracts/api-routes.md
- [x] T015 [P] [US1] Create UserManagement component in src/components/admin/UserManagement.tsx — MUI Table displaying all users (email, displayName, isAdmin toggle switch, createdAt); fetches from GET /api/sudo/users; calls PATCH on toggle; shows snackbar confirmation; disables toggle for super admin row
- [x] T016 [P] [US1] Create ClassManagement component in src/components/admin/ClassManagement.tsx — MUI Table/List of classes with add (Dialog form), edit (inline or Dialog), delete (with confirmation Dialog) actions; fetches from GET /api/sudo/classes; manages semester/subject data structure per existing classes schema
- [x] T017 [US1] Implement sudo-1337 page in src/pages/sudo-1337/index.tsx — wrap with SuperAdminGuard; compose UserManagement and ClassManagement in tabbed or sectioned layout using MUI Tabs/Box; page title "sudo-1337"; styled with MUI sx prop and existing theme

**Checkpoint**: Super admin can manage users and classes from /sudo-1337. All US1 acceptance scenarios testable.

---

## Phase 4: User Story 2 - Admin Uploads Content for a Class (Priority: P1)

**Goal**: Flagged admin users can browse classes, select categories, and upload content (files via resumable Drive upload, links, and easter eggs).

**Independent Test**: Sign in as a flagged admin → navigate to /admin → see class list → select class → see categories → upload a file (verify it appears in Google Drive) → add a link → add an easter egg → verify all appear in content list.

### Implementation for User Story 2

- [x] T018 [US2] Create ContentItem Mongoose model (type enum, classId, category, uploadedBy, timestamps, plus type-specific fields for link and easter_egg) with compound index on {classId, category} in src/lib/models/content-item.ts — per data-model.md ContentItem schema
- [x] T019 [P] [US2] Implement POST /api/admin/upload-session endpoint in src/pages/api/admin/upload-session.ts — use requireAdmin middleware; accept {fileName, mimeType, folderId}; use google-auth-write.ts to get access token; POST to Google Drive resumable upload endpoint; return {sessionUri} from Location header; per contracts/api-routes.md and research.md R1
- [x] T020 [P] [US2] Implement GET/POST /api/admin/content endpoint in src/pages/api/admin/content.ts — GET returns content items filtered by classId and category; POST creates a new link or easter_egg content item; use requireAdmin middleware; validate type-specific fields; per contracts/api-routes.md
- [x] T021 [P] [US2] Implement GET /api/admin/drive-folders endpoint in src/pages/api/admin/drive-folders.ts — accept subject query param; reuse existing Drive folder traversal logic (find subject folder → list category subfolders); return folder id/name pairs; use requireAdmin middleware; per contracts/api-routes.md
- [x] T022 [P] [US2] Create ContentUploader component in src/components/admin/ContentUploader.tsx — file input with drag-and-drop zone; validates 50 MB max size; calls /api/admin/upload-session to get session URI; uploads file directly to session URI via XHR with progress tracking (onprogress event); shows MUI LinearProgress bar; displays success/error state; per plan.md Key Architecture section
- [x] T023 [P] [US2] Create LinkForm component in src/components/admin/LinkForm.tsx — MUI form with title (TextField) and url (TextField with URL validation) fields; submit calls POST /api/admin/content with type "link"; shows success snackbar on creation
- [x] T024 [P] [US2] Create EasterEggForm component in src/components/admin/EasterEggForm.tsx — MUI form with name, triggerDescription, and payload fields (TextFields); submit calls POST /api/admin/content with type "easter_egg"; shows success snackbar on creation
- [x] T025 [US2] Create ContentList component in src/components/admin/ContentList.tsx — fetches Drive files from existing /api/subjects/files/[subject] endpoint + MongoDB items from GET /api/admin/content; merges into unified list grouped by category; displays appropriate metadata per type (file: name/size/date, link: title/url, easter_egg: name/trigger); MUI List/Card layout
- [x] T026 [US2] Implement admin dashboard page in src/pages/admin/index.tsx — wrap with AdminGuard; class selector (fetches classes from MongoDB via existing /api/getTranscript or new endpoint); subject/category browser within selected class; compose ContentUploader, LinkForm, EasterEggForm, ContentList; tabbed or accordion layout for add-content forms; MUI styled with sx prop

**Checkpoint**: Admin can browse classes, view categories, upload files (direct to Drive), add links, add easter eggs, and see unified content list. All US2 acceptance scenarios testable.

---

## Phase 5: User Story 3 - Admin Manages Existing Content (Priority: P2)

**Goal**: Admin users can delete and replace content items (both Drive files and MongoDB items), with confirmation prompts.

**Independent Test**: Navigate to a class with existing content → delete a link → confirm deletion → verify removed → delete a Drive file → confirm → verify removed from Drive → upload replacement file → verify replacement appears.

### Implementation for User Story 3

- [x] T027 [P] [US3] Add DELETE method handler to /api/admin/content endpoint in src/pages/api/admin/content.ts — accept {_id}, delete ContentItem from MongoDB; use requireAdmin middleware; per contracts/api-routes.md
- [x] T028 [P] [US3] Implement DELETE /api/admin/drive-file endpoint in src/pages/api/admin/drive-file.ts — accept {fileId}; use requireAdmin middleware; authenticate with Google write-scope client; call drive.files.delete; return success or 404; per contracts/api-routes.md
- [x] T029 [US3] Add delete actions with confirmation dialog to ContentList in src/components/admin/ContentList.tsx — add delete IconButton per content item; MUI Dialog confirmation ("Are you sure you want to delete [name]?"); call appropriate delete endpoint (drive-file for Drive files, content for MongoDB items); refresh list after deletion
- [x] T030 [US3] Add file replacement flow to ContentUploader in src/components/admin/ContentUploader.tsx — detect duplicate filename in same category folder; show MUI Dialog asking to confirm replacement or rename; if replace, delete old Drive file first then upload new one

**Checkpoint**: Admin can delete and replace all content types with confirmation. All US3 acceptance scenarios testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, empty states, error handling improvements across all stories

- [x] T031 Add empty state UI with upload call-to-action when a class/category has no content in src/components/admin/ContentList.tsx — MUI Box with illustration/icon and "Upload your first file" button
- [x] T032 Add graceful error handling for revoked admin during upload in src/components/admin/ContentUploader.tsx — catch 403 from upload-session, show "Access revoked" alert, redirect to /
- [x] T033 Add duplicate filename detection prompt before upload in src/components/admin/ContentUploader.tsx — query Drive folder contents before initiating upload; if duplicate found, prompt admin to replace or rename
- [ ] T034 Verify all edge cases from spec.md: super admin self-demotion prevention (T013), empty class state (T031), revoked admin during upload (T032), duplicate filename (T033), super admin not yet registered (handled by upsert in T007)
- [ ] T035 Run manual validation per quickstart.md test scenarios — sign in as super admin, manage users/classes, sign in as admin, upload file/link/easter egg, delete content, verify non-admin denial

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational / US4 (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 completion — no dependency on other stories
- **US2 (Phase 4)**: Depends on Phase 2 completion — no dependency on US1 (admin flag can be set directly in MongoDB for testing)
- **US3 (Phase 5)**: Depends on Phase 4 completion (needs content to exist before managing it)
- **Polish (Phase 6)**: Depends on Phases 3, 4, 5 completion

### User Story Dependencies

- **US4 (Access Control)**: Phase 2 — Foundation, blocks everything
- **US1 (Super Admin)**: Phase 3 — Independent after Phase 2
- **US2 (Content Upload)**: Phase 4 — Independent after Phase 2 (can run parallel with US1)
- **US3 (Content Management)**: Phase 5 — Requires US2 (extends its components and endpoints)

### Within Each User Story

- Models/schemas before API routes
- API routes before UI components
- UI components before page composition
- Core implementation before integration

### Parallel Opportunities

**Phase 1** (after T001):
```
Parallel: T002, T003, T004 (independent SDK init files)
```

**Phase 2** (after T005-T007):
```
Parallel: T010, T011 (independent guard components)
```

**Phase 3** (all can start in parallel):
```
Parallel: T013, T014, T015, T016 (independent API routes + components)
Then: T017 (composes them into page)
```

**Phase 4** (after T018):
```
Parallel: T019, T020, T021 (independent API routes)
Parallel: T022, T023, T024 (independent UI components)
Then: T025 (composes ContentList)
Then: T026 (composes page)
```

**Phase 5**:
```
Parallel: T027, T028 (independent delete endpoints)
Then: T029, T030 (UI updates that use those endpoints)
```

---

## Implementation Strategy

### MVP First (US4 + US1 + US2)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Auth & Access Control / US4 (T005-T012)
3. Complete Phase 3: US1 - Super Admin (T013-T017)
4. Complete Phase 4: US2 - Content Upload (T018-T026)
5. **STOP and VALIDATE**: Test full admin flow end-to-end
6. Deploy if ready — admins can upload content

### Incremental Delivery

1. Setup + Foundational → Auth works, access denied for non-admins
2. Add US1 → Super admin can manage users/classes (deployable)
3. Add US2 → Admins can upload content (deployable — core feature complete)
4. Add US3 → Admins can delete/replace content (deployable — full feature)
5. Polish → Edge cases, empty states, error handling

### Parallel Execution (US1 + US2 simultaneously)

After Phase 2 completes, US1 and US2 can be developed in parallel:
- **Track A**: US1 (sudo-1337 page) — T013-T017
- **Track B**: US2 (admin dashboard) — T018-T026
- Both tracks merge at Phase 5 (US3 depends on US2)

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- No test tasks included — project has no test framework configured
- Files uploaded to Google Drive appear automatically in existing student-facing UI
- Links and easter eggs stored in MongoDB require the admin dashboard to view/manage
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
