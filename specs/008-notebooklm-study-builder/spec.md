# Feature Specification: NotebookLM Study Session Builder

**Feature Branch**: `008-notebooklm-study-builder`
**Created**: 2026-03-16
**Status**: Draft
**Input**: User description: "Redesign the AI study cart into an immersive Study Session Builder that helps students collect study materials from multiple subjects/courses and export them to Google NotebookLM."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Select Materials Across Subjects (Priority: P1)

A student preparing for finals wants to collect study materials from multiple subjects (e.g., Data Structures + Algorithms) into a single study session. They activate "Study Mode" from the header, which visually transforms the browsing interface into a selection-focused experience. File cards gain selection rings — tapping/clicking a card toggles it into the collection. The student navigates between subjects freely, adding materials from different courses, and sees their growing collection in a floating panel.

**Why this priority**: Without the ability to select and collect materials, no other feature (export, context generation) can function. This is the core interaction loop.

**Independent Test**: Can be fully tested by activating study mode, navigating to 2+ subjects, tapping file cards, and verifying selections persist across subject navigation. Delivers the core "collect materials" value.

**Acceptance Scenarios**:

1. **Given** a student is on any subject page, **When** they activate Study Mode from the header toggle, **Then** the interface visually transforms (selection rings appear on file cards, a FAB with item count badge appears) and file cards become tappable for selection.
2. **Given** Study Mode is active, **When** the student taps a file card, **Then** the card shows a selected state (visual indicator) and the item appears in the floating collection panel.
3. **Given** the student has selected items in Subject A, **When** they navigate to Subject B and select more items, **Then** all previously selected items from Subject A remain in the collection.
4. **Given** Study Mode is active, **When** the student taps an already-selected card, **Then** the item is deselected and removed from the collection panel.
5. **Given** the student has items in their collection, **When** they close and reopen the browser tab, **Then** their collection persists (stored locally on device).
6. **Given** Study Mode is not active, **When** the student taps a file card, **Then** the normal behavior occurs (opens the file/video) — selection mode does not interfere.

---

### User Story 2 - Review & Organize Collection (Priority: P2)

A student has collected materials from 3 subjects and wants to review what they've gathered before exporting. They open the collection panel and see items automatically grouped by subject with visual separation (subject headers, color-coded chips). They can expand/collapse subject groups, remove individual items, and see a count of total items and per-subject items. The panel also shows a warning if they approach the 50-source NotebookLM limit.

**Why this priority**: Students need to review and curate their collection before exporting. Without organization, a flat list of 20+ items from multiple subjects would be unusable.

**Independent Test**: Can be tested by selecting items from multiple subjects, opening the collection panel, and verifying grouping, counts, collapse/expand, and item removal all work correctly.

**Acceptance Scenarios**:

1. **Given** the student has selected items from multiple subjects, **When** they view the collection panel, **Then** items are grouped under subject headers (e.g., "Data Structures", "Algorithms") with clear visual separation.
2. **Given** a subject group is visible in the collection panel, **When** the student taps the subject header, **Then** the group collapses/expands to show/hide its items.
3. **Given** an item is in the collection panel, **When** the student taps the remove button on that item, **Then** the item is removed from the collection and its card on the browse page loses its selected state.
4. **Given** the student has items in their collection, **When** they view the panel header, **Then** they see the total item count and a per-subject breakdown.
5. **Given** the student has 40+ items in their collection, **When** they view the panel, **Then** a warning appears indicating they are approaching the 50-source NotebookLM limit.
6. **Given** the student wants to start over, **When** they tap "Clear All" in the panel, **Then** all items are removed after a confirmation prompt.

---

### User Story 3 - Copy URLs for NotebookLM (Priority: P1)

A student has curated their collection and wants to add these materials as sources in NotebookLM. They tap "Copy URLs" in the collection panel, which copies all selected file URLs (Google Drive preview URLs and YouTube watch URLs) to their clipboard. A toast confirms the copy and briefly guides: "Paste these as website URL sources in NotebookLM."

**Why this priority**: This is the primary export action — the main reason students build a collection. Without it, the feature has no output. Shares P1 with selection because both are essential for the minimum viable flow.

**Independent Test**: Can be tested by selecting items, tapping "Copy URLs", pasting into a text editor, and verifying all URLs are present and correctly formatted.

**Acceptance Scenarios**:

1. **Given** the student has items in their collection, **When** they tap "Copy URLs for NotebookLM", **Then** all item URLs are copied to the clipboard, one per line.
2. **Given** a collection contains Google Drive files, **When** URLs are copied, **Then** each Drive file URL follows the format `https://drive.google.com/file/d/{ID}/preview`.
3. **Given** a collection contains YouTube videos, **When** URLs are copied, **Then** each YouTube URL is the original watch/youtu.be URL.
4. **Given** URLs are copied successfully, **When** the copy completes, **Then** a toast notification appears confirming the copy and providing a brief instruction to paste in NotebookLM.
5. **Given** the clipboard API is not available (older browser or denied permission), **When** the student taps copy, **Then** a fallback displays the URLs in a selectable text area for manual copying.

