# Tasks: NotebookLM Study Session Builder

**Input**: Design documents from `/specs/008-notebooklm-study-builder/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Create directory structure and shared type definitions

- [x] T001 Create `src/components/study/` directory and `src/styles/study-mode.css` with selection keyframe animations (pulse border, selection flash)
- [x] T002 [P] Add `SessionItem` and `StudySessionState` interfaces to `src/utils/types.ts` per data-model.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Context provider, export utilities, and localStorage persistence — MUST complete before any user story

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Create `StudySessionContext` with `useStudySession` hook in `src/context/StudySessionContext.tsx` — implement: isActive, items, itemCount, toggleMode, addItem, removeItem, toggleItem, clearAll, isSelected. Hydrate from localStorage on mount. Persist to localStorage keys `studyModeActive` and `studySessionItems` on every state change. Add cross-tab sync via window storage event listener. Enforce 50-item limit in addItem/toggleItem (return false and do not add if at limit).
- [x] T004 Create `src/utils/study-export.ts` with two pure functions: `formatUrls(items: SessionItem[]): string` (one URL per line) and `formatStudyContext(items: SessionItem[]): string` (XML-structured text per research.md R6 format). Group items by subjectName → category, sorted alphabetically.
- [x] T005 Add `StudySessionProvider` wrapper to `src/pages/_app.tsx` — wrap inside `AuthProvider`, import `src/styles/study-mode.css`

**Checkpoint**: Foundation ready — context provides state, exports format data, provider is mounted

---

## Phase 3: User Story 1 — Select Materials Across Subjects (Priority: P1) MVP

**Goal**: Students can activate Study Mode, tap file cards to select/deselect them across subjects, and see their collection via a FAB-triggered panel

**Independent Test**: Activate Study Mode on a subject page → tap 3 file cards → verify selected state. Navigate to a different subject → select 2 more → open FAB panel → all 5 items visible. Close tab, reopen → items persist.

### Implementation for User Story 1

- [x] T006 [P] [US1] Create `StudyModeToggle` component in `src/components/study/StudyModeToggle.tsx` — MUI Switch with label, calls `toggleMode()` from `useStudySession`. Styled to match header controls.
- [x] T007 [P] [US1] Create `SelectionOverlay` component in `src/components/study/SelectionOverlay.tsx` — absolute-positioned overlay inside file cards. Props: `isSelectable: boolean`, `isSelected: boolean`. When selectable: subtle pulsing border via CSS animation from study-mode.css. When selected: solid primary border + animated check icon (Framer Motion `AnimatePresence` for mount/unmount).
- [x] T008 [P] [US1] Create `SessionItemRow` component in `src/components/study/SessionItemRow.tsx` — single item row showing file type icon, name (truncated), subject chip, and remove IconButton. Props: `item: SessionItem`, `onRemove: (id: string) => void`.
- [x] T009 [P] [US1] Create `CollectionPanel` component in `src/components/study/CollectionPanel.tsx` — MUI Drawer (right on desktop, bottom on mobile via useMediaQuery). Props: `open: boolean`, `onClose: () => void`. Header shows total item count + close button. Body renders flat list of `SessionItemRow` components. Footer has placeholder area for export buttons (wired in later stories). Calls `removeItem` from `useStudySession` context.
- [x] T010 [P] [US1] Create `StudyFab` component in `src/components/study/StudyFab.tsx` — MUI Fab with MUI Badge showing `itemCount`. Visible when `isActive || itemCount > 0`. Fixed position bottom-right. Tapping toggles CollectionPanel open/closed state (local useState). Import and render CollectionPanel inside this component.
- [x] T011 [US1] Modify `src/components/FileCard.tsx` — add optional props: `studyModeActive?: boolean`, `isSelected?: boolean`, `onStudySelect?: (file: ParsedFile) => void`. When `studyModeActive && file.type !== 'folder'`: render `SelectionOverlay`, intercept click to call `onStudySelect` instead of opening file. When `file.type === 'folder'`: ignore study mode (no overlay, normal click). Set `CardActionArea` component to `div` when study mode active (prevent navigation).
- [x] T012 [US1] Modify `src/components/FileListItem.tsx` — add same three optional props. When `studyModeActive && file.type !== 'folder'`: show selected border/bgcolor styling (primary color), intercept click to call `onStudySelect`. Show CheckCircle icon when selected, normal action icon otherwise. Folder items: ignore study mode.
- [x] T013 [US1] Modify `src/components/FileBrowser.tsx` — add optional props: `studyModeActive?: boolean`, `onStudySelect?: (file: ParsedFile, category: string) => void`, `isItemSelected?: (id: string) => boolean`. Pass these through to each `FileCard` and `FileListItem` in both grid and list views.
- [x] T014 [US1] Modify `src/pages/subjects/[subject].tsx` — import `useStudySession`. Extract `isActive`, `toggleItem`, `isSelected` from hook. Create `handleStudySelect` callback that builds a `SessionItem` from the `ParsedFile` + current subject metadata (subjectName from data.json, subjectAbbr from URL param, category from FileBrowser). Pass `studyModeActive`, `onStudySelect={handleStudySelect}`, `isItemSelected={isSelected}` to `FileBrowser`.
- [x] T015 [US1] Modify `src/components/ModernHeader.tsx` — dynamically import `StudyModeToggle`. Render it in the header actions area, but only when `isSearch` prop is true (subject pages only). Use `next/dynamic` with `ssr: false`.
- [x] T016 [US1] Add `StudyFab` to `src/pages/_app.tsx` — render after `<Component {...pageProps} />`, before `<DevDashboard />`.

**Checkpoint**: US1 complete — students can toggle Study Mode, select/deselect files across subjects, view selections in FAB panel, items persist across sessions

---

## Phase 4: User Story 3 — Copy URLs for NotebookLM (Priority: P1)

**Goal**: Students can copy all collected item URLs to clipboard for pasting into NotebookLM

**Independent Test**: Select 5 items from 2 subjects → open panel → tap "Copy URLs" → paste into text editor → verify 5 URLs, one per line, in correct format (Drive preview URLs and YouTube watch URLs)

### Implementation for User Story 3

- [x] T017 [P] [US3] Create `ClipboardFallback` component in `src/components/study/ClipboardFallback.tsx` — MUI Dialog with a read-only multiline TextField showing the text content. "Select All" button calls `textarea.select()`. "Close" button dismisses. Props: `open: boolean`, `onClose: () => void`, `content: string`, `title: string`.
- [x] T018 [US3] Add "Copy URLs" button to `CollectionPanel` footer in `src/components/study/CollectionPanel.tsx` — calls `formatUrls(items)` from `study-export.ts`, writes to clipboard via `navigator.clipboard.writeText()`. On success: show MUI Snackbar toast "URLs copied — paste as website sources in NotebookLM". On clipboard failure: open `ClipboardFallback` with the URL text. Button disabled when `itemCount === 0`.

**Checkpoint**: US1 + US3 complete — full MVP flow: activate → select → copy URLs → paste in NotebookLM

---

## Phase 5: User Story 2 — Review & Organize Collection (Priority: P2)

**Goal**: Collection panel groups items by subject with collapsible sections, item counts, limit warnings, and clear all

**Independent Test**: Select 8 items from 3 subjects → open panel → verify 3 subject groups with headers showing per-subject counts. Collapse/expand a group. Remove one item → count decreases. Select 41+ items → warning appears.

### Implementation for User Story 2

- [x] T019 [P] [US2] Create `CollectionGroup` component in `src/components/study/CollectionGroup.tsx` — collapsible section: subject name header with item count chip, MUI Collapse wrapping a list of `SessionItemRow`. Props: `subjectName: string`, `items: SessionItem[]`, `onRemoveItem: (id: string) => void`, `defaultExpanded?: boolean`. Tap header toggles collapse.
- [x] T020 [US2] Upgrade `CollectionPanel` in `src/components/study/CollectionPanel.tsx` — replace flat item list with grouped view: compute `Map<subjectName, SessionItem[]>` from context items, render a `CollectionGroup` per subject (sorted alphabetically). Update header to show total count and per-subject breakdown chips. Add 50-item limit warning (MUI Alert, severity "warning") when `itemCount >= 40`. Add "Clear All" button in footer that shows a confirmation Dialog before calling `clearAll()`.

**Checkpoint**: US1 + US2 + US3 complete — organized panel with grouping, limits, and URL export

---

## Phase 6: User Story 4 — Copy Study Context (Priority: P2)

**Goal**: Students can copy a structured XML context document for NotebookLM to understand cross-subject relationships

**Independent Test**: Select items from 2+ subjects → tap "Copy Study Context" → paste into text editor → verify XML structure with correct subject names, categories, material listings, and AI instructions

### Implementation for User Story 4

- [x] T021 [US4] Add "Copy Study Context" button to `CollectionPanel` footer in `src/components/study/CollectionPanel.tsx` — calls `formatStudyContext(items)` from `study-export.ts`, writes to clipboard. On success: toast "Study context copied — paste as a text source in NotebookLM". On clipboard failure: open `ClipboardFallback`. Button disabled when `itemCount === 0`.

**Checkpoint**: US1 + US2 + US3 + US4 complete — both export actions available

---

## Phase 7: User Story 5 — Open in NotebookLM (Priority: P3)

**Goal**: Convenience button that auto-copies URLs and opens NotebookLM in a new tab with guidance

**Independent Test**: With items in collection → tap "Open in NotebookLM" → verify URLs copied to clipboard + NotebookLM opens in new tab + toast shows step-by-step guidance

### Implementation for User Story 5

- [x] T022 [US5] Add "Open in NotebookLM" button to `CollectionPanel` footer in `src/components/study/CollectionPanel.tsx` — on click: copy URLs to clipboard (reuse formatUrls + clipboard logic), then `window.open('https://notebooklm.google.com', '_blank')`. Toast shows: "URLs copied — Create a new notebook → Add sources → Paste as website URLs". Button disabled when `itemCount === 0`.

**Checkpoint**: All 5 user stories complete

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Theme support, responsiveness, and animation refinement

- [x] T023 [P] Verify dark mode styling for all study/ components — test SelectionOverlay, CollectionPanel, StudyFab, SessionItemRow in both light and dark themes. Fix any `theme.palette` references that don't adapt. File: all `src/components/study/*.tsx`
- [x] T024 [P] Verify mobile responsiveness — test CollectionPanel as bottom drawer on mobile (useMediaQuery breakpoint). Test StudyFab positioning doesn't overlap with other fixed elements. Test selection overlay tap targets are large enough (min 44px). Files: `src/components/study/CollectionPanel.tsx`, `src/components/study/StudyFab.tsx`
- [x] T025 Polish study-mode.css animations in `src/styles/study-mode.css` — ensure pulse animation respects `prefers-reduced-motion` media query (disable animation, keep static border). Verify GPU-accelerated properties only (transform, opacity).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — MVP core
- **US3 (Phase 4)**: Depends on US1 (panel exists) — completes MVP
- **US2 (Phase 5)**: Depends on US1 (panel exists) — enhances panel
- **US4 (Phase 6)**: Depends on US2 (panel has footer structure) — adds export button
- **US5 (Phase 7)**: Depends on US3 (URL copy logic exists) — reuses clipboard flow
- **Polish (Phase 8)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: After Phase 2 — no story dependencies
- **US3 (P1)**: After US1 — needs CollectionPanel to exist for button placement
- **US2 (P2)**: After US1 — upgrades existing CollectionPanel with grouping
- **US4 (P2)**: After US2 — adds button to upgraded panel footer
- **US5 (P3)**: After US3 — reuses URL copy logic

### Within Each User Story

- Components marked [P] can be built in parallel (different files)
- File modifications (FileCard, FileListItem, FileBrowser, [subject].tsx, ModernHeader) depend on the components they import
- _app.tsx modifications should be done last in each phase

### Parallel Opportunities

**Phase 2**: T003 and T004 can run in parallel (context vs export utils)
**Phase 3 (US1)**: T006, T007, T008, T009, T010 can all run in parallel (5 new components). Then T011-T016 (modifications) run sequentially.
**Phase 5 (US2)**: T019 (CollectionGroup) runs in parallel, then T020 (panel upgrade) depends on it.
**Phase 8**: T023, T024, T025 can all run in parallel.

---

## Parallel Example: User Story 1

```text
# Launch all new components in parallel:
Task: "Create StudyModeToggle in src/components/study/StudyModeToggle.tsx"
Task: "Create SelectionOverlay in src/components/study/SelectionOverlay.tsx"
Task: "Create SessionItemRow in src/components/study/SessionItemRow.tsx"
Task: "Create CollectionPanel in src/components/study/CollectionPanel.tsx"
Task: "Create StudyFab in src/components/study/StudyFab.tsx"

# Then wire into existing files sequentially:
Task: "Modify FileCard.tsx"
Task: "Modify FileListItem.tsx"
Task: "Modify FileBrowser.tsx"
Task: "Modify [subject].tsx"
Task: "Modify ModernHeader.tsx"
Task: "Add StudyFab to _app.tsx"
```

---

## Implementation Strategy

### MVP First (US1 + US3)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Foundational (T003-T005)
3. Complete Phase 3: US1 — Select Materials (T006-T016)
4. **STOP and VALIDATE**: Test selection, persistence, cross-subject navigation
5. Complete Phase 4: US3 — Copy URLs (T017-T018)
6. **MVP COMPLETE**: Students can select materials and copy URLs for NotebookLM

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. US1 → selection works → validate
3. US3 → copy URLs works → **MVP deploy**
4. US2 → panel grouping → deploy
5. US4 → context export → deploy
6. US5 → NotebookLM shortcut → deploy
7. Polish → final refinements → deploy

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- No test tasks included (not requested in spec)
- Zero new npm dependencies — uses existing MUI, Framer Motion, React Context
- Zero server-side changes — entirely client-side feature
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
