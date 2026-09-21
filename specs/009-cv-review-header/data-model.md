# Data Model: CV Review Header Invitation

**Date**: 2026-07-23 | **Feature**: 009-cv-review-header

## Overview

Reviewer configuration is static, while invitation, dialog, and selection state
exist only while the components are mounted. Anonymous confirmations and the
on-demand support contact use the existing MongoDB connection.

## Reviewer Configuration

```ts
export type ReviewerId = "abdo-tolba" | "omar-shawky" | "nairah";

export interface BookingDestination {
  status: "available";
  url: string;
}

export interface ReviewerProfile {
  id: ReviewerId;
  displayName: string;
  portraitSrc: string;
  visualTier: "standard" | "premium-gold";
  booking: BookingDestination;
}
```

### Initial Records

| ID | Display name | Temporary photo | Temporary destination |
|----|--------------|-----------------|-----------------------|
| `nairah` | Nairah | Picsum seed `nairah` | `https://example.com/` |
| `abdo-tolba` | Abdo Tolba | Picsum seed `abdo-tolba` | `https://example.com/` |
| `omar-shawky` | Omar Shawky | Picsum seed `omar-shawky` | `https://example.com/` |

### Invariants

- All three records are selectable and available.
- Each record owns one full-surface photo; the image is not nested in a card.
- All initial destinations are clean HTTPS URLs and point to `example.com`.
- Names are present for accessibility but become visible only for the selected record.
- Final photos and booking destinations can replace placeholders without layout changes.

## UI State

```ts
export type InvitationState = "closed" | "preview" | "pinned";

export interface ReviewerDialogState {
  open: boolean;
  selectedReviewerId: ReviewerId | null;
}
```

Dialog invariants:

- Selection is `null` whenever the dialog opens.
- Exactly one reviewer can be selected.
- No visible title, name, description, status, or Meet action appears before selection.
- Hover/focus changes only the photo brightness.
- Selection reveals only the selected name in high-contrast white.
- Changing selection hides the previous name.
- `premium-gold` adds an interaction-only warm photo shimmer and a
  selected-only gold badge; it does not add a border or change panel size.
- Meet remains translated below the clipped dialog when selection is `null`.
- Meet rises into view when selection is non-null and opens the configured URL in a new tab.
- Closing clears selection.

## Nairah Service and Payment Entities

- **Nairah Service**: One of `cv-review`, `cv-writing`, or
  `linkedin-optimization`, with a title, explanation, and manually editable
  EGP price. A missing price means payments are closed.
- **Nairah Payment Configuration**: The payment-guide video, recipient label,
  public InstaPay QR image path, and direct phone-payment URL. Missing any value
  means payments are closed.
- **CV Payment Submission**: `serviceId`, displayed service title, displayed
  price, InstaPay handle, matching email, payment-confirmation timestamp, status
  (`pending` or `confirmed`), and optional manual reviewer identity/timestamp.
- **Booking Gate Token**: A deterministic SHA-256 digest over a versioned
  namespace, normalized email, and normalized InstaPay handle, encoded as
  Base64URL in `?u=`. It is a lightweight client-side deterrent, not an
  authentication credential. The full name is requested only after it matches.
- **CV Support Contact**: A singleton MongoDB record keyed by `nairah`, with a
  local display phone and E.164 phone used to build the WhatsApp link. It is
  returned only by an explicit on-demand support request.

Payment submissions never include a customer phone, card, bank-account, PIN, or
transaction credential. The scheduling page does not query MongoDB.

## Privacy and Lifetime

The feature sends no CV content, analytics payload, or tracking parameters.
Only after the client gate unlocks does the scheduling page send the visitor&apos;s
entered full name and email to Calendly as prefill data. Gate state is not persisted.