---

### User Story 4 - Copy Study Context for NotebookLM (Priority: P2)

A student wants to give NotebookLM additional context about how their collected materials relate to each other across subjects. They tap "Copy Study Context" which copies a structured text prompt containing course metadata, material names organized by subject and category, and instructions for the AI. The student pastes this as an additional text source in NotebookLM.

**Why this priority**: Enhances AI comprehension of cross-subject relationships, but the feature is still usable without it (URLs alone are sufficient for basic NotebookLM usage).

**Independent Test**: Can be tested by selecting items from multiple subjects, tapping "Copy Study Context", pasting into a text editor, and verifying the structured output contains correct subject names, categories, material titles, and AI instructions.

**Acceptance Scenarios**:

1. **Given** the student has items from multiple subjects, **When** they tap "Copy Study Context", **Then** a structured text is copied to the clipboard containing subject metadata, material listings by category, and AI study instructions.
2. **Given** the context is generated, **When** inspected, **Then** materials are grouped by subject, then by category within each subject, with each material's name and type listed.
3. **Given** the context is generated, **When** inspected, **Then** it includes brief AI instructions explaining the cross-subject study context and suggesting how to help the student connect concepts.
4. **Given** the clipboard write succeeds, **When** the copy completes, **Then** a toast notification confirms and instructs: "Paste this as a text source in NotebookLM for better AI context."

---

### User Story 5 - Open in NotebookLM (Priority: P3)

A student has copied their URLs and optionally their study context. They tap "Open in NotebookLM" which opens NotebookLM in a new browser tab. A toast guide reminds them: "Create a new notebook, then add your copied URLs as website sources."

**Why this priority**: Convenience shortcut — students can open NotebookLM manually, but this reduces friction. Lower priority because it's a single link with no complex logic.

**Independent Test**: Can be tested by tapping the button and verifying NotebookLM opens in a new tab and a toast guide appears.

**Acceptance Scenarios**:

1. **Given** the student taps "Open in NotebookLM", **When** the action executes, **Then** NotebookLM opens in a new browser tab.
2. **Given** the student has not yet copied URLs, **When** they tap "Open in NotebookLM", **Then** URLs are automatically copied to clipboard first, then NotebookLM opens, and a toast confirms both actions.
3. **Given** NotebookLM opens, **When** the student sees the toast, **Then** it provides step-by-step guidance: "Create a new notebook → Add sources → Paste as website URLs."

---

### Edge Cases

- What happens when a student selects a file that is later deleted from Drive? The URL will be invalid in NotebookLM — no action needed from our side; NotebookLM will report the source as unavailable.
- What happens when the student has exactly 50 items (NotebookLM limit)? The system shows a limit-reached warning and prevents adding more items, with a message explaining the 50-source limit.
- What happens when the student selects items in Study Mode and then the page data refreshes (progressive loading adds new files)? Existing selections must be preserved; new files appear unselected.
- What happens on very small screens (< 360px width)? The collection panel should take full screen width as a bottom sheet or drawer rather than a floating panel.
- What happens if the student navigates away from a subject page (e.g., to the home page) while in Study Mode? Study Mode state and selections persist; returning to any subject page restores the mode.
- What happens when copying fails silently (e.g., background tab on some mobile browsers)? Fall back to displaying content in a selectable text area with a "Select All" button.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a Study Mode toggle accessible from the page header on subject browsing pages only (not on home or semester pages).
- **FR-002**: System MUST visually distinguish Study Mode from normal browsing mode with clear visual indicators on file cards (selection rings, overlay effects).
- **FR-003**: System MUST allow students to select/deselect individual file cards by tapping or clicking while in Study Mode. Folder-type items are excluded from selection (no selection ring; normal click behavior preserved).
- **FR-004**: System MUST persist selected items across subject page navigation (student can browse Subject A, select items, navigate to Subject B, select more, and all remain).
- **FR-005**: System MUST persist Study Mode state and selected items locally on the device across browser sessions.
- **FR-006**: System MUST provide a floating action button (FAB) with an item count badge, visible on any page when Study Mode is active or collected items exist. Tapping the FAB opens the collection panel as a drawer/sheet overlay.
- **FR-007**: System MUST group collected items by subject in the collection panel, with collapsible sections and visual differentiation (subject name headers, color or icon).
- **FR-008**: System MUST display total item count and per-subject item counts in the collection panel.
- **FR-009**: System MUST allow removal of individual items from the collection panel.
- **FR-010**: System MUST allow clearing all items from the collection with a confirmation step.
- **FR-011**: System MUST provide a "Copy URLs" action that copies all collected item URLs to the clipboard, one per line, using the correct format (Drive preview URLs for files, original URLs for YouTube/external links).
- **FR-012**: System MUST provide a "Copy Study Context" action that copies a structured text containing subject metadata, categorized material listings, and AI study instructions to the clipboard.
- **FR-013**: System MUST provide an "Open in NotebookLM" action that opens NotebookLM in a new tab and auto-copies URLs to clipboard if not already copied.
- **FR-014**: System MUST show toast notifications confirming clipboard actions with brief guidance on next steps in NotebookLM.
- **FR-015**: System MUST provide a clipboard fallback (selectable text area) when the clipboard API is unavailable or fails.
- **FR-016**: System MUST warn students when their collection approaches or reaches the 50-item NotebookLM source limit.
- **FR-017**: System MUST NOT interfere with normal file card behavior (opening files, playing videos) when Study Mode is inactive.
- **FR-018**: System MUST work in both grid and list view modes for file browsing.
- **FR-019**: System MUST support both light and dark themes for all Study Mode UI elements.
- **FR-020**: System MUST synchronize Study Mode state across browser tabs on the same device.

