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
- Q: How should a visitor confirm their reviewer choice? → A: Select one reviewer photo, then use the shared yellow Meet action.
- Q: What service does a reviewer booking provide? → A: A live one-to-one CV review call.
- Q: How should the compact mark connect to the expanded invitation? → A: The compact circle itself must morph into one continuous outlined surface; no second outlined circle, overlapping border, or bubble may remain visible.
- Q: What content should appear in the expanded invitation? → A: A short ad only: “Get hired!”, “Book a 1:1 meeting to enhance your CV/Resume”, and a “Now!” action.
- Q: How should reviewer selection adapt by screen size? → A: Desktop uses three equal horizontal fighter panels with diagonal separators; phones stack the same panels vertically with slightly tilted horizontal separators.
- Q: Where should dialog close controls appear? → A: A visible X is mobile-only; desktop dismissal uses Escape or the backdrop.
- Q: What exactly forms each reviewer section? → A: The image is the complete clipped section; there are no cards, avatars, divider lines, titles, or idle names.
- Q: What temporary content makes the flow fully usable? → A: Each section uses a Picsum placeholder image and every Meet action opens `example.com` in a new tab.
- Q: What final polish is required after the image-section review? → A: Give the CV mark more internal breathing room, keep the phone invitation fully inside the viewport, use readable light reviewer names, remove normal selection/focus outlines from photos, and give Nairah a subtle warm premium glow.
- Q: How should the compact label and Nairah premium treatment behave in the final interaction? → A: The CV label must keep its resting inset and circular corner space throughout expansion. Nairah receives an immediate photo shimmer that repeats about every six seconds while hovered or focused, and selection drops a small gold premium badge from above with a restrained recurring dance.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Discover the CV Invitation (Priority: P1)

As a visitor, I notice a compact, bold "CV" item in the main header without it competing with the rest of the navigation. On desktop, pointing at or focusing the item expands it into an attached, organically rounded preview, and clicking pins that panel open for comfortable interaction. On touch devices, tapping it produces the equivalent persistent reveal.

**Why this priority**: The feature cannot attract CV-review bookings unless the entry point is noticeable, understandable, and usable on both desktop and mobile.

**Independent Test**: Open any supported page on desktop and phone-sized viewports, find the "CV" header item, activate it using mouse, keyboard, and touch, and verify the same invitation is revealed without leaving the page.

**Acceptance Scenarios**:

1. **Given** the header is visible on a desktop device, **When** the visitor points at the collapsed "CV" item, **Then** that same single bordered circle smoothly grows into the complete content surface without exposing an overlapping circle border or a separate rectangle.
2. **Given** the header is visible on a keyboard-controlled desktop device, **When** the visitor focuses the "CV" item, **Then** the same preview becomes available without requiring a mouse and can be pinned through activation.
3. **Given** the header is visible on a touch device, **When** the visitor taps the "CV" item, **Then** an organic panel expands from and remains visually attached to the item, adapts to the available phone width, and stays usable until dismissed or another destination is chosen.
4. **Given** the desktop invitation is showing as an unpinned preview, **When** the pointer and focus leave the connected trigger-and-panel area, **Then** it returns smoothly to the compact "CV" state without flicker or a sudden layout jump.
5. **Given** the desktop invitation has been pinned by click or keyboard activation, **When** the pointer leaves it, **Then** it remains open until the visitor uses Escape, activates the CV mark again, or uses an outside interaction.
6. **Given** the compact CV mark is visible, **When** it is viewed at rest, **Then** the label has comfortable internal space from the circular edge.
7. **Given** the invitation opens at 320px, **When** it reaches its expanded state, **Then** its complete shape and content stay inside the viewport without horizontal overflow.
8. **Given** the compact mark expands, **When** its top-right corner changes into the invitation, **Then** the CV label keeps the same comfortable inset and does not move or widen toward the outline.

**Required Shape Journey**:

