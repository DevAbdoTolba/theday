# Tasks: AI Study Cart & NotebookLM Exporter

**Input**: Design documents from `/specs/003-ai-study-cart/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Add shared types and utility functions that all user stories depend on

- [x] T001 Add AiCartItem interface to src/utils/types.ts with fields: id, name, url, type, className, subjectName, subjectAbbr, category, thumbnailUrl, addedAt
- [x] T002 [P] Create src/utils/ai-cart-helpers.ts with localStorage read/write utilities: readAiModeActive(), writeAiModeActive(), readAiCartItems(), writeAiCartItems() — JSON serialize/deserialize with try/catch for corrupt data

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core context provider and hook that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Create src/context/AiCartContext.tsx — React context provider with: aiModeActive state (localStorage-backed), items array (localStorage-backed), toggleAiMode, addItem (dedup by id), removeItem, toggleItem, clearCart, isSelected, exportMarkdown placeholder, itemCount computed value. Include cross-tab sync via window 'storage' event listener. Use utilities from T002
- [x] T004 [P] Create src/hooks/useAiCart.ts — convenience hook that calls useContext(AiCartContext) with descriptive error if used outside provider
- [x] T005 Wire AiCartProvider into src/pages/_app.tsx — add as innermost provider wrapping Component, after AuthProvider

**Checkpoint**: Foundation ready — cart state management works, persists to localStorage, syncs across tabs

---

## Phase 3: User Story 1 — Toggling AI Mode and Selecting Materials (Priority: P1) MVP

**Goal**: Students can toggle AI Mode ON, see visual cues on selectable materials, click to select/deselect items into the cart, navigate between pages with selections persisting

**Independent Test**: Toggle AI Mode on, navigate to a subject, click several materials, navigate to a different subject, click more materials, refresh the page — all selections and AI Mode state should persist

### Implementation for User Story 1

- [x] T006 [P] [US1] Create src/components/ai-cart/AiModeToggle.tsx — MUI Switch with label "AI Mode", uses useAiCart().toggleAiMode, shows active state with primary color. Compact enough for header toolbar
- [x] T007 [P] [US1] Create src/components/ai-cart/AiSelectionOverlay.tsx — absolute-positioned overlay for FileCard/FileListItem. Props: isSelectable (boolean, shows ambient pulse border), isSelected (boolean, shows checkmark + glow). Uses CSS class for ambient pulse, inline styles for selected state. Renders checkmark icon when selected
- [x] T008 [US1] Modify src/components/FileCard.tsx — add optional props: aiModeActive, isSelected, onAiSelect callback. When aiModeActive: set CardActionArea href to undefined, onClick calls onAiSelect(file) instead of opening URL. Render AiSelectionOverlay with isSelectable={aiModeActive} and isSelected. Wrap the card inner Box with position:relative for overlay positioning
- [x] T009 [P] [US1] Modify src/components/FileListItem.tsx — add optional props: aiModeActive, isSelected, onAiSelect callback. When aiModeActive: suppress default click behavior, call onAiSelect(file). Show selected visual state (border color change + checkmark icon replacing action icon)
- [x] T010 [US1] Modify src/components/FileBrowser.tsx — add props: aiModeActive, onAiSelect (callback receiving ParsedFile + category string), isItemSelected (id => boolean). Replace handleFileClick with AI selection handler when aiModeActive. Pass props through to FileCard and FileListItem in both grid and list render paths
- [x] T011 [US1] Modify src/pages/subjects/[subject].tsx — import useAiCart hook. Derive className from localStorage (already available via TranscriptContext DataContext). Derive subject full name from data.json lookup. Create onAiSelect handler that constructs AiCartItem from ParsedFile + className + subjectName + subjectAbbr + category, then calls cart.toggleItem(). Pass aiModeActive, onAiSelect, cart.isSelected to FileBrowser
- [x] T012 [US1] Add AiModeToggle to src/components/ModernHeader.tsx — import AiModeToggle, render in the right-side actions Box between the class switcher and the transcript key button. Use dynamic import for the toggle component

**Checkpoint**: AI Mode toggle works from header. Clicking materials in any subject selects/deselects them. Selections persist across page navigation and browser reload.

---

## Phase 4: User Story 2 — Viewing and Managing the Cart (Priority: P1)

**Goal**: Students can click the floating cart button to see their collected items grouped by Class > Subject, remove individual items, and clear the entire cart

**Independent Test**: Select several items across different subjects, click the FAB, verify items appear grouped by Class then Subject, remove one item, verify it disappears, click "Clear Cart", verify all items are removed

### Implementation for User Story 2

- [x] T013 [P] [US2] Create src/components/ai-cart/AiCartItemRow.tsx — single cart item row component. Shows item name, type icon (reuse FileIcon pattern from FileCard), and a remove IconButton (DeleteOutline). Calls cart.removeItem(id) on remove click. Compact layout suitable for a list inside a Drawer
- [x] T014 [US2] Create src/components/ai-cart/AiCartPanel.tsx — MUI Drawer (anchor="right"). Props: open, onClose. Uses useAiCart() to get items. Groups items by className then subjectName using Array.reduce(). Renders grouped list with Typography headings (h6 for class, subtitle2 for subject) and AiCartItemRow for each item. Includes "Clear Cart" Button at the bottom that calls cart.clearCart() and closes drawer. Shows empty state when itemCount === 0
- [x] T015 [US2] Create src/components/ai-cart/AiCartFab.tsx — MUI Fab with Badge. Uses useAiCart() for itemCount and aiModeActive. Visible when aiModeActive || itemCount > 0. Hidden otherwise (do not render or render with display:none). Badge shows itemCount. onClick toggles the AiCartPanel open/closed (local state). Positioned fixed bottom-right (bottom: 24, right: 24). Uses SmartToy or AutoAwesome icon
- [x] T016 [US2] Render AiCartFab globally in src/pages/_app.tsx — import and place AiCartFab inside AiCartProvider, after Component. This ensures the FAB is visible on every page

**Checkpoint**: FAB appears when AI Mode is active or cart has items. Clicking FAB opens the right Drawer showing items grouped by Class > Subject. Individual item removal and "Clear Cart" work correctly. Removing last item + turning off AI Mode hides the FAB.

---

## Phase 5: User Story 3 — Exporting to NotebookLM (Priority: P2)

**Goal**: Students can export their cart contents as hierarchical Markdown to clipboard and automatically open NotebookLM in a new tab

**Independent Test**: Add items from at least 2 subjects, click "Export for NotebookLM", verify clipboard contains properly formatted Markdown, verify NotebookLM opens in a new tab, verify success toast appears

### Implementation for User Story 3

- [x] T017 [US3] Implement formatCartToMarkdown() in src/utils/ai-cart-helpers.ts — takes AiCartItem[] and uses Array.reduce() to build a Markdown string grouped as: # Class Name > ## Subject Name > - [Item Name](URL). Items sorted by addedAt within each group. Classes and subjects sorted alphabetically
- [x] T018 [US3] Add "Export for NotebookLM" button and async handleAiExport handler to src/components/ai-cart/AiCartPanel.tsx — handler calls formatCartToMarkdown, then navigator.clipboard.writeText() wrapped in try/catch, then window.open('https://notebooklm.google.com/', '_blank'). On success: show MUI Snackbar toast with "Copied to clipboard! NotebookLM opened." Cart is NOT cleared after export (FR-016)
- [x] T019 [US3] Add clipboard fallback UI to src/components/ai-cart/AiCartPanel.tsx — when clipboard write fails (catch block), display the formatted Markdown in a read-only MUI TextField (multiline, fullWidth) with a "Copy" label so user can manually select and copy. Show error Snackbar: "Clipboard access denied. Please copy manually."

**Checkpoint**: Export generates correct Markdown grouped by Class > Subject. Clipboard copy works with success toast. NotebookLM opens in new tab. Fallback textarea appears if clipboard is denied. Cart remains intact after export.

---

## Phase 6: User Story 4 — Animated Selection Feedback (Priority: P3)

**Goal**: Selection and deselection of materials have smooth, polished animations with an AI/tech aesthetic that don't block interaction or cause jank

**Independent Test**: Toggle AI Mode on, rapidly click 5+ materials in succession, verify animations play smoothly without frame drops or interaction blocking

### Implementation for User Story 4

- [x] T020 [P] [US4] Create src/styles/ai-cart-animations.css — define @keyframes aiSelectablePulse for ambient border glow on selectable items (subtle opacity oscillation on box-shadow, 2s infinite). Define @keyframes aiSelectFlash for the selection confirmation flash. Import in _app.tsx
- [x] T021 [US4] Enhance src/components/ai-cart/AiSelectionOverlay.tsx with Framer Motion — wrap overlay in motion.div with AnimatePresence. Selection animation: scale pulse (1.0 → 1.05 → 1.0) + border glow fade-in + checkmark scale-in, duration 350ms. Deselection: reverse fade-out, duration 250ms. Use GPU-accelerated properties only (transform, opacity). Use layout={false} to avoid layout thrashing
- [x] T022 [P] [US4] Add Framer Motion animations to src/components/ai-cart/AiCartPanel.tsx — AnimatePresence for cart item enter/exit (fade + slide). Staggered children animation for the grouped list. Smooth drawer backdrop transition
- [x] T023 [US4] Add prefers-reduced-motion support — use Framer Motion useReducedMotion() hook in AiSelectionOverlay and AiCartPanel. When reduced motion is preferred: skip all motion animations (instant state transitions), disable CSS pulse keyframes via a class conditional, keep functional state changes (checkmark appears/disappears instantly)

**Checkpoint**: Selection shows smooth glow + checkmark animation (350ms). Deselection fades out smoothly (250ms). Rapid 5+ selections play without jank. Cart panel items animate in/out. All animations respect prefers-reduced-motion.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, error handling, and validation across all stories

- [x] T024 Handle localStorage full error in src/context/AiCartContext.tsx — wrap writeAiCartItems in try/catch, on QuotaExceededError show a Snackbar notification suggesting the user clear the cart
- [x] T025 [P] Ensure cart deduplication works correctly in src/context/AiCartContext.tsx — addItem must check items.some(i => i.id === item.id) before adding. toggleItem uses isSelected internally
- [x] T026 Verify cross-page state: selected items on the subject page show correct visual state when navigating back (isSelected check uses cart context, not local state)
- [x] T027 Manual end-to-end validation per quickstart.md test scenarios (8 scenarios)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (T001, T002) — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 completion — core selection flow
- **US2 (Phase 4)**: Depends on Phase 2 completion — can run in parallel with US1
- **US3 (Phase 5)**: Depends on Phase 4 (US2) — export button lives in the cart panel
- **US4 (Phase 6)**: Depends on Phase 3 (US1) and Phase 4 (US2) — animations enhance existing components
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: After Foundational — independent, no cross-story deps
- **US2 (P1)**: After Foundational — independent, no cross-story deps
- **US3 (P2)**: After US2 — export button is inside AiCartPanel
- **US4 (P3)**: After US1 + US2 — animations enhance AiSelectionOverlay and AiCartPanel

### Within Each User Story

- Components without cross-file dependencies marked [P] can run in parallel
- Integration tasks (modifying existing files) must run after their new dependencies are created
- Story complete before moving to next priority

### Parallel Opportunities

**Phase 1**: T001 and T002 can run in parallel
**Phase 2**: T003 and T004 can run in parallel (T004 depends only on T003's exported type, not implementation)
**Phase 3 (US1)**: T006 and T007 can run in parallel (new components). T008 and T009 can run in parallel (different existing files). T011 and T012 can run in parallel after T010
**Phase 4 (US2)**: T013 is independent. T014 depends on T013. T015 depends on T014. T016 depends on T015
**Phase 5 (US3)**: T017 is independent of T018/T019. T018 and T019 are sequential (same file)
**Phase 6 (US4)**: T020 and T022 can run in parallel (different files). T021 and T023 are sequential

---

## Parallel Example: User Story 1

```bash
# Launch new component creation in parallel:
Task: "Create AiModeToggle.tsx in src/components/ai-cart/"
Task: "Create AiSelectionOverlay.tsx in src/components/ai-cart/"

