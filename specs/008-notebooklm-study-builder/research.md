# Research: NotebookLM Study Session Builder

**Date**: 2026-03-16 | **Feature**: 008-notebooklm-study-builder

## R1: localStorage Persistence Pattern

**Decision**: Use two localStorage keys — `studyModeActive` (boolean string) and `studySessionItems` (JSON array of SessionItem objects).

**Rationale**: Matches the pattern used by the removed AI cart feature (which used `aiModeActive` and `aiCartItems`). Two keys allow toggling study mode independently of clearing items. JSON serialization of an array is simple and handles up to 50 items (well under localStorage's ~5MB limit — 50 items is ~15KB max).

**Alternatives considered**:
- Single localStorage key with nested object: Rejected — requires parsing the full object to check mode state.
- IndexedDB via Dexie: Rejected (YAGNI) — Dexie is in the project for large datasets. 50 small items don't need it. localStorage is synchronous and simpler.
- sessionStorage: Rejected — does not persist across browser sessions (FR-005 requires it).

## R2: Cross-Tab Sync

**Decision**: Use the `window.storage` event to sync state across tabs. When one tab writes to localStorage, other tabs receive the event and update their React state.

**Rationale**: This is the standard browser mechanism. The removed AI cart used the same approach. No additional dependencies needed.

**Alternatives considered**:
- BroadcastChannel API: Rejected — slightly better ergonomics but doesn't cover the persistence requirement (still need localStorage anyway, so storage events come for free).
- SharedWorker: Rejected — over-engineered for syncing a small JSON payload.

## R3: Context Architecture

**Decision**: Single `StudySessionContext` with a `useStudySession` hook. The context provides: `isActive`, `items`, `itemCount`, `toggleMode()`, `addItem(item)`, `removeItem(id)`, `toggleItem(item)`, `clearAll()`, `isSelected(id)`, `exportUrls()`, `exportContext()`.

**Rationale**: Mirrors the removed AiCartContext pattern which was battle-tested in this codebase. Single context avoids provider nesting complexity. The hook provides a clean API surface.

**Alternatives considered**:
- Zustand or other state library: Rejected (YAGNI + Constitution Principle V) — no new dependencies when Context + useState solves the problem.
- Multiple contexts (mode vs items): Rejected — unnecessary separation for tightly coupled state.

## R4: Selection Visual Pattern

**Decision**: Use a CSS-driven selection overlay component (`SelectionOverlay`) that renders inside each file card. When Study Mode is active, cards show a subtle pulsing border. When selected, cards show a solid primary-color border with a check icon overlay. Framer Motion `AnimatePresence` handles the check icon entrance.

**Rationale**: CSS transitions are GPU-accelerated and don't cause layout shifts. The overlay is positioned absolute inside the card, so it doesn't affect card sizing. Framer Motion is already in the project for animations.

**Alternatives considered**:
- Pure CSS animations without Framer Motion: Viable but Framer Motion's `AnimatePresence` handles mount/unmount animations more cleanly for the check icon.
- Full card re-render with different styles: Rejected — more expensive and harder to maintain as a separate visual layer.

## R5: Collection Panel UX

**Decision**: Right-side MUI Drawer (desktop) / bottom Sheet (mobile). Triggered by FAB tap. Panel contains: header with count + close button, scrollable body with collapsible subject groups, footer with action buttons (Copy URLs, Copy Context, Open NotebookLM, Clear All).

**Rationale**: MUI Drawer is already used in the project (SubjectSidebar). Consistent UX. Bottom sheet on mobile follows Material Design patterns for action panels. Footer buttons keep export actions always visible.

**Alternatives considered**:
- Full-page overlay: Rejected — too disruptive; students want to see their collection while still on the subject page.
- Dialog/Modal: Rejected — modals block interaction with the page underneath; drawer allows side-by-side.

## R6: Study Context Export Format

**Decision**: Use a structured XML-inspired plain text format. Example:

```xml
<study-session>
  <subject name="Data Structures" abbreviation="DS">
    <category name="Lectures">
      <material name="Lecture 5 — Trees" type="pdf" />
      <material name="AVL Tree Demo" type="youtube" />
    </category>
    <category name="Assignments">
      <material name="HW3 — BST Implementation" type="doc" />
    </category>
  </subject>
  <subject name="Algorithms" abbreviation="ALGO">
    <category name="Lectures">
      <material name="Dynamic Programming" type="pdf" />
    </category>
  </subject>
  <instructions>
    This study session combines materials from multiple courses.
    Help the student identify connections between subjects,
    create comprehensive study notes, and prepare for exams.
    Focus on cross-subject relationships where concepts overlap.
  </instructions>
</study-session>
```

**Rationale**: XML-like structure is easily parsed by LLMs. NotebookLM ingests this as a text source and uses it to understand the material organization. The format is human-readable for students who inspect it. Inspired by repomix.com's approach to structured context.

**Alternatives considered**:
- JSON: Rejected — less readable for students, more verbose with quotes and braces.
- Markdown: Rejected — LLMs sometimes confuse markdown formatting with content. XML tags are unambiguous delimiters.
- YAML: Rejected — indentation-sensitive formats are fragile when copied between apps.

## R7: File Card Integration Points

**Decision**: Add three optional props to FileCard and FileListItem: `studyModeActive?: boolean`, `isSelected?: boolean`, `onStudySelect?: (file: ParsedFile) => void`. When `studyModeActive` is true, card click calls `onStudySelect` instead of opening the file. FileBrowser receives these from the subject page and passes them through.

**Rationale**: This is the exact same integration pattern the removed AI cart used. The props are optional with no defaults change, so components work identically when Study Mode is not active (FR-017).

**Alternatives considered**:
- Global event emitter: Rejected — React props are the standard data flow pattern. Events are harder to trace and test.
- Context consumed directly in FileCard: Rejected — makes FileCard tightly coupled to study mode. Props keep it reusable (Constitution Principle III).

## R8: FAB Placement and Behavior

**Decision**: FAB is rendered in `_app.tsx` (always mounted). Visible when `isActive || itemCount > 0`. Positioned bottom-right, z-index above page content but below drawer. Shows item count badge via MUI Badge. Tap opens the CollectionPanel drawer.

**Rationale**: App-level rendering ensures the FAB is visible on all pages (FR-006 — FAB on any page if items exist). The visibility condition ensures it disappears only when there are no items and Study Mode is off.

**Alternatives considered**:
- FAB only on subject pages: Rejected — spec clarification says FAB visible on any page if items exist, so students can export from home page.
- Multiple FABs (one per page): Rejected — single instance in _app.tsx is simpler and avoids duplication.