1. **Resting mark**: A compact, bold "CV" sits inside a near-circular organic form with a restrained background presence.
2. **Intent response**: Hover, focus, or tap immediately begins widening the original outlined form.
3. **Connected growth**: The original form widens and extends downward as one uninterrupted black surface with one uninterrupted white outline.
4. **Panel formation**: The surface gains enough room for content while keeping continuously rounded, slightly irregular edges; no decorative circle border may remain over or beside the expanded outline.
5. **Content arrival**: Copy and the primary action appear only after the shape has created sufficient visual space, so content never looks detached from or clipped by the movement.
6. **Reverse return**: Dismissal follows the same visual logic in reverse, with content leaving before the organic panel settles back into the compact "CV" mark.

---

### User Story 2 - Understand the CV Review Offer (Priority: P1)

As a student, I see a very short advertisement that immediately tells me the benefit, the service, and the next action.

**Why this priority**: The visual interaction earns attention, but clear and engaging copy is what turns that attention into interest.

**Independent Test**: Expand the item and verify the entire message can be understood at a glance without scrolling.

**Acceptance Scenarios**:

1. **Given** the invitation is expanded, **When** the visitor glances at it, **Then** the message reads “Get hired!” followed by “Book a 1:1 meeting to enhance your CV/Resume.”
2. **Given** the visitor wants a review, **When** they inspect the expanded panel, **Then** one clear action labeled “Now!” opens reviewer selection.
3. **Given** the panel is open at any supported screen size, **When** the visitor views it at normal text scale, **Then** the message and action fit without an internal scrollbar.

**Initial Copy Direction**:

- Hook: **"Get hired!"**
- Body: **"Book a 1:1 meeting to enhance your CV/Resume"**
- Primary action: **"Now!"**

---

### User Story 3 - Choose a Reviewer (Priority: P1)

As a visitor who wants help, I open a focused dialog showing all three reviewers so I can compare the available people and select one confidently.

**Why this priority**: Choosing a reviewer is the core conversion step between interest and booking.

**Independent Test**: Activate “Now!” and verify the dialog presents the correct three people in the required desktop and phone compositions, supports hover/focus/tap selection, and keeps booking confirmation hidden until a valid choice exists.

**Acceptance Scenarios**:

1. **Given** the invitation is expanded, **When** the visitor activates “Now!”, **Then** an untitled image-only dialog opens with Nairah, Abdo Tolba, and Omar Shawky represented by three full-surface photos.
2. **Given** final portraits have not yet been supplied, **When** the dialog opens, **Then** each full section uses its own Picsum placeholder photo.
3. **Given** no reviewer is selected, **When** the dialog opens, **Then** it displays no visible title, reviewer name, description, status, or action text.
4. **Given** the dialog is open, **When** the visitor uses a keyboard or assistive technology, **Then** the dialog has an accessible name without a visible title, predictable focus order, descriptive reviewer controls, and reliable Escape dismissal.
5. **Given** the dialog is open on desktop, **When** the visitor views the choices, **Then** three full-height photo sections meet through their own diagonal cut edges without rendered divider lines or separate image containers.
6. **Given** the dialog is open on a phone, **When** the visitor views the choices, **Then** three full-width photo sections stack and meet through their own slightly tilted cut edges.
7. **Given** a reviewer is idle, **When** the visitor hovers or focuses that photo section, **Then** only the photo brightens slightly and no reviewer name appears.
8. **Given** no reviewer has been selected, **When** the dialog opens, **Then** the yellow Meet action is non-operable and visually held completely below the dialog.
9. **Given** the visitor selects a reviewer, **When** selection completes, **Then** only that reviewer's high-contrast light name appears inside the photo and the readable yellow Meet action smoothly rises into the lower quarter of the dialog.
10. **Given** a different reviewer is selected, **When** selection changes, **Then** the previous name hides and only the newly selected reviewer name appears.
11. **Given** the dialog is open, **When** viewed on desktop, **Then** no visible X is shown; on a phone, a visible X is available.
12. **Given** a photo is focused or selected, **When** its visual state changes, **Then** brightness and a slight zoom communicate the state without adding a normal border or outline around the photo.
13. **Given** Nairah's photo is visible, **When** it is hovered or focused, **Then** a restrained warm shine crosses the photo immediately and repeats roughly every six seconds while the interaction remains active.
14. **Given** Nairah is selected, **When** selection completes, **Then** a small gold premium badge drops into the upper photo area and performs a restrained recurring dance without covering her name or changing the panel size.

---

### User Story 4 - Book with the Selected Reviewer (Priority: P1)

