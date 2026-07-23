# Quickstart: CV Review Header Invitation

**Date**: 2026-07-23 | **Feature**: 009-cv-review-header

## Visual Checks

1. Open the CV ad and activate “Now!”.
2. Confirm the idle dialog contains only three photos and the mobile X when
   applicable—no title, names, descriptions, statuses, cards, or button.
3. On desktop, confirm the photos themselves meet at diagonal cut edges with no
   rendered separator line.
4. At 320px, confirm the photos stack and meet at mildly tilted cut edges.
5. Hover/focus each photo and confirm only its brightness changes.
6. Select each reviewer and confirm only the selected black name appears.
7. Change selection and confirm the previous name disappears.
8. Confirm the yellow Meet action rises from below only after selection.

## Functional Checks

For Nairah, Abdo Tolba, and Omar Shawky:

1. Select the reviewer.
2. Inspect Meet and confirm:
   - `href="https://example.com/"`
   - `target="_blank"`
   - `rel="noopener noreferrer"`
3. Confirm the original TheDay tab remains open.
4. Close and reopen the dialog; confirm selection and visible text reset.

## Accessibility Checks

- The untitled visible dialog has the accessible name “Choose a CV reviewer”.
- Each photo is a named radio option.
- Keyboard focus is visible and selection works with keyboard alone.
- Escape and backdrop close on desktop; the phone additionally has a named X.
- Reduced motion shortens brightness, name, and Meet movement.
- No essential control is clipped at 320px.

## Automated Gates

```powershell
npx tsc --noEmit --incremental false
npx eslint src/components/ModernHeader.tsx src/components/cv-review src/stories/CVReviewHeaderItem.stories.tsx
npm run build-storybook
npm run build
```

Do not include unrelated generated PWA/service-worker files in this feature.