### Key Entities

- **Study Session**: A temporary, locally-stored collection of materials a student has gathered for export. Contains selected items, creation timestamp, and active/inactive state.
- **Session Item**: A reference to a single file or video in the collection. Contains file ID, display name, URL, file type, source subject name, source subject abbreviation, source category, optional thumbnail URL, and selection timestamp.
- **Study Context Export**: A structured text document generated from a session's items, organized by subject and category, containing material metadata and AI instructions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Students can activate Study Mode, select materials from 3+ subjects, and copy URLs in under 2 minutes.
- **SC-002**: Selected items persist across subject navigation with zero items lost during a browsing session.
- **SC-003**: The "Copy URLs" action produces a valid, correctly-formatted URL list within 1 second of tapping.
- **SC-004**: The collection panel loads and displays grouped items within 500ms of opening.
- **SC-005**: Study Mode visual transformation is noticeable and engaging — file cards clearly indicate selectability and selected state without requiring a tutorial.
- **SC-006**: All Study Mode interactions (select, deselect, open panel, copy) are responsive on both mobile and desktop with no perceived lag.
- **SC-007**: The feature works correctly with collections of up to 50 items (NotebookLM limit) without degradation.
- **SC-008**: 90% of first-time users can complete the full flow (activate → select → copy → open NotebookLM) without external help, guided only by in-UI prompts and toasts.

## Clarifications

### Session 2026-03-16

- Q: Is the collection panel always visible in Study Mode or toggled? → A: Hidden by default, toggled via a floating action button (FAB) with item count badge. The FAB provides constant awareness of collection size without consuming screen space.
- Q: Can folder-type items be selected in Study Mode? → A: No. Folders are not selectable (no selection ring, normal click behavior preserved). They have no usable URL for NotebookLM.
- Q: Where is the Study Mode toggle available? → A: Toggle on subject pages only. The FAB (with item count) is visible on any page if items exist, so students can review/export their collection from anywhere.

## Assumptions

- **A-001**: NotebookLM has no API or deep linking — all source addition is manual (copy/paste by the student). This is a platform constraint, not a limitation to solve.
- **A-002**: The 50-source limit per NotebookLM notebook is a current platform constraint. The system enforces this as a soft cap with warnings.
- **A-003**: YouTube videos in NotebookLM require captions to be useful as sources. The system does not validate caption availability — this is NotebookLM's responsibility.
- **A-004**: Students are familiar with Google NotebookLM and understand the concept of "adding sources." The feature does not need to teach NotebookLM basics beyond brief toast guidance.
- **A-005**: Cross-tab sync uses the browser's storage event mechanism. Tabs on different devices do NOT sync (local storage only).
- **A-006**: The structured study context export uses a human-readable XML-inspired format. The exact format will be determined during planning, optimized for NotebookLM's text source parsing.
- **A-007**: Study Mode is available to all users (no authentication required). The feature operates entirely client-side with no server interaction.

## Scope Boundaries

### In Scope
- Study Mode toggle and visual transformation
- Material selection on file cards (grid and list view)
- Floating collection panel with subject grouping
- Copy URLs to clipboard
- Copy structured study context to clipboard
- Open NotebookLM shortcut with toast guidance
- Local persistence (localStorage) with cross-tab sync
- 50-item limit enforcement
- Mobile and desktop responsive design
- Light and dark theme support

### Out of Scope
- Direct integration with NotebookLM API (does not exist on free tier)
- Server-side storage of study sessions (purely client-side)
- Sharing study sessions between students
- Automatic caption detection for YouTube videos
- Study session history or saved sessions (only one active session at a time)
- Analytics or tracking of study mode usage
