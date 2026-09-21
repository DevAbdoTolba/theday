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
6. Select each reviewer and confirm only the selected white name appears with readable dark separation.
7. Change selection and confirm the previous name disappears.
8. Confirm the yellow Meet action rises from below only after selection.
9. Confirm focus and selection use brightness/zoom without drawing an outline around a photo.
10. Hover/focus Nairah and confirm a warm shine crosses her photo immediately,
    then repeats after about six seconds while interaction remains active.
11. Select Nairah and confirm a small gold badge drops from above, remains clear
    of her name, and performs only a restrained recurring dance.
12. Confirm neither premium state adds a photo border or changes panel size.
13. At 320px, confirm the CV invitation stays inside the viewport and does not create horizontal page overflow.
14. Expand and collapse the invitation repeatedly and confirm the CV letters do
    not move, widen, or lose their compact circular edge clearance.

## Functional Checks

For Abdo Tolba and Omar Shawky:

1. Select the reviewer.
2. Inspect Meet and confirm:
   - `href` is that reviewer&apos;s configured Calendly URL.
3. Confirm the browser navigates directly to Calendly.
4. Close and reopen the dialog; confirm selection and visible text reset.

## Nairah Payment Checks

1. Select Nairah and activate Meet. Confirm a black white-bordered surface grows from behind Meet before the service page appears.
2. Confirm the page separates Services from Bundles and shows exactly: CV review — 700 EGP; CV review + LinkedIn review — 1,000 EGP; CV writing — 1,200 EGP; and CV writing + LinkedIn optimization — 1,500 EGP. Prices remain hidden until a choice is opened.
3. Confirm the payment page shows the configured video with an unmistakable centered Play video control, not an image-like idle frame, plus matching English/Egyptian-Arabic email-only note warnings. Activate it and confirm the overlay disappears when playback starts.
4. Confirm seeking ahead is rejected, the understanding control stays blurred/disabled before video completion, and the QR action appears only after completion and explicit confirmation.
5. Confirm the supplied QR renders at step two and a 320px phone shows the exact clickable direct InstaPay URL without overflow.
6. Until prices, recipient, QR, and direct URL are configured, confirm submission is disabled and explains why.
7. Confirm the QR form reads visually as `name123 | @instapay`, with one vertical separator and no suffix badge. Paste `name123@instapay`, type `@`, and type `instapay` in mixed letter cases; confirm the field immediately keeps only `name123`. Attempt Arabic letters and symbols and confirm a tooltip says only English letters and numbers are accepted. Submit with the same email written in the transfer note, then verify `/admin/cv-payments` stores and shows `name123@instapay` with the service, price, time, and status. Confirm there is no customer phone field.
8. Confirm Need help reveals `01114117164` only after activation and its WhatsApp action opens `https://wa.me/201114117164`.
9. Confirm the success screen tells the visitor to watch the submitted email without showing the exact-match warning.
10. Confirm the admin can manually complete a pending request and copy an internal Nairah booking link containing only `?u=<service-payload>.<Base64URL digest>`, without a record ID or automatic Calendly message.
11. Disable MongoDB or inspect network activity, open the sent link, re-enter the exact email and paste the complete InstaPay handle beside the same vertical separator and fixed suffix. Confirm the field strips `@instapay`, shows the English-only tooltip for Arabic/symbol attempts, reconstructs the handle, and unlocks with no API call. Confirm changing the encoded service or either identity value fails verification. Confirm a legacy v1 link still verifies without a service prefill.
12. Enter the full InstaPay account name and confirm the exact warning stays visible beside the Calendly picker with name, email, and the exact purchased service prefilled into Calendly&apos;s first custom question (`a1`).
13. Open the developer console and confirm the approved yellow-on-black ASCII art renders “PLEASE DON’T” as one contiguous readable block without a separate padded box around every line. Confirm the recruiting note remains visible below it without debugger detection or UI disruption.
14. Remove `?u=` from the scheduling URL and confirm the page shows only a blocking invalid-link explanation and Need help; the identity form, Continue action, full-name prompt, Calendly iframe, and external Calendly link must not render.
15. Sign in as each approved CV-payment email and confirm `/admin/cv-payments` plus its list/confirm API work. Confirm `qualified.resumes11@gmail.com` is routed directly to CV Payments and remains denied from general admin pages.
16. Create more than ten records and verify All/Pending/Completed/Declined filters, counts, result ranges, and first/previous/next/last pagination remain consistent after reviewing a request.
17. On a pending row, confirm the complete action occupies most of the status control and the decline X occupies only its final quarter. Activate X and confirm it smoothly becomes one reason field plus one save check.
18. Verify an empty decline reason cannot save, a valid reason appears on the declined row, and its reviewer/time metadata are stored.
19. Activate a completed or declined status and verify the same compact control can switch the decision or edit the decline reason without a row of extra buttons. Confirm booking-link copying remains available only for completed records.

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