As a visitor, I choose a reviewer, confirm that choice with the shared yellow Meet action, and open the configured page in a new browser tab without losing my place on TheDay.

**Why this priority**: A successful handoff to scheduling is the feature's main outcome.

**Independent Test**: Select each reviewer in turn, activate Meet, and verify `example.com` opens in a new tab while the original page remains available.

**Acceptance Scenarios**:

1. **Given** any reviewer is selected, **When** the visitor activates Meet, **Then** `example.com` opens in a new tab and the original site remains open.
2. **Given** the external page is unavailable, **When** the new tab fails to load, **Then** the original TheDay page remains intact so the visitor can return and choose another reviewer.
3. **Given** the visitor returns from the external page, **When** they reopen the invitation, **Then** all three reviewer choices remain available.

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
- **FR-002**: The item MUST display the word "CV" in a bold, readable style with comfortable internal breathing room, and expansion MUST preserve the label's position, width, and circular corner inset.
- **FR-003**: The collapsed treatment MUST be noticeable without visually overpowering the main navigation or page title.
- **FR-004**: On devices with precise pointing input, hover or keyboard focus MUST open an unpinned preview; click or keyboard activation MUST pin it open until the visitor uses Escape, toggles the CV mark, or uses an outside interaction.
- **FR-005**: On touch devices, a deliberate tap MUST expand a persistent organic panel that remains visually attached to the "CV" item, adapts to the available phone width, and never overflows horizontally.
- **FR-006**: The compact mark and expanded invitation MUST be the same continuously morphing surface with one continuous white outline; overlapping outlined circles, doubled borders, detached connectors, and plain rectangular menus are prohibited.
- **FR-007**: The transition between collapsed and expanded states MUST coordinate the container shape, subtle background/glow treatment, and content reveal as a continuous movement.
- **FR-008**: Expanding or collapsing the item MUST NOT cause a disruptive shift in the surrounding header or main page content.
- **FR-009**: The invitation MUST use exactly the short ad hierarchy “Get hired!”, “Book a 1:1 meeting to enhance your CV/Resume”, and “Now!”.
- **FR-010**: The copy MUST avoid humiliation, discriminatory language, misleading credentials, and guarantees about hiring outcomes.
- **FR-011**: The expanded invitation MUST include one clear primary action labeled “Now!” that opens reviewer selection.
- **FR-012**: Activating the primary action MUST open a modal dialog without navigating away from the current page.
- **FR-013**: The dialog MUST present exactly three initial reviewer profiles: Abdo Tolba, Omar Shawky, and Nairah.
- **FR-014**: Each reviewer profile MUST provide one full-surface photo, one name revealed only when selected, and one scheduling destination.
- **FR-015**: Until final portraits are supplied, the three full-surface sections MUST use distinct Picsum placeholder photos.
- **FR-016**: The dialog MUST show no visible title, reviewer name, description, availability label, or action before selection.
- **FR-017**: Selecting a reviewer MUST reveal only that reviewer's light high-contrast name with dark separation from the photo; changing selection MUST hide the previous name and reveal only the new name.
- **FR-018**: Every initial reviewer MUST be selectable and MUST use `https://example.com/` as the temporary functional destination.
- **FR-019**: The first release MUST keep reviewer comparison inside TheDay limited to profile information; it MUST NOT embed or aggregate all three live calendars.
- **FR-020**: The modal MUST be dismissible by Escape and an appropriate outside interaction on desktop; phones MUST additionally show a visible X close control. A visible X MUST NOT appear in the desktop dialog.
- **FR-021**: All interactions and content MUST remain usable with mouse, keyboard, touch, screen readers, 200% text zoom, and both light and dark themes.
- **FR-022**: The experience MUST honor reduced-motion preferences and provide a low-motion equivalent that preserves state clarity.
- **FR-023**: Motion MUST remain lightweight and device-friendly, MUST rely on native browser styling and animation capabilities, and MUST NOT require a new animation dependency.
- **FR-024**: The expanded invitation and reviewer dialog MUST remain within the viewport and usable at widths down to 320 pixels. Their normal supported layouts MUST fit without visible internal scrollbars.
- **FR-025**: Reviewer photos and scheduling destinations MUST be replaceable without changing the feature's interaction or layout.
- **FR-026**: The reviewer dialog MUST use three equal photo sections whose clipped edges create the diagonal desktop and tilted phone boundaries; separate divider lines and nested image cards are prohibited.
- **FR-027**: Every full-surface photo MUST begin dimmed and brighten slightly on hover or focus without revealing any visible text.
- **FR-028**: One yellow Meet action MUST remain non-operable and translated completely below the clipped dialog until selection, then rise into the lower quarter.
- **FR-029**: Meet MUST open `https://example.com/` in a new tab using a secure external-link handoff.
- **FR-030**: Normal hover, focus, and selected photo states MUST use only brightness and slight zoom; they MUST NOT add a visible border or outline around the photo.
- **FR-031**: Nairah's photo MUST receive a restrained premium treatment: an immediate warm shine repeated at roughly six-second intervals while hovered or focused, plus a small gold badge that drops from above only after selection and then performs a subtle recurring dance. The treatment MUST NOT form a border, change panel size, or obscure the photo or selected name.
- **FR-032**: The yellow Meet action MUST keep strong text/background contrast in every selected state.

