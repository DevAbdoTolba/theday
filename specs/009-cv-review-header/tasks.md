---

description: "Dependency-ordered implementation tasks for the CV Review Header Invitation"
---

# Tasks: CV Review Header Invitation

**Input**: Design documents from `/specs/009-cv-review-header/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/cv-review-ui.md`, `quickstart.md`

**Tests**: The repository has no unit or end-to-end test runner. Validation uses Storybook visual/accessibility states, TypeScript, ESLint, production builds, and the manual scenarios in `quickstart.md`.

**Organization**: Tasks are grouped by user story so each story can be implemented and checked as a distinct increment.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel after its stated prerequisites because it touches a different file.
- **[Story]**: Maps the task to a user story from `spec.md`.
- Every task includes the exact file path it creates, modifies, or uses for validation.

## Visual Direction from Task Input

- The compact CV notch, expanded invitation, and reviewer dialog use a pitch-black surface with crisp white borders and predominantly white text in both site themes.
- The black-and-white treatment should feel bold, vivid, and premium through controlled glow, depth, focus, and hover effects without harming readability or competing with the header.
- Nairah keeps the separate data-driven gold premium accent defined by the specification.
- Native CSS, reduced-motion behavior, high contrast, and the existing MUI/Emotion stack remain mandatory.

---

## Phase 1: Setup (Shared Structure)

**Purpose**: Create the planned feature files without adding dependencies or changing unrelated routes.

- [X] T001 Create the CV-review component scaffolds in `src/components/cv-review/CVReviewHeaderItem.tsx`, `src/components/cv-review/CVReviewerDialog.tsx`, `src/components/cv-review/reviewers.ts`, and `src/stories/CVReviewHeaderItem.stories.tsx`

**Checkpoint**: The planned modules exist and no package, API, page, PWA, analytics, or global-style file has changed.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the strict public configuration used by every story.

**⚠️ CRITICAL**: Complete this phase before starting any user-story implementation.

- [X] T002 Define `ReviewerId`, `ReviewerVisualTier`, `BookingDestination`, and `ReviewerProfile`, then add the exact Abdo Tolba, Omar Shawky, and Nairah records with initials, nullable portraits, review-focus copy, and data-driven visual tiers in `src/components/cv-review/reviewers.ts` (FR-013, FR-014, FR-015, FR-016, FR-025)
- [X] T003 Implement the pure Calendly URL normalizer and readonly reviewer export so only canonical HTTPS `calendly.com` event paths become available and every missing or rejected value becomes `coming-soon` in `src/components/cv-review/reviewers.ts` (FR-018, FR-019)

**Checkpoint**: Exactly three strictly typed reviewer records are available, invalid destinations fail closed, and the module performs no request or persistent write.

---

## Phase 3: User Story 1 — Discover the CV Invitation (Priority: P1) 🎯 MVP

**Goal**: Show one accessible CV header mark on the dashboard and subject pages that previews with fine-pointer hover/focus and pins with click, keyboard activation, or touch.

**Independent Test**: On one dashboard and one subject route, reveal and dismiss the same attached invitation using mouse, keyboard, and touch without navigation, flicker, overflow, or header/page layout shift.

### Implementation and Validation

- [X] T004 [US1] Implement the typed `closed | preview | pinned` interaction state, semantic CV trigger, labeled invitation region, fine-pointer preview, keyboard/touch pinning, and dialog-safe event guards in `src/components/cv-review/CVReviewHeaderItem.tsx` (FR-004, FR-005, FR-021)
- [X] T005 [US1] Build the fixed header slot and responsive right-anchored organic shell with a pitch-black background, crisp white border/text, asymmetric curves, connected neck, restrained premium halo/depth, and 320px-safe geometry using MUI `styled`/`sx` native CSS in `src/components/cv-review/CVReviewHeaderItem.tsx` (FR-002, FR-003, FR-006, FR-008, FR-024)
- [X] T006 [US1] Add focus-safe hidden content, pointer/focus persistence, explicit close, Escape handling, click-away dismissal, touch hover-capability protection, and stable focus behavior in `src/components/cv-review/CVReviewHeaderItem.tsx` (FR-004, FR-005, FR-020, FR-021)
- [X] T007 [P] [US1] Mount one `CVReviewHeaderItem` with the readonly reviewer configuration in the existing right-side controls of `src/components/ModernHeader.tsx` so only its dashboard and subject consumers receive the feature (FR-001)
- [X] T008 [P] [US1] Add collapsed, preview, pinned, desktop, 320px phone, light-theme, and dark-theme visual states that verify the pitch-black surface and white outline in `src/stories/CVReviewHeaderItem.stories.tsx` (FR-003, FR-021, FR-024)
- [X] T009 [US1] Execute the desktop pointer/keyboard, touch/small-screen, route-scope, layout-shift, and rapid-dismissal checks documented in `specs/009-cv-review-header/quickstart.md` (SC-005, SC-006, SC-007)

