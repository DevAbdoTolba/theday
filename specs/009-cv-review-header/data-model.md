# Data Model: CV Review Header Invitation

**Date**: 2026-07-23 | **Feature**: 009-cv-review-header

## Overview

This feature is client-only. Reviewer configuration is static, and invitation,
dialog, and selection state exist only while the components are mounted.

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
- `premium-gold` adds a restrained warm image overlay only; it does not add a border.
- Meet remains translated below the clipped dialog when selection is `null`.
- Meet rises into view when selection is non-null and opens the configured URL in a new tab.
- Closing clears selection.

## Privacy and Lifetime

The feature sends no student identity, CV content, analytics payload, tracking
parameters, or prefilled data. The external destination is contacted only after
the visitor activates Meet. UI state is not persisted.
