# Implementation Plan: AI Study Cart & NotebookLM Exporter

**Branch**: `003-ai-study-cart` | **Date**: 2026-03-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-ai-study-cart/spec.md`

## Summary

Add a client-side "AI Mode" toggle that transforms the study material browsing experience into a selection mode. Students can click materials across multiple pages to collect them into a persistent cart (localStorage). A floating action button (FAB) shows the cart contents grouped by Class > Subject, with a one-click export that formats items as hierarchical Markdown, copies to clipboard, and opens NotebookLM.

This is a **purely client-side feature** — no backend changes, no new API routes, no database modifications. The implementation adds a React context provider for cart state (persisted to localStorage), modifies existing components (FileBrowser, FileCard, FileListItem) to support selection mode, and introduces new cart UI components with Framer Motion animations.

## Technical Context

**Language/Version**: TypeScript 5.2.2 (strict mode)
**Primary Dependencies**: Next.js 15 (Pages Router), React 19, MUI v6, Framer Motion 11.3.28
**Storage**: localStorage (AI Mode state + cart items array)
**Testing**: Manual testing (no test framework configured in project)
**Target Platform**: Web (Vercel deployment), mobile-responsive
**Project Type**: Web application (Next.js Pages Router)
**Performance Goals**: 60fps animations, <400ms selection animation, <1s export for 100 items, <200ms cart badge update
**Constraints**: Client-side only, no new npm dependencies, must respect reduced-motion preference, must not degrade existing page load performance
**Scale/Scope**: Up to 200 items in cart, cross-page persistence, cross-tab sync via localStorage events

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. User-Centered Performance | PASS | Feature is client-side only — no additional API calls, no page load impact. Animations target 60fps. Accessibility: reduced-motion preference respected (FR-020). Cart badge updates within 200ms (SC-003). |
| II. TypeScript Strict | PASS | All new code will be TypeScript with explicit types for AiCartItem, AiCart state, context values, and component props. No `any` usage. |
| III. Component Reusability | PASS | New components (AiCartFab, AiCartPanel, AiModeToggle) will be reusable MUI-based components configured via props. Existing FileCard/FileListItem gain optional `onAiSelect` prop. Styles use MUI `sx` prop. |
| IV. Performance & Caching | PASS | No new API calls. Cart data is metadata-only references (titles, URLs, IDs) stored in localStorage. No Google Drive API calls. No impact on existing IndexedDB caching or PWA service worker. |
| V. Simplicity (YAGNI) | PASS | No new npm dependencies. Uses existing Framer Motion for animations. localStorage for persistence (simplest approach). Single context provider. No over-engineering — direct state management without external state libraries. |

**Gate Result: PASS** — All 5 principles satisfied. No violations to track.

## Project Structure

### Documentation (this feature)

```text
specs/003-ai-study-cart/
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
│   └── AiCartContext.tsx          # NEW: Cart state provider (localStorage-backed)
├── hooks/
│   └── useAiCart.ts               # NEW: Convenience hook for cart context
├── components/
│   ├── ai-cart/
│   │   ├── AiModeToggle.tsx       # NEW: Global AI Mode switch for header
│   │   ├── AiCartFab.tsx          # NEW: Floating action button with badge
│   │   ├── AiCartPanel.tsx        # NEW: Expandable cart panel (grouped list)
│   │   ├── AiCartItem.tsx         # NEW: Single cart item row
│   │   └── AiSelectionOverlay.tsx # NEW: Selection visual overlay for FileCard/FileListItem
│   ├── FileBrowser.tsx            # MODIFIED: Pass AI mode state to children
│   ├── FileCard.tsx               # MODIFIED: Add selection overlay when AI mode active
│   ├── FileListItem.tsx           # MODIFIED: Add selection behavior when AI mode active
│   └── ModernHeader.tsx           # MODIFIED: Add AiModeToggle to header actions
├── utils/
│   ├── types.ts                   # MODIFIED: Add AiCartItem interface
│   └── ai-cart-helpers.ts         # NEW: formatCartToMarkdown, cart localStorage utils
├── pages/
│   ├── _app.tsx                   # MODIFIED: Add AiCartProvider to provider chain
│   └── subjects/
│       └── [subject].tsx          # MODIFIED: Pass subject/class context to FileBrowser
└── styles/
    └── ai-cart-animations.css     # NEW: Keyframe animations for selection effects
```

**Structure Decision**: Follows the existing project convention — new feature components in a dedicated `src/components/ai-cart/` directory, new context in `src/context/`, new hook in `src/hooks/`, utilities in `src/utils/`. This matches the established patterns (e.g., `components/admin/`, `context/AuthContext.tsx`, `hooks/useAuth.ts`).

## Complexity Tracking

> No constitution violations — table not needed.