**Checkpoint**: User Story 1 is independently usable as a responsive, dismissible CV invitation entry point.

---

## Phase 4: User Story 2 — Understand the CV Review Offer (Priority: P1)

**Goal**: Explain the live one-to-one CV review clearly with playful, persuasive, non-hostile copy and one obvious reviewer-choice action.

**Independent Test**: Expand the panel and confirm a first-time reader can identify the offer, the three-specialist choice, and the next action from the panel alone.

### Implementation and Validation

- [X] T010 [US2] Add the approved hook, concise live one-to-one review explanation, and `Choose your reviewer` action with readable white-on-black hierarchy in `src/components/cv-review/CVReviewHeaderItem.tsx` (FR-009, FR-010, FR-011)
- [X] T011 [US2] Extend the expanded Storybook states to verify content arrival, readable line lengths, action prominence, 200% zoom behavior, and light/dark surrounding headers in `src/stories/CVReviewHeaderItem.stories.tsx` (FR-009, FR-011, FR-021)
- [X] T012 [US2] Review the final rendered wording against the clarity, playful-tone, non-humiliation, non-discrimination, credential, and no-employment-guarantee checks in `specs/009-cv-review-header/spec.md` (SC-001, SC-009)

**Checkpoint**: User Story 2 clearly communicates the offer and gives the visitor one unambiguous next step.

---

## Phase 5: User Story 3 — Choose a Reviewer (Priority: P1)

**Goal**: Open an accessible, responsive dialog where the visitor can compare exactly three reviewers and select one available profile.

**Independent Test**: Open the dialog at desktop and 320px widths, compare all three profiles, select each available choice with pointer and keyboard, close by every supported method, and confirm selection resets on reopen.

### Implementation and Validation

- [X] T013 [US3] Build the labeled MUI Dialog shell with a pitch-black paper surface, crisp white outer border, white text, controlled premium depth/glow, visible close control, focus containment/return, backdrop dismissal, Escape handling, and viewport-bounded scrolling in `src/components/cv-review/CVReviewerDialog.tsx` (FR-012, FR-020, FR-021, FR-024)
- [X] T014 [US3] Render exactly three equal-size reviewer cards as one semantic `RadioGroup`, including names, review-focus descriptions, portrait loading with initials fallback, disabled `Coming soon` states, and exactly-one selection in `src/components/cv-review/CVReviewerDialog.tsx` (FR-013, FR-014, FR-015, FR-017, FR-018, FR-025)
- [X] T015 [US3] Style reviewer hover, focus, disabled, and selected states against the black dialog, then implement Nairah's `premium-gold` thin accent, warm depth, and richer but non-obscuring response without enlarging her card in `src/components/cv-review/CVReviewerDialog.tsx` (FR-016, FR-021)
- [X] T016 [US3] Connect the `Choose your reviewer` action to dialog open/close state, clear selection on every open/close, preserve the pinned invitation while the portal owns focus, and restore focus to the invoking action in `src/components/cv-review/CVReviewHeaderItem.tsx` (FR-012, FR-020)
- [X] T017 [US3] Add dialog-open, no-selection, selected-reviewer, missing/failed-portrait, one-unavailable, all-unavailable, 320px, and keyboard-focus Storybook states in `src/stories/CVReviewHeaderItem.stories.tsx` (FR-015, FR-016, FR-018, FR-021, FR-024; SC-006, SC-007)

