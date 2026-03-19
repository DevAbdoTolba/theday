# Feature Specification: AI Study Cart & NotebookLM Exporter

**Feature Branch**: `003-ai-study-cart`
**Created**: 2026-03-12
**Status**: Draft
**Input**: User description: "In-app shopping cart for study materials with AI Mode toggle, multi-page selection, floating cart FAB, grouped export to clipboard for NotebookLM"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Toggling AI Mode and Selecting Materials (Priority: P1)

A student browsing study materials across subjects wants to collect specific items (PDFs, YouTube videos, documents, links) into a cart for later export. They toggle "AI Mode" ON via a global switch, which transforms the browsing experience: each study material gains a visual selection indicator. Clicking a material while AI Mode is active adds it to the cart instead of opening/navigating to it. The selection is confirmed with a smooth animation. The student can navigate between subjects and pages freely, with their selections and AI Mode state persisting across page loads.

**Why this priority**: This is the core mechanic. Without multi-page selection and persistence, no other feature works. A student who can select materials across subjects has immediate value even before export exists.

**Independent Test**: Toggle AI Mode on, navigate to a subject, click several materials, navigate to a different subject, click more materials, refresh the page -- all selections and AI Mode state should persist.

**Acceptance Scenarios**:

1. **Given** AI Mode is OFF, **When** the student clicks the AI Mode toggle, **Then** AI Mode activates, a visual cue appears on all selectable study materials on the current page, and the floating cart button becomes visible.
2. **Given** AI Mode is ON, **When** the student clicks a study material, **Then** the item is added to the cart with a selection animation, the cart badge count increments, and the material shows a "selected" visual state.
3. **Given** AI Mode is ON and a material is already selected, **When** the student clicks it again, **Then** the material is deselected (removed from the cart) with a deselection animation, and the cart badge count decrements.
4. **Given** AI Mode is ON with 3 items selected, **When** the student navigates to a different subject page, **Then** the cart retains all 3 items, AI Mode remains ON, and materials on the new page show the selectable visual cue.
5. **Given** AI Mode is ON with items selected, **When** the student reloads the page, **Then** AI Mode is still ON, previously selected items remain in the cart, and the badge shows the correct count.
6. **Given** AI Mode is ON, **When** the student toggles AI Mode OFF, **Then** the selectable visual cues disappear from materials, clicking materials resumes normal behavior (opening/navigating), but the cart items are NOT cleared -- the cart remains accessible with a badge.
7. **Given** AI Mode is OFF and the cart has items, **When** the student clicks the floating cart button, **Then** the cart expands to show the collected items.

---

### User Story 2 - Viewing and Managing the Cart (Priority: P1)

A student who has collected materials wants to review their selections before exporting. They click the floating cart button (FAB) anchored to the bottom-right corner. The cart expands smoothly to reveal items organized hierarchically: first grouped by Class, then by Subject within each class. The student can see each item's title, type, and source. They can remove individual items from the cart, or clear the entire cart.

**Why this priority**: Viewing and managing selections is essential for the user to feel in control. Without the ability to review and edit, the cart is a black box.

**Independent Test**: Select several items across different subjects, click the FAB, verify items appear grouped by Class then Subject, remove one item, verify it disappears, click "Clear Cart", verify all items are removed.

**Acceptance Scenarios**:

1. **Given** the cart has items from multiple subjects across classes, **When** the student clicks the floating cart button, **Then** the cart expands with a smooth animation showing items grouped first by Class name, then by Subject name within each class.
2. **Given** the expanded cart shows a list of items, **When** the student clicks the remove button on an individual item, **Then** that item is removed from the cart, the badge count updates, and the corresponding material on the page (if visible) reverts to unselected state.
3. **Given** the expanded cart shows items, **When** the student clicks "Clear Cart", **Then** all items are removed, the cart collapses, and all visible materials revert to unselected state.
4. **Given** the cart is expanded, **When** the student clicks outside the cart or clicks the FAB again, **Then** the cart collapses smoothly.
5. **Given** the cart has 0 items and AI Mode is OFF, **When** the student looks at the screen, **Then** the floating cart button is hidden.

---

### User Story 3 - Exporting to NotebookLM (Priority: P2)

