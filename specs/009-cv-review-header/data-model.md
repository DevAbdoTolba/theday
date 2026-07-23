# Data Model: CV Review Header Invitation

**Date**: 2026-07-23 | **Feature**: 009-cv-review-header

## Overview

This feature is client-only. It has no database, API, persistent storage, or cross-page state. Reviewer data is a small typed configuration, while invitation and dialog state exist only for the lifetime of the mounted components.

## Reviewer Configuration

```ts
export type ReviewerId = 'abdo-tolba' | 'omar-shawky' | 'nairah';

export type ReviewerVisualTier = 'standard' | 'premium-gold';

export type BookingDestination =
  | {
      status: 'available';
      url: string;
    }
  | {
      status: 'coming-soon';
      url: null;
    };

export interface ReviewerProfile {
  id: ReviewerId;
  displayName: string;
  initials: string;
  portraitSrc: string | null;
  reviewFocus: string;
  visualTier: ReviewerVisualTier;
  booking: BookingDestination;
}
```

### Initial Records

| ID | Display name | Initials | Visual tier | Initial portrait | Initial booking |
|----|--------------|----------|-------------|------------------|-----------------|
| `abdo-tolba` | Abdo Tolba | AT | `standard` | `null` | `coming-soon` until supplied |
| `omar-shawky` | Omar Shawky | OS | `standard` | `null` | `coming-soon` until supplied |
| `nairah` | Nairah | N | `premium-gold` | `null` | `coming-soon` until supplied |

### Reviewer Invariants

- The configuration contains exactly these three unique IDs and display names.
- `visualTier` controls presentation; components never infer a tier by comparing a person's name.
- Nairah uses `premium-gold`; the other two records use `standard`.
- `portraitSrc` is either a reviewed local public asset path or `null`. A missing or failed image displays `initials`.
- `reviewFocus` is short, approved profile copy and contains no unsupported credential claim.
- Only a validated Calendly event URL can produce an `available` destination.
- An invalid, empty, or absent booking value always produces `{ status: 'coming-soon', url: null }`.
- A `coming-soon` reviewer remains visible for comparison but cannot become the selected booking choice.

## Booking Destination Validation

The configuration module exposes a pure normalizer that accepts an unknown candidate and returns `BookingDestination`.

An available URL must satisfy every rule:

1. It parses successfully with `new URL(candidate)`.
2. Its protocol is exactly `https:`.
3. Its normalized hostname is exactly `calendly.com`.
4. It has no username or password.
5. It has no explicit custom port.
6. It has no query string or fragment.
7. Its path contains a non-empty event path beyond `/`.

Examples:

| Candidate | Result |
|-----------|--------|
| `https://calendly.com/reviewer/cv-review` | `available` |
| `http://calendly.com/reviewer/cv-review` | `coming-soon` |
| `https://calendly.example.com/reviewer/cv-review` | `coming-soon` |
| `https://calendly.com/reviewer/cv-review?name=student` | `coming-soon` |
| `null`, empty text, or malformed text | `coming-soon` |

## Invitation Content

The first implementation uses static, local content:

```ts
export interface CVReviewInvitationContent {
  label: 'CV';
  hook: string;
  body: string;
  chooseReviewerLabel: string;
}
```

Initial direction:

- Hook: `Get hired!`
- Body: `Book a 1:1 meeting to enhance your CV/Resume`
- Action: `Now!`

This content can be refined without changing interaction state or reviewer configuration.

## UI State

### Invitation State

```ts
export type InvitationState = 'closed' | 'preview' | 'pinned';
```

| State | Meaning | Content operable |
|-------|---------|------------------|
| `closed` | Compact CV mark only | No |
| `preview` | Temporary desktop hover/focus reveal | Yes |
| `pinned` | Persistent click, keyboard, or touch reveal | Yes |

### Dialog State

```ts
export interface ReviewerDialogState {
  open: boolean;
  selectedReviewerId: ReviewerId | null;
}
```

Invariants:

- `selectedReviewerId` is `null` whenever the dialog first opens.
- A selected ID must resolve to an `available` reviewer.
- Exactly one reviewer can be selected at a time.
- Closing the dialog clears the selection.
- The shared Select action is hidden below the clipped dialog and non-operable when selection is `null`.
- Component state is not written to local storage, session storage, the URL, or a global store.

## State Transitions

| Current state | Event | Guard | Next state | Side effect |
|---------------|-------|-------|------------|-------------|
| `closed` | Fine-pointer enter or trigger focus | Dialog closed | `preview` | Reveal invitation |
| `preview` | Pointer and focus leave connected surface | Not pinned and dialog closed | `closed` | Reverse reveal |
| `closed` or `preview` | Trigger click, Enter, Space, or touch tap | — | `pinned` | Keep invitation open |
| `pinned` | Trigger activation | Dialog closed | `closed` | Collapse invitation |
| `pinned` | Escape, close control, or click away | Dialog closed | `closed` | Restore compact mark |
| `preview` or `pinned` | Choose-reviewer action | — | unchanged | Open dialog with no selection |
| any invitation state | Dialog closes | — | `pinned` | Return focus to the invoking action |
| dialog open | Available reviewer selected | Valid ID | dialog open | Replace current selection |
| dialog open | Booking action activated | Valid selection | dialog open | Browser follows that reviewer's URL in a new context |

The dialog owns Escape while open, preventing one key press from closing both dialog and underlying invitation.

## Relationships and Derived Values

```text
CVReviewInvitationContent
          |
          v
CVReviewHeaderItem ---- opens ----> ReviewerDialogState
                                            |
                                            v
                                  ReviewerProfile[3]
                                            |
                                            v
                                  BookingDestination
```

Derived presentation values include:

- availability label: `Coming soon` when `booking.status === 'coming-soon'`;
- booking label: `Select {displayName} on Calendly — opens in a new tab`;
- avatar fallback: `initials` when no portrait is supplied or image loading fails;
- premium styling: enabled only when `visualTier === 'premium-gold'`.

## Privacy and Lifetime

TheDay sends no student identity, CV content, selected reviewer, analytics payload, or prefilled form data to Calendly. The destination is contacted only after a deliberate activation of the external booking link. All local UI state disappears when the component unmounts or the page reloads.
