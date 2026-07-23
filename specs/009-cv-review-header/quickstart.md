# Quickstart: CV Review Header Invitation

**Date**: 2026-07-23 | **Feature**: 009-cv-review-header

## Purpose

Use this guide after implementation to configure the three reviewer records and verify the feature on both supported header contexts. It does not require an API, database, iframe, scheduling SDK, or new package.

## Prerequisites

- Install the repository's existing Node.js/npm dependencies.
- Keep the three final portraits and Calendly event links available when they are supplied.
- Until then, leave portrait and booking values as `null`; the UI must show initials and `Coming soon`.

```powershell
npm install
npm run dev
```

## Planned Files

```text
src/components/ModernHeader.tsx
src/components/cv-review/CVReviewHeaderItem.tsx
src/components/cv-review/CVReviewerDialog.tsx
src/components/cv-review/reviewers.ts
src/stories/CVReviewHeaderItem.stories.tsx
```

Configure portraits, short approved review-focus copy, and booking links only in `src/components/cv-review/reviewers.ts`. Content updates must not require component-layout or interaction changes.

## Supported Route Check

Open one real route from each family:

- Dashboard: `/theday/q/<class-id>`
- Subject browsing: `/subjects/<subject>`

Verify that both show one CV item in `ModernHeader`. Check that the item does not appear on unrelated route headers as a result of this feature.

## Interaction Checks

### Desktop Pointer and Keyboard

1. Hover the compact CV mark and confirm it previews without shifting the header or page.
2. Move into the revealed content and confirm it remains open.
3. Leave both trigger and panel and confirm an unpinned preview reverses smoothly.
4. Click the trigger and confirm the panel stays pinned after the pointer leaves.
5. Dismiss it with its close control, Escape, and an outside click.
6. Repeat using Tab, Enter, Space, arrow keys in the reviewer radio group, and Escape.
7. Rapidly enter, leave, activate, and dismiss; confirm no snap, flicker, or queued animation.

### Touch and Small Screens

1. Emulate touch at 320px and 375px widths.
2. Tap the CV mark and confirm a persistent attached panel grows within 0.5rem viewport gutters.
3. Confirm invitation content, close control, and primary action are reachable.
4. Open the reviewer dialog and scroll if necessary; all three profiles and the shared action must remain usable.
5. Confirm no accidental transient hover state blocks touch activation.

## Reviewer and Booking Checks

1. Open the dialog and confirm the exact names Abdo Tolba, Omar Shawky, and Nairah.
2. Confirm no reviewer is selected initially.
3. Confirm absent or failed portraits show AT, OS, and N initials.
4. Confirm Nairah has the more visible gold premium treatment without a larger card or continuous animation.
5. Select each available reviewer and confirm exactly one card is selected.
6. Confirm the shared button names the current reviewer and explains that Calendly opens in a new tab/window.
7. Inspect the link and confirm the exact reviewer URL, `target="_blank"`, and `rel="noopener noreferrer"`.
8. Close and reopen the dialog; selection must reset.
9. Remove or invalidate one test URL; that profile must display `Coming soon` and be non-selectable.
10. Remove all test URLs; all profiles must remain visible and the shared action must remain disabled.

Use browser network tools to confirm that TheDay makes no request to Calendly until the external booking link is deliberately activated.

## Motion and Accessibility Checks

Verify:

- normal motion responds within 100 ms and reaches stable readable content within 600 ms;
- opening and closing follow the same shape journey in reverse;
- `prefers-reduced-motion: reduce` removes the full morph/shimmer while preserving state clarity;
- visible focus works in light and dark themes;
- the invitation and dialog have accessible labels and logical focus order;
- dialog focus stays contained, Escape closes it, and focus returns to the invoking action;
- 200% text zoom does not clip an essential action;
- high-contrast or forced-color use does not make selection or focus depend only on gold/color.

## Storybook Coverage

```powershell
npm run storybook
```

Review stories at 320px, 375px, 768px, and desktop widths in light and dark themes. Include collapsed, preview/pinned, dialog-open, selected-reviewer, missing-portrait, and all-unavailable fixtures. Run the Storybook accessibility panel for each meaningful state.

## Automated Gates

```powershell
npx tsc --noEmit --incremental false
npx eslint src/components/ModernHeader.tsx src/components/cv-review src/stories/CVReviewHeaderItem.stories.tsx
npm run build-storybook
npm run build
```

The repository has no configured unit or end-to-end test runner, so the Storybook and manual interaction matrix remains required.

`npm run build` may regenerate files in `public/` for the existing PWA setup. Run it from a worktree where existing changes are known, and do not include unrelated generated service-worker/workbox artifacts in this feature.

## Expected Non-Changes

This feature should not change:

- API routes or database models;
- authentication or global state;
- service-worker/PWA configuration;
- analytics;
- dashboard or subject page source files;
- dependency manifests or lockfiles.
