# Research: CV Review Header Invitation

**Date**: 2026-07-23 | **Feature**: 009-cv-review-header

## R1: Header Integration Point

**Decision**: Mount one `CVReviewHeaderItem` inside the right-side controls of `src/components/ModernHeader.tsx`.

**Rationale**:

- The student dashboard (`src/pages/theday/q/[q]/index.tsx`) and subject page (`src/pages/subjects/[subject].tsx`) already render the same `ModernHeader`.
- One integration satisfies the clarified page scope without route checks, duplicated state, or page-level props.
- The existing `AppBar` is sticky with a stable stacking context. An absolutely positioned invitation surface can extend over the page without moving header or page layout.

**Alternatives considered**:

- Add the item separately to both pages: rejected because it duplicates integration and can drift.
- Mount globally in `_app.tsx`: rejected because the feature must not appear on every route.
- Add it to the older `Header` component too: rejected because that would exceed the clarified dashboard-and-subject scope.

## R2: Invitation Interaction Model

**Decision**: Use a three-state model: `closed`, `preview`, and `pinned`.

- Fine-pointer hover or keyboard focus moves `closed → preview`.
- Pointer/focus leaving the connected trigger-and-panel region moves `preview → closed`.
- Trigger click, Enter, Space, or a touch tap moves `closed|preview → pinned`.
- Escape, explicit close, or outside interaction moves `pinned → closed`.
- Opening the reviewer dialog preserves a stable underlying pinned surface while the modal owns focus and Escape handling.

**Rationale**:

- The model directly represents the clarified behavior instead of combining several booleans that can contradict one another.
- Keeping trigger and panel inside one connected wrapper makes the revealed content hoverable.
- Explicit Escape and close behavior makes hover/focus content dismissible.
- Preview remains visible while the trigger or panel retains pointer/focus, making it persistent.

These behaviors follow WCAG's requirements that hover/focus content be dismissible, hoverable, and persistent. [W3C: Understanding Content on Hover or Focus](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus)