### Key Entities

- **CV Invitation**: The header entry point and its collapsed/expanded state, including its label, promotional copy, and reviewer-selection action.
- **Reviewer Profile**: A selectable person represented by a full-surface photo, a name visible only while selected, selection state, and a scheduling destination.
- **Booking Destination**: The external scheduling page associated with one reviewer. It may be configured, missing, or temporarily unavailable.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 90% of first-time test participants can identify that the "CV" header item offers CV-review help without instructions.
- **SC-002**: At least 90% of test participants can open the invitation, choose a reviewer, confirm the choice, and reach the correct scheduling page in no more than four deliberate actions after locating the "CV" item.
- **SC-003**: In 100% of temporary routing tests, Abdo Tolba, Omar Shawky, and Nairah open `https://example.com/` in a new tab.
- **SC-004**: The invitation begins responding within 100 milliseconds of hover, focus, or tap and reaches a stable readable state within 600 milliseconds on supported representative devices.
- **SC-005**: At least 95% of repeated open/close interactions complete without visible snapping, flicker, queued motion, or accidental activation.
- **SC-006**: All invitation, modal, reviewer-selection, and dismissal tasks can be completed using keyboard alone and using touch alone.
- **SC-007**: At a 320-pixel viewport width, all three stacked reviewer photos, the mobile close control, selected identity, and active Meet action remain inside the viewport without a visible internal scrollbar at normal text scale.
- **SC-008**: With reduced motion enabled, 100% of the same information and actions remain available without the full morphing animation.
- **SC-009**: In moderated copy testing, at least 80% of participants describe the message as clear and playful, and fewer than 10% describe it as insulting or confusing.
- **SC-010**: In visual review at desktop and phone sizes, the compact-to-expanded invitation shows exactly one continuous external outline with no intersecting circle border.
- **SC-011**: At 320px, the expanded invitation produces no horizontal page overflow and keeps at least 0.75rem of total viewport gutter.
- **SC-012**: Across resting, preview, and pinned states, the CV label retains at least the same visible edge clearance it has in the compact mark; Nairah's premium motion remains confined to her photo and repeats no more than once per six-second cycle.

## Assumptions

- "Header" means the student dashboard and subject browsing header variants on phone and desktop.
- The temporary release uses Picsum photos and opens `example.com` until final portraits and scheduling pages are supplied.
- Every available booking represents a live one-to-one CV review call; its duration and meeting platform may be defined on the selected reviewer's scheduling page.
- The three final scheduling URLs and portraits will replace functional placeholders later.
- Reviewer-focus descriptions may remain in configuration for future use but are not displayed in this compact fighter-selection release.
- Live schedule comparison, availability aggregation, and embedded calendars are outside the first release.
- The exact final marketing copy may change, but it will preserve the approved playful, persuasive, non-hostile tone.

## Scope Boundaries

### In Scope

- A responsive "CV" header item for desktop and mobile.
- Organic collapsed, expanded, hover, focus, tap, and dismissal states.
- Playful CV-review invitation copy and one reviewer-selection action.
- An accessible modal with three reviewer profiles.
- Distinct Picsum placeholder photos and a shared functional `example.com` destination.
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