A student has collected all the materials they need and wants to export the collection to NotebookLM. They open the cart and click "Export for NotebookLM". The system formats the cart contents into a clean, hierarchical Markdown string (grouped by Class then Subject), copies it to the clipboard, opens NotebookLM in a new tab, and shows a success notification. The student can then paste the Markdown directly into NotebookLM.

**Why this priority**: Export is the payoff of the entire feature, but it depends on US1 and US2 being functional first. It is independently testable once the cart has items.

**Independent Test**: Add items from at least 2 subjects, click "Export for NotebookLM", verify clipboard contains properly formatted Markdown, verify NotebookLM opens in a new tab, verify success toast appears.

**Acceptance Scenarios**:

1. **Given** the cart has items from 2 classes and 3 subjects, **When** the student clicks "Export for NotebookLM", **Then** the system generates a Markdown string grouped as `# Class Name` > `## Subject Name` > `- [Item Title](URL)`, copies it to the clipboard, and opens NotebookLM in a new browser tab.
2. **Given** the export succeeds, **When** the clipboard write completes, **Then** a success notification (toast) appears confirming the Markdown was copied and NotebookLM was opened.
3. **Given** the browser blocks clipboard access (permissions denied), **When** the export is attempted, **Then** a user-friendly error message appears explaining the clipboard could not be accessed, and the Markdown is displayed in a copyable text area as a fallback.
4. **Given** the cart has items, **When** the student exports, **Then** the cart contents are NOT automatically cleared (the student may want to re-export or continue adding items).

---

### User Story 4 - Animated Selection Feedback (Priority: P3)

When AI Mode is active and a student selects or deselects a study material, the interaction is accompanied by smooth, high-performance animations that provide satisfying visual feedback. The animations should feel modern and polished with an AI/tech aesthetic -- subtle glows, particle-like effects, or smooth transitions that make the selection feel responsive and delightful. Animations must not block user interaction or cause jank.

**Why this priority**: Animations enhance the experience but are not required for core functionality. The cart works without them. This story adds polish.

**Independent Test**: Toggle AI Mode on, rapidly click 5+ materials in succession, verify animations play smoothly without frame drops or interaction blocking.

**Acceptance Scenarios**:

1. **Given** AI Mode is ON, **When** the student clicks a material to select it, **Then** a smooth selection animation plays (visual confirmation like a glow, pulse, or check-mark transition) completing within 400ms.
2. **Given** AI Mode is ON, **When** the student clicks a selected material to deselect it, **Then** a smooth deselection animation plays (reverse of selection, fade-out) completing within 300ms.
3. **Given** AI Mode is ON, **When** the student rapidly selects 5+ items in succession, **Then** all animations play without frame drops, each item responds immediately to the click, and no animation blocks the next interaction.
4. **Given** the student's device has reduced motion preferences enabled, **When** animations would normally play, **Then** animations are replaced with instant state transitions (no motion).

---

### Edge Cases

