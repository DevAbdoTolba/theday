# Feature Specification: CV Review Header Invitation

**Feature Branch**: `009-cv-review-header`
**Created**: 2026-07-23
**Status**: Draft
**Input**: User description: "Add a bold CV item to the site header on phone and desktop. It begins as a compact circular/notch-like shape, expands into an organic attached panel with smooth Apple-like motion, uses funny persuasive copy to invite a CV review, and lets the visitor choose Abdo Tolba, Omar Shawky, or Nairah before opening that reviewer's scheduling page."

## Clarifications

### Session 2026-07-23

- Q: Which pages should show the CV header item in the first release? → A: Student dashboard and subject pages only.
- Q: How should the CV invitation behave on desktop after hover? → A: Hover or focus opens a preview; clicking pins it open until dismissed.
- Q: How should the CV invitation present itself on phones? → A: Tapping expands an attached organic panel adapted to the phone width.
- Q: How should a visitor confirm their reviewer choice? → A: Select one reviewer profile, then use a shared booking button; Nairah's profile may use a more visibly premium but tasteful selection effect.
- Q: What service does a reviewer booking provide? → A: A live one-to-one CV review call.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Discover the CV Invitation (Priority: P1)

As a visitor, I notice a compact, bold "CV" item in the main header without it competing with the rest of the navigation. On desktop, pointing at or focusing the item expands it into an attached, organically rounded preview, and clicking pins that panel open for comfortable interaction. On touch devices, tapping it produces the equivalent persistent reveal.

**Why this priority**: The feature cannot attract CV-review bookings unless the entry point is noticeable, understandable, and usable on both desktop and mobile.

**Independent Test**: Open any supported page on desktop and phone-sized viewports, find the "CV" header item, activate it using mouse, keyboard, and touch, and verify the same invitation is revealed without leaving the page.

**Acceptance Scenarios**:

1. **Given** the header is visible on a desktop device, **When** the visitor points at the collapsed "CV" item, **Then** it smoothly grows from a compact circular/notch-like form into an attached content panel.
2. **Given** the header is visible on a keyboard-controlled desktop device, **When** the visitor focuses the "CV" item, **Then** the same preview becomes available without requiring a mouse and can be pinned through activation.
3. **Given** the header is visible on a touch device, **When** the visitor taps the "CV" item, **Then** an organic panel expands from and remains visually attached to the item, adapts to the available phone width, and stays usable until dismissed or another destination is chosen.
4. **Given** the desktop invitation is showing as an unpinned preview, **When** the pointer and focus leave the connected trigger-and-panel area, **Then** it returns smoothly to the compact "CV" state without flicker or a sudden layout jump.
5. **Given** the desktop invitation has been pinned by click or keyboard activation, **When** the pointer leaves it, **Then** it remains open until the visitor uses Escape, its close action, or an outside interaction.

**Required Shape Journey**:

1. **Resting mark**: A compact, bold "CV" sits inside a near-circular organic form with a restrained background presence.
2. **Intent response**: Hover, focus, or tap wakes a subtle circular halo behind the mark before meaningful growth begins.
3. **Connected growth**: The original form widens and extends downward while preserving a curved neck that visually anchors the growing surface to the header.
4. **Panel formation**: The lower surface gains enough room for content but keeps continuously rounded, slightly irregular edges instead of resolving into a standard rectangular menu.
5. **Content arrival**: Copy and the primary action appear only after the shape has created sufficient visual space, so content never looks detached from or clipped by the movement.
6. **Reverse return**: Dismissal follows the same visual logic in reverse, with content leaving before the organic panel settles back into the compact "CV" mark.

---

### User Story 2 - Understand the CV Review Offer (Priority: P1)

As a student, I see a short, funny, slightly provocative invitation that makes the value of a live one-to-one CV review call clear and encourages me to act without insulting or embarrassing me.

**Why this priority**: The visual interaction earns attention, but clear and engaging copy is what turns that attention into interest.

**Independent Test**: Expand the item and verify that a first-time visitor can explain what is offered, who provides it, and what the next action does after reading only the expanded panel.