**Checkpoint**: User Story 3 allows accessible comparison and exactly-one selection while preserving the premium black/white visual system.

---

## Phase 6: User Story 4 — Book with the Selected Reviewer (Priority: P1)

**Goal**: Hand the visitor to only the selected reviewer's validated Calendly event in a new browsing context while leaving TheDay intact.

**Independent Test**: Use three valid test links, select each reviewer in turn, and confirm the shared action opens only the matching URL with the required security attributes; invalid and missing links remain non-navigable.

### Implementation and Validation

- [X] T018 [US4] Implement one shared anchor-backed MUI booking button that stays disabled without a valid selection, names the selected reviewer and Calendly/new-tab behavior, and uses only that reviewer's normalized URL in `src/components/cv-review/CVReviewerDialog.tsx` (FR-017)
- [X] T019 [US4] Apply `target="_blank"` and `rel="noopener noreferrer"`, preserve `coming-soon` non-navigation, and ensure the dialog contains no iframe, SDK, `window.open`, preflight fetch, fallback URL, tracking parameter, or personal-data prefill in `src/components/cv-review/CVReviewerDialog.tsx` (FR-018, FR-019)
- [X] T020 [US4] Add distinct Abdo, Omar, and Nairah test destinations plus invalid/missing destination fixtures that expose the exact rendered link attributes and disabled states in `src/stories/CVReviewHeaderItem.stories.tsx` (SC-003)
- [X] T021 [US4] Execute the reviewer-routing, new-context, original-tab survival, all-unavailable, and no-Calendly-request-before-click checks in `specs/009-cv-review-header/quickstart.md` (SC-002, SC-003)

**Checkpoint**: User Story 4 completes the safe reviewer-specific booking handoff without embedding or aggregating calendars.

---

## Phase 7: User Story 5 — Experience Comfortable Motion (Priority: P2)

**Goal**: Make the circle-to-notch-to-panel transformation coordinated, reversible, lightweight, and comfortable with or without reduced motion.

**Independent Test**: Repeatedly open and close the invitation during and between transition stages, then repeat with reduced motion enabled and confirm the same state and actions remain available without queued or uncomfortable movement.

### Implementation and Validation

- [X] T022 [P] [US5] Tune named native-CSS size, radius, halo, neck, opacity, and content-transform transitions for response within 100ms, shell formation around 420–480ms, stable content by 600ms, and clean reversal without timers or `transition: all` in `src/components/cv-review/CVReviewHeaderItem.tsx` (FR-007, FR-023; SC-004, SC-005)
- [X] T023 [P] [US5] Add a restrained single-pass premium interaction effect for Nairah and disable decorative travel, shimmer, and strong spatial motion under `prefers-reduced-motion: reduce` in `src/components/cv-review/CVReviewerDialog.tsx` (FR-016, FR-022, FR-023)
- [X] T024 [US5] Add reduced-motion, high-contrast/forced-color, rapid-reversal, 200%-zoom, and representative viewport Storybook coverage in `src/stories/CVReviewHeaderItem.stories.tsx` (FR-021, FR-022, FR-024; SC-007, SC-008)
- [X] T025 [US5] Execute the motion timing, rapid reversal, reduced-motion equivalence, contrast, and zoom checks in `specs/009-cv-review-header/quickstart.md` (SC-004, SC-005, SC-007, SC-008)

**Checkpoint**: User Story 5 delivers the signature native-CSS movement with a complete low-motion equivalent.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Verify strict typing, accessibility, production readiness, scope boundaries, and worktree cleanliness across all stories.

