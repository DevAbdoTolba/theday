# Research: AI Study Cart & NotebookLM Exporter

**Branch**: `003-ai-study-cart` | **Date**: 2026-03-12

## R1: localStorage Persistence Strategy

**Decision**: Use `localStorage.getItem`/`setItem` with JSON serialization for both `aiModeActive` (boolean) and `aiCartItems` (AiCartItem[]). Sync writes on every state change via a `useEffect` in the context provider.

**Rationale**: The project already uses localStorage extensively (theme mode, classes, className, semester, lastVisitedSubject, notes). This is the established persistence pattern. The cart stores metadata references only (not file contents), so storage size is not a concern for typical usage (< 1000 items × ~200 bytes = ~200KB, well within localStorage's 5-10MB limit).

**Alternatives considered**:
- **IndexedDB (Dexie)**: Already used for subject caching, but overkill for a simple key-value pair + flat array. localStorage is simpler and sufficient.
- **React state only (no persistence)**: Violates FR-002/FR-003 — cart must survive page reloads.
- **sessionStorage**: Would not persist across tabs or new sessions. Spec requires cross-tab sync (Edge Case 6).

## R2: Cross-Tab Synchronization

**Decision**: Listen for `storage` events on `window` to detect cart changes from other tabs. When a `storage` event fires for the cart keys, re-read and update React state.

**Rationale**: The `storage` event fires automatically when localStorage is modified in another tab (same origin). This is the native browser mechanism — no additional libraries needed. Spec Edge Case 6 requires cross-tab sync.

**Implementation detail**: The `AiCartContext` provider will add a `window.addEventListener('storage', handler)` that filters for the `aiCartItems` and `aiModeActive` keys, then calls the React state setters with the parsed new values.

## R3: Animation Approach (Framer Motion)

**Decision**: Use Framer Motion (`motion.div`, `AnimatePresence`) for selection/deselection animations and cart panel transitions. Use CSS `@keyframes` for the ambient glow/pulse effect on selectable items.

**Rationale**: Framer Motion 11.3.28 is already installed and used throughout the codebase (SemesterCard, SearchDialog, etc.). The established pattern uses `variants` objects with `initial`/`animate`/`exit` states. This approach:
- Delivers 60fps GPU-accelerated animations via `transform` and `opacity`
- Supports `AnimatePresence` for smooth enter/exit of cart items
- Handles `prefers-reduced-motion` via Framer Motion's built-in `useReducedMotion` hook

**Selection animation design**:
- **Select**: Scale pulse (1.0 → 1.05 → 1.0) + border glow fade-in + checkmark overlay fade-in. Duration: 350ms.
- **Deselect**: Reverse — glow fade-out + checkmark fade-out. Duration: 250ms.
- **Ambient "selectable" cue**: Subtle pulsing border (CSS `@keyframes`) when AI Mode is ON — no Framer Motion needed for this (cheaper, always-on animation).

**Alternatives considered**:
- **CSS-only animations**: Simpler but lacks `AnimatePresence` for the cart panel slide-in/out and coordinated list animations.
- **react-spring**: Not in the project's dependency list; adding it would violate Constitution Principle V (YAGNI — Framer Motion already covers the need).
- **MUI Transitions (Grow, Slide, Fade)**: Adequate for simple transitions but insufficient for the coordinated selection effects and staggered list animations.

## R4: Cart Panel UI Pattern

**Decision**: The cart will be a Drawer (MUI `Drawer` with `anchor="right"`) that opens from the right side of the viewport. It will be triggered by clicking the FAB.

**Rationale**: The project already uses the sidebar drawer pattern (`SubjectSidebar`) for navigation. A right-anchored Drawer:
- Provides consistent UX with the existing sidebar pattern (left = navigation, right = cart)
- Handles mobile/desktop responsively via MUI's built-in Drawer behavior
- Supports smooth open/close transitions natively
- Does not overlay the main content awkwardly like a popover would
- Scales well for large cart sizes (200+ items) with scrollable content

**Alternatives considered**:
- **Popover/Menu**: Too small for displaying grouped items; would clip on mobile
- **Dialog/Modal**: Too intrusive; blocks the underlying page
- **Inline expansion below FAB**: Complex positioning, doesn't scale for large carts

## R5: Unique Identifier Strategy for Cart Items

**Decision**: Use the Google Drive `file.id` as the unique identifier for Drive-hosted files. For external links (YouTube URLs, external websites parsed from Drive file names), use the extracted URL as the identifier.

**Rationale**: The existing `ParsedFile` interface already provides `file.id` (Drive file ID) and `file.url` (the clickable link). The `parseGoogleFile` helper already extracts external URLs from the file name for link-type files. This gives us a natural unique key:
- Drive files: `id` (globally unique Drive file ID)
- External links: `url` (the extracted URL is the canonical identifier)

This aligns with the spec's assumption: "Study materials are uniquely identifiable by their existing file identifier (Google Drive file ID or equivalent for external links)."

**Deduplication**: Use `file.id` as the cart dedup key — the `ParsedFile.id` is always the Drive file ID, which is unique even for external link files (the link URL is encoded in the Drive file name, but the file itself has a unique Drive ID). This is the simplest and most reliable approach.

## R6: Class and Subject Context for Cart Items

**Decision**: Derive the class name from the `TranscriptContext` (`className` from `DataContext`) and the subject name from the `[subject].tsx` page route parameter. The category (folder) name comes from the `FileBrowser`'s active tab/category.

**Rationale**: When a student is browsing `/subjects/CALC1`, the page already has:
- **Subject abbreviation**: From the route parameter (`subject`)
- **Subject full name**: Derivable from `data.json` lookup (already done in `[subject].tsx`)
- **Class name**: From `localStorage.getItem("className")` (set by TranscriptContext/ModernHeader class switcher)
- **Category name**: From the FileBrowser's active tab (category key from `SubjectMaterials`)

These values will be passed down through props to FileCard/FileListItem so they can construct complete `AiCartItem` objects when selected.

## R7: Integration with Existing Click Handlers

**Decision**: When AI Mode is ON, intercept clicks in `FileCard` and `FileListItem` before the existing `onClick` handler. The AI selection handler (`onAiSelect`) takes priority — `onClick` (which opens files/plays videos) is suppressed.

**Rationale**: The spec is explicit: "clicking a study material item prevents default navigation" (FR-005). The current click flow is:
- `FileCard`: `CardActionArea` with `href={file.url}` opens a new tab; YouTube files call `onClick` which triggers `YoutubePlayer`
- `FileListItem`: Similar click-to-open behavior
- `FileBrowser.handleFileClick`: Either opens YouTube player or `window.open(file.url)`

When AI Mode is ON, all of these must be suppressed. The implementation will:
1. Add an `aiModeActive` prop and `onAiSelect` callback to FileCard/FileListItem
2. When `aiModeActive`, the `CardActionArea` will have `href={undefined}` and `onClick` will call `onAiSelect` instead
3. This is a clean conditional override — no monkey-patching