**Acceptance Scenarios**:

1. **Given** the invitation is expanded, **When** the visitor reads it, **Then** it clearly offers a scheduled live one-to-one CV review call with one of three people who study and specialize in the field.
2. **Given** the visitor reads the copy, **When** they assess its tone, **Then** it feels playful, confident, and persuasive while avoiding personal attacks, shame, or promises of guaranteed employment.
3. **Given** the visitor wants a review, **When** they inspect the expanded panel, **Then** one clear action invites them to choose a reviewer.

**Initial Copy Direction**:

- Hook: **"Your CV says 'hire me.' Does it, though?"**
- Body: **"Let someone who actually studies this stuff catch the bits recruiters politely pretend not to see. Pick your reviewer before your CV develops trust issues."**
- Primary action: **"Choose your reviewer"**

The wording may be refined later while keeping the same playful, concise, action-oriented intent.

---

### User Story 3 - Choose a Reviewer (Priority: P1)

As a visitor who wants help, I open a focused dialog showing all three reviewers so I can compare the available people and select one confidently.

**Why this priority**: Choosing a reviewer is the core conversion step between interest and booking.

**Independent Test**: Activate "Choose your reviewer" and verify the dialog presents the correct three people, remains usable at small and large viewport sizes, and allows each profile to be selected independently.

**Acceptance Scenarios**:

1. **Given** the invitation is expanded, **When** the visitor activates "Choose your reviewer," **Then** a dialog opens containing Abdo Tolba, Omar Shawky, and Nairah.
2. **Given** final portraits have not yet been supplied, **When** the dialog opens, **Then** each reviewer has a polished fallback avatar using their initials rather than a broken or empty image.
3. **Given** all reviewer choices are visible, **When** the visitor views or selects Nairah's profile, **Then** it has a clearly visible gold-accented premium effect that remains tasteful and does not interfere with the other choices.
4. **Given** the dialog is open, **When** the visitor uses a keyboard or assistive technology, **Then** the dialog has a clear title, predictable focus order, descriptive reviewer controls, and a reliable close action.
5. **Given** the dialog is open on a small phone, **When** the visitor reviews all three options, **Then** every profile and action remains readable, reachable, and inside the viewport.
6. **Given** no reviewer has been selected, **When** the visitor chooses one profile, **Then** that profile gains a clear selected state, the other profiles become unselected, and one shared booking button identifies the current choice.

---

### User Story 4 - Book with the Selected Reviewer (Priority: P1)

As a visitor, I choose a reviewer, confirm that choice with one shared booking button, and open that person's scheduling page in a new browser tab so I can see their current availability and book without losing my place on TheDay.

**Why this priority**: A successful handoff to scheduling is the feature's main outcome.

**Independent Test**: Configure three test scheduling destinations, select each reviewer in turn, activate the shared booking button, and verify the correct destination opens in a new tab while the original page remains available.

**Acceptance Scenarios**:

1. **Given** a reviewer with a valid scheduling destination is selected, **When** the visitor activates the shared booking button, **Then** the matching booking page opens in a new tab and the original site remains open.
2. **Given** a reviewer does not yet have a scheduling destination, **When** the dialog renders, **Then** that reviewer is clearly marked "Coming soon" and cannot open an empty or incorrect page.
3. **Given** the scheduling service is unavailable, **When** the external page fails to load, **Then** the original TheDay page remains intact so the visitor can return and choose another reviewer.
4. **Given** the visitor returns from a booking page, **When** they reopen the invitation, **Then** all three reviewer choices remain available.

---

### User Story 5 - Experience Comfortable Motion (Priority: P2)

As a visitor, I experience the circle-to-notch-to-panel transformation as one continuous, calm movement that feels intentional on capable devices and remains comfortable when I prefer reduced motion.

**Why this priority**: The movement is the feature's signature, but it must not reduce accessibility, responsiveness, or trust.

**Independent Test**: Repeatedly open and close the invitation on representative desktop and mobile devices, then repeat with reduced-motion preferences enabled.

