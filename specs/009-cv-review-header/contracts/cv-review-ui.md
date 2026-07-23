# UI Contract: CV Review Header Invitation

**Date**: 2026-07-23 | **Feature**: 009-cv-review-header

## Scope Contract

- `ModernHeader` mounts one CV invitation within its existing right-side controls.
- Because the student dashboard and subject browsing pages both use `ModernHeader`, those two page families receive the feature without page-specific edits.
- No homepage, admin, hidden-experience, or other public route integration is part of this feature.
- The component is client-only and exposes no HTTP API.

## Component Contracts

### `CVReviewHeaderItem`

```ts
export interface CVReviewHeaderItemProps {
  reviewers: readonly ReviewerProfile[];
}
```

Responsibilities:

- own the `closed | preview | pinned` invitation state;
- render the compact CV trigger and attached invitation panel;
- distinguish a fine-pointer preview from deliberate activation;
- provide explicit close, Escape, and click-away dismissal;
- keep the connected trigger and panel as one pointer/focus interaction region;
- open the reviewer dialog and return focus correctly when it closes;
- expose stable state attributes for CSS and Storybook without performing animation in JavaScript.

### `CVReviewerDialog`

```ts
export interface CVReviewerDialogProps {
  open: boolean;
  reviewers: readonly ReviewerProfile[];
  selectedReviewerId: ReviewerId | null;
  onSelect: (reviewerId: ReviewerId) => void;
  onClose: () => void;
}
```

Responsibilities:

- render a labeled MUI `Dialog`;
- show exactly three reviewer cards in configuration order;
- use one semantic radio group for selection;
- render portraits with initials fallback;
- keep `coming-soon` reviewers visible but disabled;
- provide one shared booking action for the current selection;
- render the validated booking destination as a real external anchor.

The parent resets `selectedReviewerId` to `null` each time the dialog opens and after it closes.

### Reviewer Configuration

`reviewers.ts` owns:

- strict reviewer, visual-tier, and booking-destination types;
- the three reviewer records;
- the pure Calendly URL normalizer;
- no component state, network call, or browser storage.

## Invitation Interaction Contract

| Input | Closed | Preview | Pinned |
|-------|--------|---------|--------|
| Fine-pointer hover/focus enters | Preview | No change | No change |
| Pointer and focus leave connected surface | No change | Closed | No change |
| Click, Enter, or Space on CV trigger | Pinned | Pinned | Closed |
| Touch tap on CV trigger | Pinned | Pinned | Closed |
| Escape | No change | Closed | Closed |
| Explicit close | No change | Closed | Closed |
| Outside interaction | No change | Closed | Closed |
| Choose-reviewer action | — | Open dialog | Open dialog |

Rules:

- Hover is an enhancement, never the only way to reveal the content.
- A touch device reporting hover capability does not receive a transient hover-only experience; deliberate activation pins the surface.
- Preview stays available while either pointer or keyboard focus remains inside the connected trigger-and-panel wrapper.
- Rapid open/close reverses the current CSS transition and does not start a queued timer sequence.
- While the modal dialog is open, it owns focus and dismissal; the underlying surface does not collapse because focus moved into the portal.

## Accessibility Contract

### Invitation

- The CV mark is a real button with an accessible name describing the CV-review invitation.
- It exposes `aria-expanded` and `aria-controls` whenever the invitation region can be revealed.
- The expanded panel is a labeled region associated with the trigger.
- Hidden content is not focusable or pointer-operable.
- A visible close button is available in the expanded state.
- Keyboard focus is always visible in light and dark themes.
- Escape and click-away dismiss only the active non-modal invitation layer.

### Dialog