- What happens when the student selects the same material from two different loading states (static vs progressive refresh)? The cart deduplicates by unique file identifier.
- What happens when a material in the cart is no longer available (deleted from source between selection and export)? The export includes it as-is (the URL may be stale, but the user chose it).
- What happens when the student has items in the cart from a class they are no longer viewing? The items remain in the cart -- switching classes does not clear the cart.
- What happens when client-side storage is full? The system handles the error gracefully with a notification and suggests clearing the cart.
- What happens when the student has hundreds of items in the cart? The cart UI remains performant with efficient rendering. Export handles large Markdown strings.
- What happens when the student opens the app in a new tab? AI Mode state and cart items sync across tabs via shared client-side storage (same origin).
- What happens when a YouTube video is in the cart? The Markdown export includes the full YouTube URL, not just the video ID.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a global toggle switch for "AI Mode" accessible from any page in the application.
- **FR-002**: System MUST persist the AI Mode state (on/off) across page navigations and full page reloads using client-side storage.
- **FR-003**: System MUST persist the selected items array across page navigations and full page reloads using client-side storage.
- **FR-004**: When AI Mode is ON, the system MUST display a visual indicator on every selectable study material (files, YouTube videos, PDFs, documents, links) showing it can be selected.
- **FR-005**: When AI Mode is ON, clicking a study material MUST add it to the cart instead of performing the default action (opening the file or navigating).
- **FR-006**: When AI Mode is ON, clicking an already-selected material MUST remove it from the cart (toggle behavior).
- **FR-007**: Each selected item MUST store: a unique identifier, title/name, URL, content type, the Class it belongs to, the Subject it belongs to, and the category (folder) it was found in.
- **FR-008**: System MUST display a floating action button (FAB) anchored to the bottom-right of the viewport, visible when the cart has items or AI Mode is active.
- **FR-009**: The FAB MUST display a badge showing the total number of items in the cart.
- **FR-010**: Clicking the FAB MUST expand a cart panel showing items grouped hierarchically: first by Class, then by Subject within each class.
- **FR-011**: The cart MUST allow removal of individual items.
- **FR-012**: The cart MUST provide a "Clear Cart" action that removes all items and clears the persisted storage.
- **FR-013**: The cart MUST provide an "Export for NotebookLM" action that formats all items into a hierarchical Markdown string (Class > Subject > item links), copies it to the clipboard, and opens NotebookLM in a new browser tab.
- **FR-014**: The Markdown export format MUST be: `# Class Name` followed by `## Subject Name` followed by `- [Item Title](URL)` for each item, with items grouped under their respective headings.
- **FR-015**: If clipboard access is denied, the system MUST show a fallback UI allowing the user to manually copy the formatted Markdown.
- **FR-016**: The system MUST NOT clear the cart after a successful export (user may want to re-export or continue adding).
- **FR-017**: Toggling AI Mode OFF MUST NOT clear the cart. Items remain accessible. Only the selectable visual cues on materials are removed, and clicking materials resumes normal behavior.
- **FR-018**: The system MUST deduplicate cart entries by unique file identifier -- selecting the same file twice should toggle, not create duplicates.
- **FR-019**: Selection and deselection MUST be accompanied by smooth, high-performance animations that do not block user interaction.
- **FR-020**: The system MUST respect the user's reduced-motion accessibility preference and disable animations accordingly.

### Key Entities

- **AiCartItem**: A study material selected for export. Contains: unique identifier, display name, URL, content type (pdf, video, youtube, doc, etc.), class name, subject name, category name. Uniquely identified by its file identifier.
- **AiCart**: The collection of selected AiCartItems. Persisted in client-side storage. Supports add, remove, clear, and export operations. Items are logically grouped by Class > Subject for display and export.
- **AiModeState**: A boolean flag indicating whether AI selection mode is active. Persisted in client-side storage independently from the cart contents.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can toggle AI Mode and select their first study material within 2 seconds of deciding to use the feature.
- **SC-002**: Selected items persist with 100% reliability across page navigations, subject changes, and full browser reloads within the same session.
- **SC-003**: The floating cart displays the correct item count at all times, updating within 200ms of any add/remove action.
- **SC-004**: The export function produces correctly formatted, hierarchically grouped Markdown for any combination of classes, subjects, and item types.
- **SC-005**: The full export flow (format + clipboard copy + open NotebookLM) completes within 1 second for carts containing up to 100 items.
- **SC-006**: Selection animations maintain 60fps on mid-range devices during rapid sequential selections (5+ items in 3 seconds).
- **SC-007**: The cart UI remains responsive (scrollable, interactive) with up to 200 items loaded.
- **SC-008**: Users who select materials across 3+ subjects and export report the Markdown output as correctly grouped and usable in NotebookLM on first attempt.

## Assumptions

- The application is a single-origin web app, so client-side storage is accessible across all pages without cross-origin restrictions.
- Study materials are uniquely identifiable by their existing file identifier (Google Drive file ID or equivalent for external links).
- The user's class and subject context is available from existing application state when materials are selected.
- NotebookLM accepts pasted Markdown formatted text. The export does not need to integrate with NotebookLM's API -- clipboard copy plus opening a new tab is sufficient.
- "AI Mode" is a client-side-only feature. No backend changes or server-side authentication are required for the cart functionality.
- The cart stores metadata references (titles, URLs), not file contents. Storage size constraints do not apply to typical cart sizes (under 1000 items).
- Animations described as "AI/tech aesthetic" are interpreted as modern, polished transitions (glows, pulses, smooth transforms) rather than literal AI-generated motion.