**Acceptance Scenarios**:

1. **Given** normal motion is enabled, **When** the invitation opens or closes, **Then** its outline, size, content reveal, and surrounding glow move as one coordinated transition without hard corners or disconnected stages.
2. **Given** reduced motion is requested, **When** the invitation changes state, **Then** the full morphing movement is replaced by a brief, low-motion state change while all content and actions remain available.
3. **Given** the visitor rapidly enters and leaves the activation area, **When** the animation changes direction, **Then** it reverses cleanly from its current visual state without snapping or queuing multiple animations.

### Edge Cases

- A touch device reports hover capability unreliably.
- A visitor uses keyboard navigation without ever moving the pointer.
- The header is near a viewport edge or has limited horizontal space.
- The panel content is translated or enlarged by browser text scaling.
- The visitor repeatedly activates and dismisses the item before a transition finishes.
- A reviewer portrait is missing, slow to load, or fails.
- One or more scheduling URLs have not yet been supplied.
- The scheduling provider is blocked, unavailable, or opened with strict privacy settings.
- The visitor enables reduced motion, high contrast, or 200% text zoom.
- The modal opens while the expanded header panel is close to collapsing.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST add a clearly labeled "CV" item to the student dashboard and subject browsing headers on desktop and mobile.
- **FR-002**: The collapsed item MUST display the word "CV" in a bold, readable style inside a compact circular or organically rounded notch-like background.
- **FR-003**: The collapsed treatment MUST be noticeable without visually overpowering the main navigation or page title.
- **FR-004**: On devices with precise pointing input, hover or keyboard focus MUST open an unpinned preview; click or keyboard activation MUST pin it open until the visitor uses Escape, its close action, or an outside interaction.
- **FR-005**: On touch devices, a deliberate tap MUST expand a persistent organic panel that remains visually attached to the "CV" item and adapts to the available phone width.
- **FR-006**: The expanded shape MUST remain visually connected to the original "CV" item and retain an organic notch or bubble silhouette rather than becoming a plain full rectangle.
- **FR-007**: The transition between collapsed and expanded states MUST coordinate the container shape, subtle background/glow treatment, and content reveal as a continuous movement.
- **FR-008**: Expanding or collapsing the item MUST NOT cause a disruptive shift in the surrounding header or main page content.
- **FR-009**: The invitation MUST include concise, funny, persuasive copy that clearly offers a scheduled live one-to-one CV review call with people studying and specializing in the field.
- **FR-010**: The copy MUST avoid humiliation, discriminatory language, misleading credentials, and guarantees about hiring outcomes.
- **FR-011**: The expanded invitation MUST include one clear primary action labeled to communicate that the visitor will choose a reviewer.
- **FR-012**: Activating the primary action MUST open a modal dialog without navigating away from the current page.
- **FR-013**: The dialog MUST present exactly three initial reviewer profiles: Abdo Tolba, Omar Shawky, and Nairah.
- **FR-014**: Each reviewer profile MUST support a portrait, a readable name, a short role or review-focus description, and an individual scheduling destination.
- **FR-015**: Until final portraits are supplied, each profile MUST show a deliberate initials-based fallback.
- **FR-016**: Nairah's profile MUST have a clearly visible but tasteful premium treatment using a thin gold accent and a richer hover, focus, and selected-state response without obscuring names, controls, or the shared booking action.
- **FR-017**: Selecting an available reviewer MUST mark exactly that profile as the current choice without opening a new page; one shared booking button MUST name or otherwise clearly identify the selected reviewer and open only that reviewer's configured scheduling destination in a new browser tab.
- **FR-018**: A reviewer without a valid scheduling destination MUST be shown as unavailable or "Coming soon" and MUST NOT open a blank, placeholder, or shared fallback link.
- **FR-019**: The first release MUST keep reviewer comparison inside TheDay limited to profile information; it MUST NOT embed or aggregate all three live calendars.
- **FR-020**: The modal MUST be dismissible by its close control, the Escape key, and an appropriate outside interaction without trapping focus or leaving the header item in a broken state.
- **FR-021**: All interactions and content MUST remain usable with mouse, keyboard, touch, screen readers, 200% text zoom, and both light and dark themes.
- **FR-022**: The experience MUST honor reduced-motion preferences and provide a low-motion equivalent that preserves state clarity.
- **FR-023**: Motion MUST remain lightweight and device-friendly, MUST rely on native browser styling and animation capabilities, and MUST NOT require a new animation dependency.
- **FR-024**: The expanded panel and reviewer dialog MUST remain within the viewport and usable at widths down to 320 pixels.
- **FR-025**: Reviewer portraits and scheduling destinations MUST be replaceable without changing the feature's interaction or layout.