# Then modify existing files in parallel:
Task: "Modify FileCard.tsx to add AI mode props"
Task: "Modify FileListItem.tsx to add AI mode props"
```

## Parallel Example: User Story 2

```bash
# Create cart item component first (no deps):
Task: "Create AiCartItemRow.tsx in src/components/ai-cart/"

# Then sequentially (each depends on previous):
Task: "Create AiCartPanel.tsx (uses AiCartItemRow)"
Task: "Create AiCartFab.tsx (toggles AiCartPanel)"
Task: "Render AiCartFab in _app.tsx"
```

---

## Implementation Strategy

### MVP First (US1 + US2 Only)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Foundational (T003-T005)
3. Complete Phase 3: User Story 1 (T006-T012) — AI Mode toggle + selection
4. Complete Phase 4: User Story 2 (T013-T016) — Cart viewing + management
5. **STOP and VALIDATE**: Test selection flow + cart display independently
6. Deploy/demo — students can select and review materials

### Incremental Delivery

1. Setup + Foundational → Core state management ready
2. Add US1 → Students can toggle AI Mode and select materials (MVP-1)
3. Add US2 → Students can view, manage, and organize selections (MVP-2)
4. Add US3 → Full export pipeline to NotebookLM (Feature complete)
5. Add US4 → Polished animations and visual feedback (Enhanced UX)
6. Polish → Edge cases, performance validation

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks in same phase
- [Story] label maps task to specific user story for traceability
- No test tasks generated — project has no test framework configured
- Total new files: 9 (context, hook, 5 components, helpers, CSS)
- Total modified files: 6 (_app.tsx, ModernHeader, FileBrowser, FileCard, FileListItem, [subject].tsx)
- No backend changes — entire feature is client-side