- [X] T026 Run strict TypeScript and direct ESLint checks for `src/components/ModernHeader.tsx`, `src/components/cv-review/CVReviewHeaderItem.tsx`, `src/components/cv-review/CVReviewerDialog.tsx`, `src/components/cv-review/reviewers.ts`, and `src/stories/CVReviewHeaderItem.stories.tsx` using the commands in `specs/009-cv-review-header/quickstart.md`
- [X] T027 Run the Storybook accessibility panel across every meaningful state and execute `npm run build-storybook` for `src/stories/CVReviewHeaderItem.stories.tsx`
- [X] T028 Run `npm run build`, inspect the resulting diff, and keep unrelated generated PWA/service-worker artifacts outside the feature as required by `specs/009-cv-review-header/quickstart.md`
- [X] T029 Review the finished implementation against `specs/009-cv-review-header/contracts/cv-review-ui.md` and confirm no API, persistence, analytics, iframe, scheduling SDK, new dependency, global CSS, dashboard-page edit, or subject-page edit was introduced

**Checkpoint**: All required gates pass and only the planned feature files remain in scope.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 — Setup**: No dependency.
- **Phase 2 — Foundational**: Depends on T001 and blocks every user story.
- **Phase 3 — US1**: Depends on Phase 2.
- **Phase 4 — US2**: Depends on US1's expanded panel.
- **Phase 5 — US3**: Depends on US1; it can be developed alongside US2 after the invitation shell exists.
- **Phase 6 — US4**: Depends on US3's reviewer selection and dialog.
- **Phase 7 — US5**: Depends on US1 and US3; schedule it after US4 to avoid concurrent edits to the dialog.
- **Phase 8 — Polish**: Depends on all stories included in the release.

### User Story Dependency Graph

```text
Setup → Foundation → US1 ─┬→ US2
                          └→ US3 → US4 → US5

All selected stories → Polish
```

### Within-Story Ordering

- **US1**: T004 → T005 → T006 → (T007 ‖ T008) → T009
- **US2**: T010 → T011 → T012
- **US3**: T013 → T014 → T015 → T016 → T017
- **US4**: T018 → T019 → T020 → T021
- **US5**: (T022 ‖ T023) → T024 → T025

---

## Parallel Execution Examples

### User Story 1

After T006, integrate the completed component and build its isolated stories in parallel:

```text
Task T007: Mount CVReviewHeaderItem in src/components/ModernHeader.tsx
Task T008: Add invitation states in src/stories/CVReviewHeaderItem.stories.tsx
```

### User Story 2

US2 intentionally stays sequential because its implementation, rendered story, and copy review build on one another in the same panel.

### User Story 3

US3 intentionally stays sequential so dialog semantics, card selection, visual treatment, parent state, and final stories are verified in dependency order.

### User Story 4

US4 intentionally stays sequential because the security/failure contract and fixtures must reflect the finished shared booking anchor.

### User Story 5

Tune the two independent component files in parallel before consolidating their states in Storybook:

```text
Task T022: Tune invitation motion in src/components/cv-review/CVReviewHeaderItem.tsx
Task T023: Tune premium/reduced motion in src/components/cv-review/CVReviewerDialog.tsx
```

---

## Implementation Strategy

### MVP First — User Story 1

1. Complete Setup and Foundation.
2. Complete T004–T009.
3. Stop and validate mouse, keyboard, touch, route scope, responsive fit, and the pitch-black/white-border visual treatment.
4. Use this as the discovery/interaction MVP before adding conversion content.

### Incremental Delivery

1. **US1**: Discover and operate the attached CV invitation.
2. **US2**: Understand the live review offer.
3. **US3**: Compare and select a reviewer.
4. **US4**: Reach the correct scheduling destination.
5. **US5**: Complete motion tuning and reduced-motion behavior.
6. Run all cross-cutting gates before shipping.

The full useful booking flow requires US1–US4. US5 is the P2 refinement but reduced-motion accessibility remains required before production release.

---

## Notes

- Do not add unit/E2E infrastructure solely for this feature.
- Do not use Framer Motion; React controls state and MUI/Emotion emits native CSS transitions.
- Do not add live Calendly availability comparison, an iframe, API request, analytics event, storage, or a new dependency.
- Keep the pitch-black surfaces and white borders consistent in both site themes while retaining accessible focus and high-contrast fallbacks.
- Final portraits and real Calendly URLs are later content replacements in `src/components/cv-review/reviewers.ts`.
- Keep unrelated existing worktree changes untouched.