### Key Entities

- **CV Invitation**: The header entry point and its collapsed/expanded state, including its label, promotional copy, and reviewer-selection action.
- **Reviewer Profile**: A selectable person who can review a CV. Contains a display name, portrait or initials fallback, short review-focus description, visual treatment, selection state, availability state, and scheduling destination.
- **Booking Destination**: The external scheduling page associated with one reviewer. It may be configured, missing, or temporarily unavailable.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 90% of first-time test participants can identify that the "CV" header item offers CV-review help without instructions.
- **SC-002**: At least 90% of test participants can open the invitation, choose a reviewer, confirm the choice, and reach the correct scheduling page in no more than four deliberate actions after locating the "CV" item.
- **SC-003**: In 100% of reviewer-routing tests, Abdo Tolba, Omar Shawky, and Nairah open only their individually configured scheduling destinations.
- **SC-004**: The invitation begins responding within 100 milliseconds of hover, focus, or tap and reaches a stable readable state within 600 milliseconds on supported representative devices.
- **SC-005**: At least 95% of repeated open/close interactions complete without visible snapping, flicker, queued motion, or accidental activation.
- **SC-006**: All invitation, modal, reviewer-selection, and dismissal tasks can be completed using keyboard alone and using touch alone.
- **SC-007**: At 320-pixel viewport width and 200% text zoom, no essential copy, reviewer identity, action, or close control is clipped or unreachable.
- **SC-008**: With reduced motion enabled, 100% of the same information and actions remain available without the full morphing animation.
- **SC-009**: In moderated copy testing, at least 80% of participants describe the message as clear and playful, and fewer than 10% describe it as insulting or confusing.

## Assumptions

- "Header" means the student dashboard and subject browsing header variants on phone and desktop.
- The first release uses the reviewer modal to compare people, then opens a selected reviewer's Calendly page in a new tab.
- Every available booking represents a live one-to-one CV review call; its duration and meeting platform may be defined on the selected reviewer's scheduling page.
- The three live scheduling URLs and final portraits will be supplied later and may remain unavailable placeholders until then.
- Each reviewer will provide or approve a short role/review-focus description before release.
- Live schedule comparison, availability aggregation, and embedded calendars are outside the first release.
- The exact final marketing copy may change, but it will preserve the approved playful, persuasive, non-hostile tone.

## Scope Boundaries

### In Scope

- A responsive "CV" header item for desktop and mobile.
- Organic collapsed, expanded, hover, focus, tap, and dismissal states.
- Playful CV-review invitation copy and one reviewer-selection action.
- An accessible modal with three reviewer profiles.
- Placeholder handling for missing portraits and scheduling URLs.
- A clearly visible but tasteful premium treatment for Nairah's profile.
- External booking handoff to each reviewer's configured scheduling page.
- Reduced-motion, keyboard, touch, theme, and small-screen behavior.

### Out of Scope

- Hosting the scheduling flow directly inside TheDay.
- Adding the CV item to the homepage, admin areas, hidden experiences, or other public routes in the first release.
- Displaying or comparing live appointment availability across all three reviewers.
- Calendly API integration, calendar synchronization, routing automation, or booking management.
- Reviewer authentication, dashboards, availability editing, or booking analytics.
- Payment collection or guarantees about CV quality, interviews, or employment.
- Asynchronous written-only CV reviews in the first release.
- Final portrait assets and final scheduling URLs, which will be provided separately.