- The dialog has an accessible title and supporting description.
- MUI Dialog supplies modal semantics, focus containment, backdrop handling, and focus restoration.
- Initial focus lands on a useful dialog control without preselecting a reviewer.
- Reviewer options use radio semantics and standard arrow-key and Space behavior.
- Name, review focus, availability, selected state, and premium decoration never depend on color alone.
- The close control has an explicit accessible name.
- Closing by button, Escape, or backdrop invokes the same state cleanup.
- The shared action stays disabled until an available reviewer is selected.
- Its accessible label names the reviewer, identifies Calendly, and warns that a new tab or window opens.

## Shape and Motion Contract

- The closed header slot remains fixed so opening the surface causes no header or page-flow shift.
- The organic shell is absolutely positioned, aligned to the right, and grows leftward/downward.
- Open inline size is no larger than `min(22rem, calc(100vw - 1rem))`.
- Open block size is bounded by the dynamic viewport; content scrolls internally when zoom or text size requires it.
- The shell transitions named size and asymmetric-radius properties; pseudo-elements form the halo and curved neck.
- Content opacity/transform begins only after the shell creates usable space.
- Opening and closing are reversible from their current computed values.
- No `transition: all`, JavaScript animation loop, delayed state timer, Framer Motion call, or new motion package is permitted.
- Normal-motion target: visible response within 100 ms, shell motion around 420–480 ms, stable readable content no later than 600 ms.
- `prefers-reduced-motion: reduce` removes decorative travel, morph emphasis, and shimmer; it uses a brief opacity/state change around 100–120 ms.
- At 320 CSS pixels and 200% text zoom, essential copy, close controls, reviewer identities, and actions remain reachable.

## Reviewer Presentation Contract

- Every card has equal structural dimensions, type hierarchy, radio behavior, and selection affordance.
- All profiles support a local portrait path and deliberately styled initials fallback.
- Nairah receives the data-driven `premium-gold` treatment:
  - thin gold outline/accent;
  - restrained warm radial background;
  - richer hover, focus, and selected shadow;
  - at most one short interaction shimmer when normal motion is allowed.
- The premium tier must not enlarge Nairah's card/avatar, hide another reviewer, run continuously, or change booking priority.
- A missing or failed portrait must never show a broken image.

## Booking Handoff Contract

An available booking action renders with:

```html
<a
  href="https://calendly.com/{reviewer}/{event}"
  target="_blank"
  rel="noopener noreferrer"
>
  Book with {reviewer} on Calendly
</a>
```

The real link must use the selected reviewer's already-validated destination. It must not use `window.open`, an iframe, a Calendly SDK, a shared fallback destination, or a client-side preflight request.

The URL normalizer accepts only HTTPS links on the exact `calendly.com` hostname, with a non-empty event path and without credentials, a custom port, query string, or fragment.

No personal information, CV data, selected-reviewer analytics, prefill parameters, or UTM values are added to the link. The browser makes no request to Calendly before deliberate link activation.

## Failure Contract

| Condition | Required behavior |
|-----------|-------------------|
| Portrait absent or fails | Show styled initials fallback |
| URL absent, malformed, or rejected | Show `Coming soon`; disable selection and navigation |
| One or more reviewers unavailable | Keep all three visible; allow selection only among available profiles |
| All reviewers unavailable | Show all as `Coming soon`; shared action remains disabled |
| Calendly fails after navigation | Original TheDay tab and its state remain intact |
| Visitor closes dialog | Clear selection and return focus to invoking action |
| Visitor rapidly reverses invitation | Reverse CSS from current visual state without snap or queue |
| Content exceeds available height | Keep controls inside a bounded, internally scrollable surface |

## Verification Contract

The implementation is ready only when:

1. TypeScript strict checking and direct ESLint pass for all touched files.
2. Storybook production build and Next.js production build pass.
3. Storybook covers collapsed, preview/pinned, dialog, selection, and all-unavailable states.
4. Manual checks cover both supported route families, mouse, keyboard, touch, reduced motion, light/dark themes, 320px width, and 200% zoom.
5. Each reviewer routes only to their configured URL with the exact external-link attributes.
6. Network inspection confirms no Calendly request occurs before the visitor activates the booking link.
