# Tasks: Direct Upload & Video Content Type

**Input**: Design documents from `/specs/007-direct-upload-video/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No test framework configured. Tests are not included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add constants, types, and configuration needed by all user stories

- [x] T001 [P] Add upload constants (UPLOAD_SOFT_LIMIT, UPLOAD_HARD_LIMIT, UPLOAD_MAX_RETRIES, VIDEO_STAGING_FOLDER_ID, VIDEO_MIME_TYPES) in src/lib/constants.ts
- [x] T002 [P] Add upload-related TypeScript types (UploadOptions, UploadProgress, UploadResult) in src/utils/types.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the direct upload utility that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Create direct upload helper function in src/utils/upload.ts — accepts File, sessionUri, and options; uses XMLHttpRequest to PUT file bytes directly to the Google Drive resumable session URI; tracks progress via xhr.upload.onprogress; implements auto-resume from last byte on failure (query upload status via PUT with Content-Range: bytes */{totalSize}, then resume from offset); retries up to UPLOAD_MAX_RETRIES times; returns Promise with Drive file {id, name}; handles session expiry (404) by signaling caller to create new session

**Checkpoint**: Foundation ready — direct upload utility available for all user stories

---

## Phase 3: User Story 1 - Direct File Upload to Google Drive (Priority: P1) MVP

**Goal**: Replace Vercel-proxied upload with direct browser-to-Drive upload in the existing File tab, preserving all current UX (drag-and-drop, progress bar, duplicate detection, optimistic UI)

**Independent Test**: Upload a file > 50 MB via the File tab — verify it appears in the correct Drive folder with accurate progress bar, no Vercel proxy involvement, and the content list updates immediately

### Implementation for User Story 1

- [x] T004 [US1] Refactor upload flow in src/components/admin/AddContent.tsx — replace the XHR call to /api/admin/upload with a two-step flow: (1) POST to /api/admin/upload-session to get sessionUri, (2) call the direct upload helper from src/utils/upload.ts with the sessionUri; wire up progress callback to existing LinearProgress component; preserve drag-and-drop handlers, duplicate detection dialog, and optimistic cache update (cacheSet with content:{subject}:{category} key); handle session expiry signal from upload helper — if upload.ts reports a 404 (expired session), create a new upload-session and pass the fresh sessionUri back for retry
- [x] T005 [US1] Implement two-tier file size validation in src/components/admin/AddContent.tsx — replace the existing 50 MB check: files > UPLOAD_HARD_LIMIT (5 GB) show an error message with a link to the target Drive folder (https://drive.google.com/drive/folders/{folderId}); files > UPLOAD_SOFT_LIMIT (2 GB) show a confirmation dialog before proceeding; files under 2 GB proceed normally
- [x] T006 [US1] Add deprecation comment to src/pages/api/admin/upload.ts — mark the endpoint as deprecated with a note that AddContent now uses upload-session + direct upload; do not delete the file

**Checkpoint**: File tab uploads work via direct-to-Drive mechanism. Files > 50 MB upload successfully. Duplicate detection, drag-and-drop, progress bar, and optimistic UI all function identically to before.

---

## Phase 4: User Story 2 - Add YouTube Link as Video Content (Priority: P2)

**Goal**: Add a "Video" tab to AddContent with a "YouTube Link" sub-option that creates a Drive file named "{youtube-url} {title}" in the subject's category folder

**Independent Test**: Select Video tab → YouTube Link, paste a YouTube URL + title, submit — verify Drive file is created with correct name, and student view renders YouTube embed player

### Implementation for User Story 2

- [x] T007 [US2] Add Video tab to the ToggleButtonGroup in src/components/admin/AddContent.tsx — extend the mode state from "file" | "link" to "file" | "link" | "video-youtube" | "video-upload"; add a third "Video" toggle button; when Video is selected, show a secondary toggle or radio group for "YouTube Link" vs "Upload Video File" sub-options; default to "YouTube Link" sub-option
- [x] T008 [US2] Implement YouTube Link form UI in src/components/admin/AddContent.tsx — when mode is "video-youtube": show a YouTube URL text field and a Title text field; add client-side YouTube URL validation using the existing getYoutubeId regex pattern (extract 11-char video ID from youtube.com/youtu.be URLs, reject non-YouTube URLs with validation error); on submit, call POST /api/admin/link with {url, title, folderId, classId} (reusing the existing link endpoint); on success, update optimistic cache and show success snackbar; handle duplicate detection the same way as links

**Checkpoint**: Video tab with YouTube Link sub-option is functional. YouTube links create correctly-named Drive files. Student view renders embeds correctly via existing parser.

---

## Phase 5: User Story 3 - Upload Video File for YouTube Processing (Priority: P3)

**Goal**: Add "Upload Video File" sub-option to the Video tab that uploads video files to a staging folder with `{title}__{category}__{subject}` naming, using the direct upload mechanism

**Independent Test**: Select Video tab → Upload Video File, select a .mp4 file, enter title, submit — verify file lands in staging folder with correct `{title}__{category}__{subject}` name (no extension), optimistic UI updates content list, and informational "processed within 24 hours" message appears

### Implementation for User Story 3

- [x] T009 [US3] Implement Upload Video File form UI in src/components/admin/AddContent.tsx — when mode is "video-upload": show a drag-and-drop zone (reuse existing drag-and-drop pattern) restricted to video MIME types (VIDEO_MIME_TYPES from constants) and a Title text field; validate file type client-side (reject non-video files with error); apply same two-tier size validation as File tab (T005); construct filename as `{title}__{category}__{subject}` (no extension); POST to /api/admin/upload-session with {fileName: constructed name, mimeType: original video MIME, folderId: VIDEO_STAGING_FOLDER_ID, classId}; upload via direct upload helper (src/utils/upload.ts); on success, update optimistic cache and show success snackbar plus additional info message "Video will be processed within 24 hours"

**Checkpoint**: All three user stories are independently functional. Video files land in staging folder with correct naming convention. Optimistic UI works for all upload paths.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Frontend display name fix and final cleanup

**DEPLOYMENT-BLOCKING**: T010 implements FR-018 (functional requirement). Must be complete before deployment — pipeline-processed videos will show raw `__{category}__{subject}` suffixes without it.

- [x] T010 [P] Modify parseGoogleFile() in src/utils/helpers.ts — after extracting the display name from a YouTube-type file (text after URL in "{url} {title}" pattern), check if the display name contains `__` separators; if it does AND the file is detected as YouTube type, split on `__` and use only the first segment as the visible title (e.g., "lecture__Chapter1__Math" → "lecture"); non-YouTube files are unaffected
- [x] T011 [P] Verify all error messages are clear and actionable across all upload paths in src/components/admin/AddContent.tsx — upload failure after retry exhaustion, expired session, invalid YouTube URL, unsupported video file type, staging folder inaccessible, file exceeds hard limit (with Drive folder link)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (constants/types) — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 (upload.ts utility)
- **US2 (Phase 4)**: Depends on Phase 2 (foundational) — logically independent from US1 but modifies same file (AddContent.tsx), so execute after US1 to avoid merge conflicts
- **US3 (Phase 5)**: Depends on Phase 2 (upload.ts) and Phase 4 (Video tab must exist) — requires Video tab structure from US2
- **Polish (Phase 6)**: Can start after Phase 4 (T010 is independent); T011 should run after all stories complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — no dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) — independent of US1 but shares AddContent.tsx; execute after US1
- **User Story 3 (P3)**: Depends on US2 (Video tab structure) — uses upload.ts from Phase 2

### Within Each User Story

- Constants/types before utility code
- Utility code before UI integration
- Core upload mechanism before validation/error handling
- Story complete before moving to next priority

### Parallel Opportunities

- T001 and T002 can run in parallel (different files)
- T010 and T011 can run in parallel (different files / different concerns)
- T010 can start as soon as Phase 4 completes (independent of US3)

---

## Parallel Example: Phase 1 Setup

```bash
# Launch setup tasks in parallel (different files):
Task: "T001 — Add upload constants in src/lib/constants.ts"
Task: "T002 — Add upload types in src/utils/types.ts"
```

## Parallel Example: Phase 6 Polish

```bash
# Launch polish tasks in parallel (different files):
Task: "T010 — Modify parseGoogleFile() in src/utils/helpers.ts"
Task: "T011 — Verify error messages in src/components/admin/AddContent.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Foundational (T003)
3. Complete Phase 3: User Story 1 (T004-T006)
4. **STOP and VALIDATE**: Upload a file > 50 MB via File tab — verify progress bar, optimistic UI, and Drive folder placement
5. Deploy/demo if ready — all existing functionality preserved, large files now supported

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test file uploads → Deploy (MVP — direct upload working)
3. Add User Story 2 → Test YouTube links → Deploy (Video tab with YouTube)
4. Add User Story 3 → Test video staging → Deploy (Complete video workflow)
5. Polish → Strip display names, verify errors → Final deploy

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- No automated tests — manual testing per quickstart.md scenarios
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- AddContent.tsx is the primary file modified across US1/US2/US3 — execute sequentially to avoid conflicts
- src/utils/upload.ts is the only new file; all other changes are modifications to existing files
