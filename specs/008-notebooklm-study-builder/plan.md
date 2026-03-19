# Implementation Plan: NotebookLM Study Session Builder

**Branch**: `008-notebooklm-study-builder` | **Date**: 2026-03-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-notebooklm-study-builder/spec.md`

## Summary

Build a client-side "Study Mode" that lets students select file cards across multiple subject pages, collect them into a persistent session stored in localStorage, and export URLs + structured context for Google NotebookLM. The feature adds a header toggle (subject pages only), selection overlays on file cards, a FAB with item count badge, and a drawer-based collection panel with subject grouping, clipboard export, and NotebookLM handoff.

No new API routes, database models, or server-side changes. Entirely client-side using React Context, localStorage, and the existing component architecture.

## Technical Context

**Language/Version**: TypeScript 5.2.2 (strict mode)
**Primary Dependencies**: Next.js 15 (Pages Router), React 19, MUI v6, Framer Motion 11.3.28
**Storage**: localStorage (client-side persistence), browser Storage event (cross-tab sync)
**Testing**: Manual acceptance testing per user story scenarios
**Target Platform**: Web (desktop + mobile responsive), all modern browsers
**Project Type**: Web application (Next.js SSG)
**Performance Goals**: <500ms panel open, <1s clipboard copy, zero jank during selection
**Constraints**: No new npm dependencies; no server-side changes; <50 items per session (NotebookLM limit)
**Scale/Scope**: Single active session, up to 50 items, ~30 subjects across 9 semesters

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. User-Centered Performance | PASS | No new API calls. All state is client-side localStorage. Selection overlay uses CSS transitions (GPU-accelerated). Panel is lazy-rendered on FAB tap. |
| II. TypeScript Strict | PASS | All new files will be .tsx/.ts with explicit types. SessionItem and StudySession interfaces defined in data-model. No `any` usage. |
| III. Component Reusability | PASS | StudyModeToggle, SelectionOverlay, CollectionPanel, SessionItemRow are all prop-driven MUI compositions. FAB is a standalone component usable app-wide. |
| IV. Performance & Caching | PASS | No new API calls. localStorage reads are synchronous and fast. No Drive API calls. No cache invalidation needed. |
| V. Simplicity (YAGNI) | PASS | No new npm dependencies. Uses existing Context + localStorage patterns from project. No abstractions beyond what's needed. Single context provider, single hook. |

No violations. Complexity Tracking table not needed.

## Project Structure

### Documentation (this feature)

```text
specs/008-notebooklm-study-builder/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── context/
│   └── StudySessionContext.tsx    # NEW — context provider + hook
├── components/
│   ├── study/
│   │   ├── StudyModeToggle.tsx    # NEW — header toggle switch
│   │   ├── SelectionOverlay.tsx   # NEW — card selection ring/check
│   │   ├── StudyFab.tsx           # NEW — FAB with item count badge
│   │   ├── CollectionPanel.tsx    # NEW — drawer with grouped items
│   │   ├── CollectionGroup.tsx    # NEW — collapsible subject group
│   │   ├── SessionItemRow.tsx     # NEW — single item in panel
│   │   └── ClipboardFallback.tsx  # NEW — textarea fallback for copy
│   ├── ModernHeader.tsx           # MODIFIED — add StudyModeToggle
│   ├── FileCard.tsx               # MODIFIED — add selection props
│   ├── FileListItem.tsx           # MODIFIED — add selection props
│   └── FileBrowser.tsx            # MODIFIED — pass selection props
├── utils/
│   └── study-export.ts            # NEW — URL formatter + context generator
├── pages/
│   ├── _app.tsx                   # MODIFIED — add StudySessionProvider + StudyFab
│   └── subjects/
│       └── [subject].tsx          # MODIFIED — pass selection handlers to FileBrowser
└── styles/
    └── study-mode.css             # NEW — selection keyframe animations
```

**Structure Decision**: Feature follows the existing pattern — context in `context/`, components grouped in `components/study/`, utility functions in `utils/`, global CSS animations in `styles/`. No new directories outside the established structure except the `study/` component group.
