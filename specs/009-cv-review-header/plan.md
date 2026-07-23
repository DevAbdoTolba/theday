# Implementation Plan: CV Review Header Invitation

**Branch**: `009-cv-review-header` | **Date**: 2026-07-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/009-cv-review-header/spec.md`

## Summary

Add one reusable CV-review invitation to `ModernHeader`, which already serves both in-scope page families: the student dashboard and subject browsing pages. The invitation starts as a compact "CV" mark, previews on fine-pointer hover or keyboard focus, pins on activation, and uses a browser-native CSS transition to form an organic panel without shifting the header or page.

The short ad opens an image-only reviewer-selection dialog backed by a strict,
static three-reviewer configuration. Each photo is the complete clipped
selection section. Complementary polygon cuts create the diagonal joins without
rendered divider lines, cards, or avatars. Hover only brightens a photo;
selection reveals one black name and raises one yellow Meet link. All temporary
records use Picsum photos and open `https://example.com/` in a new tab.

The feature is client-only. It adds no API route, database model, persistence, Calendly embed, Calendly SDK, preflight request, analytics integration, or npm dependency.

## Technical Context

**Language/Version**: TypeScript 5.2.2 in strict mode; React 19.2.3; Next.js 15.5.9 Pages Router

**Primary Dependencies**: MUI v6, Emotion, React; existing `ClickAwayListener`, `Dialog`, `RadioGroup`, `Button`, and theme utilities. Framer Motion is installed but intentionally not used by this feature.

**Storage**: N/A. Reviewer configuration is static and public; invitation, dialog, and selection state live only in component memory.

**Testing**: TypeScript check, direct ESLint, Storybook 8.6 visual/a11y coverage, Storybook production build, Next.js production build, and manual acceptance scenarios. The repository has no configured unit or end-to-end test runner.

**Target Platform**: Responsive web on current desktop and mobile browsers; mouse, keyboard, touch, and assistive technology; minimum 320 CSS-pixel viewport; light/dark themes; 200% text zoom; reduced-motion preference

**Project Type**: Client-side UI feature in an existing Next.js web application

**Performance Goals**: Visible response within 100 ms; stable readable panel within 600 ms; no header/page layout shift; no queued animations during rapid reversal; no external request before deliberate Meet handoff other than loading the requested Picsum placeholders

**Constraints**: Dashboard and subject pages only; one continuously outlined invitation surface; native browser CSS motion; no new dependency; image-only idle dialog; three full-surface clipped photo sections; no rendered divider lines/cards/avatars; one yellow Meet action; temporary `example.com` destination opens in a new browsing context

**Scale/Scope**: One shared header integration, one invitation panel and dialog per rendered page, three fixed reviewer records, one in-memory selection, and three eventual public Calendly links

## Constitution Check

*GATE: Passed before Phase 0 research and re-checked after Phase 1 design.*

| Principle | Pre-Research | Post-Design | Evidence |
|-----------|--------------|-------------|----------|
| I. User-Centered Performance | PASS | PASS | Client-only rendering, no new requests before handoff, an absolutely positioned panel that cannot move page layout, explicit motion budgets, reduced-motion behavior, keyboard support, and 320px/200% zoom validation. |
| II. TypeScript Strict | PASS | PASS | Reviewer IDs, booking availability, visual tier, invitation state, dialog props, and URL validation use explicit unions and interfaces. New code contains no `any`. |
| III. Component Reusability | PASS | PASS | The header item and dialog are prop-driven MUI compositions. Complex motion styling uses MUI `styled`/`sx` and theme tokens, producing native CSS without a global stylesheet. |
| IV. Performance & Caching | PASS | PASS | No API, database, storage, Google Drive request, Calendly script, iframe, or preflight fetch. No cache invalidation strategy is required. Existing PWA behavior is outside the modified files. |
| V. Simplicity (YAGNI) | PASS | PASS | One existing header edit, two focused UI components, one typed configuration module, and one Storybook file. No provider, global store, SDK, animation library, API, or speculative scheduling abstraction. |

No constitution violations were found. Complexity Tracking is not required.

## Project Structure

### Documentation (this feature)

```text
specs/009-cv-review-header/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── cv-review-ui.md
├── checklists/
│   └── requirements.md
└── tasks.md                    # Created later by $speckit-tasks
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── ModernHeader.tsx                       # MODIFIED: mount one CV header item
│   └── cv-review/
│       ├── CVReviewHeaderItem.tsx             # NEW: trigger, organic panel, interaction state
│       ├── CVReviewerDialog.tsx               # NEW: dialog, reviewer radio cards, booking link
│       └── reviewers.ts                       # NEW: strict records and Calendly URL validation
└── stories/
    └── CVReviewHeaderItem.stories.tsx         # NEW: responsive/theme/state/a11y coverage
```

**Structure Decision**: Keep the feature inside a dedicated `components/cv-review/` group, matching the repository's existing grouped component convention. Integrate it once in `ModernHeader`; both required page families already use that component, so no page file changes are needed. Keep complex styles beside their owning MUI components through `styled`/`sx`; do not add global CSS.

## Phase 0: Research Outcomes

Research decisions are consolidated in [research.md](./research.md):

1. Integrate once through `ModernHeader`.
2. Model invitation behavior as `closed`, `preview`, and `pinned`.
3. Keep interaction state in React but perform all visual movement with reversible native CSS transitions.
4. Use an absolute, right-anchored shell with a connected trigger/panel hover region.
5. Use MUI Dialog and radio-group semantics for one reviewer selection.
6. Keep exactly three reviewer records in a typed static configuration.
7. Configure clean HTTPS temporary destinations and keep all three choices functional.
8. Use a real external anchor rather than `window.open`, an iframe, or a Calendly SDK.
9. Validate with existing Storybook and build tools instead of introducing a test framework.

All technical unknowns are resolved. No clarification markers remain.

## Phase 1: Design Outcomes

- [data-model.md](./data-model.md) defines reviewer configuration, validated booking destinations, invitation state, dialog state, and transitions.
- [contracts/cv-review-ui.md](./contracts/cv-review-ui.md) defines component boundaries, interaction semantics, accessibility behavior, motion budgets, and the external handoff contract.
- [quickstart.md](./quickstart.md) defines runnable validation for route scope, pointer/keyboard/touch behavior, 320px/200% zoom, themes, reduced motion, URL routing, failure states, and build checks.

## Implementation Sequence

1. Define strict reviewer types and three functional placeholder records.
2. Build the responsive image-section dialog with radio semantics, complementary clip paths, selected-only names, and the rising yellow Meet action.
3. Build the header item's interaction state machine and one-surface native-CSS organic morph with the short approved ad.
4. Mount the item once in `ModernHeader` and verify both dashboard and subject variants.
5. Add Storybook state/viewport/theme coverage and run the quickstart validation matrix.

## Complexity Tracking

No violations or additional complexity exceptions are required.

## Implementation Boundaries

- Do not modify dashboard or subject page files; they already consume `ModernHeader`.
- Do not add or modify API routes, database models, authentication, global state, PWA/service-worker files, or analytics.
- Do not add a Calendly embed, third-party scheduling script, API health check, UTM parameters, or prefilled personal data.
- Do not use Framer Motion or add another motion dependency for this feature.
- Treat final reviewer portraits, descriptions, and validated Calendly URLs as content updates inside the typed configuration, not architecture changes.
