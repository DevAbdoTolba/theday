# UI Contract: CV Review Header Invitation

**Date**: 2026-07-23 | **Feature**: 009-cv-review-header

## Scope

- `ModernHeader` mounts one CV invitation on dashboard and subject pages.
- The header and selection interaction remain client-side. Nairah&apos;s manual flow
  exposes focused payment, admin, and on-demand support APIs backed by MongoDB.
- The dialog directs Abdo and Omar to their configured Calendly pages. Nairah
  alone opens the internal service and manual-payment journey.

## Header Contract

- The compact CV circle and expanded ad are one continuously bordered surface.
- The CV label sits within an inset trigger area so the compact circle keeps
  visible internal breathing room. Its position, width, and top-right corner
  clearance remain unchanged while the surrounding surface expands.
- The approved ad is “Get hired!”, “Book a 1:1 meeting to enhance your
  CV/Resume”, and “Now!”.
- There is no invitation scrollbar, overline, or separate X.
- On phones the CV item occupies the safe right edge of the header and the open surface stays within viewport gutters.
- Fine-pointer hover/focus previews; activation pins; Escape, outside
  interaction, or toggling CV dismisses.

## Image-Section Dialog Contract

- The dialog has an accessible name but no visible title.
- Its idle visible content consists only of three full-surface photos.
- Desktop uses three overlapping 40%-wide photo surfaces placed at 30%
  intervals. Complementary polygon cuts create two continuous diagonal joins.
- Phones use three overlapping 40%-high photo surfaces placed at 30%
  intervals. Complementary polygon cuts create two mildly tilted joins.
- No line, border, card, avatar, caption, description, status label, or nested
  image frame may be used to fake the joins.
- A phone-only X remains above the photos. Desktop uses Escape or the backdrop.

## Interaction Contract

- All three photo sections are selectable radio options.
- Photos begin dimmed.
- Hover or keyboard focus brightens only the targeted photo slightly.
- Hover and focus do not reveal a visible reviewer name.
- Selection brightens and slightly zooms the selected photo and reveals only its
  light name with strong dark shadow separation.
- Normal focus and selection add no border or outline around a photo.
- Selecting another reviewer hides the previous name and reveals the new name.
- Selection resets whenever the dialog is reopened.
- Nairah receives a warm photo shimmer immediately on hover/focus and again
  roughly every six seconds while interaction remains active.
- Selecting Nairah drops a small gold premium badge from above; the badge uses a
  restrained recurring dance and never covers the selected name.
- Premium decoration adds no border, outline, or size change.

## Meet Contract

- The yellow Meet action exists below the clipped dialog and is non-operable
  before selection.
- Selection moves Meet into the dialog's lower quarter.
- Meet keeps black text on a strong yellow surface with clear separation from the photos.
- Abdo and Omar use normal direct navigation to their configured Calendly URLs.
- Nairah&apos;s Meet action expands a black, white-bordered transaction surface
  from behind the button, then routes to `/grad/d/cv/meet/nairah`.
- Nairah&apos;s page has three services with separately editable detail prices,
  then a guide video, bilingual email-only transfer-note warning, gated
  confirmation, and QR step. Phone screens additionally expose the exact direct
  InstaPay URL. Missing live payment configuration disables submission.
- The manually delivered Nairah scheduling route keeps the exact InstaPay
  account-name/email warning visible beside an embedded Calendly picker.
- No SDK, `window.open`, preflight request, tracking parameter, or
  payment credential collection is allowed.

## Manual Payment Approval Contract

- A public Nairah payment confirmation records selected service, displayed
  price, payment-confirmation time, and `pending` state only.
- An existing authorised admin sees the newest entries at `/admin/cv-payments`.
- Confirming is manual and changes only `pending` to `confirmed` with a review
  timestamp. The admin copies the internal booking link and sends it to the
  email found in the InstaPay transfer note; confirmation never emails or opens
  Calendly automatically.
- Need help performs an on-demand POST, reads the Nairah support phone from
  MongoDB, and only then reveals the phone and direct WhatsApp action.

## Accessibility and Motion

- The image-only dialog retains an accessible name and three named radio inputs.
- Names are available to assistive technology through the radio labels even
  while visually hidden.
- Focus is visible without adding permanent separation lines.
- Mobile X has an explicit accessible label.
- Reduced motion shortens brightness, name, and Meet transitions.
- At 320px, all three photo sections and the mobile X fit without scrolling.

## Verification

1. TypeScript and direct ESLint pass.
2. Storybook and Next.js production builds pass.
3. Storybook covers desktop, 320px mobile, unselected, and selected states.
4. Idle dialog contains no visible text.
5. Every reviewer activates a yellow Meet link to `https://example.com/` with
   the required new-tab security attributes.