MUI's `ClickAwayListener` is suitable for the outside-interaction transition and already exists in this project's dependency set and codebase. [MUI Click-Away Listener](https://mui.com/material-ui/react-click-away-listener/)

**Alternatives considered**:

- Hover-only state: rejected because it makes the larger panel difficult to read and operate.
- Click-only state: rejected because it removes the requested mouse-pass preview.
- Separate mobile and desktop component trees: rejected because it risks hydration and behavior drift.
- Timers for delayed closure: rejected because they queue easily during rapid reversal and are unnecessary when the interaction region is continuous.

## R3: Native CSS Shape and Motion

**Decision**: Keep interaction state in React, expose it through stable data attributes, and perform every visual transition through CSS emitted by MUI `styled`/`sx`.

The visual shell will:

- remain absolutely positioned and right-anchored inside a fixed-size header slot;
- transition explicit inline size, block size, and asymmetric border radii from a compact near-circle to an organic panel;
- use pseudo-elements for the soft halo and curved connector/neck;
- use opacity and small transforms for halo and content arrival;
- hide inactive content with `visibility`, `opacity`, and pointer-event control so closed controls cannot receive focus;
- transition only named properties, never `all`;
- reverse from its current computed state without JavaScript animation timers;
- complete the shell transition in roughly 420–480 ms and content arrival by 560 ms, staying within the 600 ms requirement.

**Rationale**:

- Absolute positioning prevents header and page layout shift even though the small shell changes dimensions.
- A single small animated surface is a controlled cost; the larger decorative and content effects remain on opacity/transform.
- MUI `styled`/`sx` uses the existing Emotion runtime, theme tokens, pseudo-selectors, and media queries while the browser performs the actual CSS animation.
- This honors the explicit native-CSS requirement and does not add or invoke an animation dependency.

For reduced motion, remove spatial scaling/morph emphasis, stop decorative halo movement, and use a brief opacity/state change around 100–120 ms. The `prefers-reduced-motion` media feature is broadly available and reacts to the user's operating-system preference. [MDN: `prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion)

**Alternatives considered**:

- Framer Motion: rejected because the user explicitly requires native CSS and the feature does not need an animation runtime.
- SVG path morphing: rejected because it adds authoring complexity and a brittle responsive path contract.
- `clip-path` path morphing: rejected as the primary mechanism because different shape functions and complex masks are harder to maintain and debug across browsers.
- Global CSS file: rejected because styles belong to one feature and the constitution prefers MUI/themed component styling.

## R4: Responsive Geometry and Stacking

**Decision**: Render one responsive surface on all devices.

- Closed slot: approximately the same footprint as the existing small header actions.
- Open inline size: `min(22rem, calc(100vw - 1rem))`.
- Open block size: bounded by the available dynamic viewport height, with an internal scroll area if 200% zoom increases content height.
- Desktop alignment: surface grows leftward and downward from the right-side "CV" mark.
- Phone alignment: the same connected organic surface expands leftward within 0.5rem viewport gutters.
- Modal: render through MUI's portal above the sticky AppBar.

Use CSS/input behavior rather than server-render branching to avoid desktop/mobile hydration differences. The `pointer`/`hover` media features are appropriate for styling input-capability differences, while touch activation remains a normal button event. [MDN: `pointer` media feature](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/pointer)

**Rationale**:

- One DOM structure keeps semantics and focus behavior identical.
- Viewport-relative bounds make 320px and text-zoom testing deterministic.
- Internal scrolling is preferable to clipping essential actions.

**Alternatives considered**:

- Bottom sheet on phones: rejected by clarification; the organic attached panel is required.
- Fixed desktop pixel width on phones: rejected because it would overflow.
- Page-flow expansion: rejected because it would move the header and content.

## R5: Reviewer Dialog and Selection Semantics

**Decision**: Use MUI `Dialog` with a labeled `RadioGroup` of three reviewer cards and one shared booking action.

- No reviewer is selected initially.
- Only validated, available profiles participate in selection.
- Arrow keys and Space use native radio-group behavior.
- The booking action remains disabled until exactly one available reviewer is selected.
- Closing and reopening the dialog resets selection to avoid accidental booking with a stale choice.
- A visible close control is always present; Escape closes the dialog; focus returns to the invoking panel action.

MUI Dialog supplies the existing modal/focus infrastructure. [MUI Dialog](https://mui.com/material-ui/react-dialog/)

The WAI-ARIA dialog pattern requires focus containment, Escape dismissal, an accessible title, and logical focus return. [WAI-ARIA Modal Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)

The radio-group pattern defines one checked option and standard arrow-key/Space behavior. [WAI-ARIA Radio Group Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)

**Alternatives considered**:

- Clickable generic cards with custom `aria-selected`: rejected because native radio semantics already match the choice.
- Three independent booking buttons: rejected by clarification in favor of selection plus one confirmation action.
- A custom modal: rejected because MUI Dialog already covers focus, portal, and backdrop behavior.

## R6: Reviewer Configuration and Validation

**Decision**: Keep exactly three reviewer records in a strict static module.

Stable IDs:

- `abdo-tolba`
- `omar-shawky`
- `nairah`

Each record contains:

- exact display name;
- initials fallback;
- optional local portrait path;
- approved short review-focus description;
- visual tier (`standard` or `premium-gold`);
- booking destination (`available` with URL or `coming-soon` with `null`).

Validate any supplied booking URL with the browser `URL` parser. Accept only canonical HTTPS `calendly.com` event paths with no credentials, custom port, query, or fragment. Missing or rejected destinations resolve to `coming-soon`. The `URL` constructor provides normalized protocol/hostname parsing and throws for invalid input. [MDN URL constructor](https://developer.mozilla.org/en-US/docs/Web/API/URL/URL)

**Rationale**:

- The three URLs are public destinations, not secrets.
- Static configuration is typed, reviewable, easy to mock in Storybook, and simpler than environment or server configuration.
- A discriminated booking state prevents an unavailable profile from accidentally carrying a navigable placeholder.
- Strict host validation prevents `javascript:` values, relative URLs, HTTP links, and lookalike domains.

**Alternatives considered**:

- Environment variables: rejected because they make three public values harder to audit, type, and preview.
- Database/API configuration: rejected because it introduces unnecessary infrastructure and failure states.
- Public JSON: rejected because it loses compile-time typing and adds a request.

## R7: Calendly Handoff, Failure, Security, and Privacy

**Decision**: Render the shared booking action as a real MUI anchor button using the validated URL, `target="_blank"`, and `rel="noopener noreferrer"`.

The visible/accessibility label will identify the reviewer and state that Calendly opens in a new tab or window. The original TheDay page remains available.

Calendly supports sharing a normal event-type scheduling link, so no embed or SDK is required. [Calendly: Share your scheduling link](https://help.calendly.com/hc/en-us/articles/223193448-Sharing-your-scheduling-link?locale=en-us)

**Rationale**:

- A direct user-activated anchor is simpler and more reliable than `window.open`.
- `noopener` isolates `window.opener`; `noreferrer` suppresses referrer data.
- TheDay sends no personal data, CV data, user identity, UTM value, or prefill query.
- No Calendly resource or cookie is loaded inside TheDay before the user deliberately follows the link.
- TheDay cannot reliably observe a cross-origin Calendly outage; keeping the original tab intact is the honest recovery behavior.

**Failure contract**:

- Missing/invalid URL: reviewer remains visible but non-selectable and labeled "Coming soon".
- Calendly outage/no slots/network failure: original TheDay tab and state remain intact; no silent fallback to another reviewer.
- No `HEAD`, fetch, health check, iframe, or live availability request is made.

**Alternatives considered**:

- `window.open`: rejected because popup blocking and accessibility behavior are less predictable.
- Inline/popup Calendly embed: rejected because it loads third-party code inside TheDay and does not provide a unified three-calendar comparison.
- URL preflight: rejected because it adds latency/privacy exposure and cannot prove the visitor's booking page will work.
- First-release booking analytics: rejected as out of scope; TheDay cannot claim a completed booking from a handoff click.

## R8: Premium Visual Tier

**Decision**: Express Nairah's treatment as a data-driven `premium-gold` tier, not a name check inside the component.

The tier provides:

- a thin gold border/accent;
- a restrained warm radial background;
- a richer focus/hover/selected shadow;
- an optional single-pass shimmer on interaction;
- the same radio indicator, disabled behavior, type scale, dimensions, and booking semantics as every other profile.

All decorative movement is removed or reduced under `prefers-reduced-motion`.

**Rationale**:

- The premium effect is visibly distinct as clarified, while equal dimensions and controls prevent it from obscuring or functionally outranking the other reviewers.
- A visual tier is explicit, testable, and reusable without coupling style to a person's display name.

**Alternatives considered**:

- Hard-code `name === "Nairah"`: rejected because it mixes identity with style logic.
- Animated gold border continuously: rejected because it steals attention and wastes motion budget.
- Larger card/avatar: rejected because it changes choice hierarchy and mobile fit.

## R9: Validation Strategy

**Decision**: Use the repository's current gates and Storybook rather than adding a test framework.

Automated/build gates:

1. `npx tsc --noEmit --incremental false`
2. Direct ESLint over the modified/new files
3. `npm run build-storybook`
4. `npm run build`

Storybook/manual coverage:

- collapsed, preview/pinned interaction, dialog open, one selected reviewer, all unavailable;
- dashboard and subject header variants;
- 320px, 375px, 768px, and desktop widths;
- light and dark themes;
- keyboard-only and touch emulation;
- 200% zoom and reduced motion;
- exact reviewer-to-URL routing and new-context attributes;
- accessibility addon review.

**Rationale**:

- Storybook 8.6 already includes a11y and interactions addons plus light/dark and responsive viewports.
- The project has no Jest, Vitest, Playwright, or test script. Adding one solely for this UI would violate the simplicity gate.
- The pure URL validator and state contract remain structured so automated tests can be added later without changing the design.

**Alternatives considered**:

- Add a unit/E2E stack now: rejected as disproportionate to this feature.
- Rely only on `next build`: rejected because builds cannot validate hover, focus, touch, motion, and external-link semantics.
