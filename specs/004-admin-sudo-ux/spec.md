# Feature Specification: Admin & Sudo-1337 UX Enhancement

**Feature Branch**: `004-admin-sudo-ux`
**Created**: 2026-03-13
**Status**: Draft
**Input**: Enhance admin and sudo-1337 pages UX/UI. Admin locked to assigned class, subject CRUD with sudo-1337 approval, category and content CRUD, AAA-level UI with no dropdowns.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Manages Subjects (with Approval) (Priority: P1)

An admin signs in and lands on their dashboard showing their assigned class. They see all subjects as visual cards in a grid. The admin can create a new subject (name + abbreviation), edit an existing subject, or mark one for deletion. None of these changes go live immediately — they enter a "pending" state visible to the admin with a clear badge. The sudo-1337 later reviews and approves or rejects each pending change.

**Why this priority**: Subject management is the core new capability. Without it, admins depend entirely on the sudo-1337 to configure academic structure. The approval workflow prevents unauthorized changes while empowering admins.

**Independent Test**: Can be fully tested by having an admin create/edit/delete a subject, verifying it shows as "pending", then having the sudo-1337 approve it and confirming it goes live.

**Acceptance Scenarios**:

1. **Given** an admin is signed in with an assigned class, **When** they view their dashboard, **Then** they see their class name prominently and all subjects displayed as cards in a grid layout (no dropdown menus).
2. **Given** an admin creates a new subject, **When** they submit the form, **Then** the subject appears in the grid with a "Pending Approval" badge and is not visible to students.
3. **Given** an admin edits a subject name or abbreviation, **When** they save, **Then** the original remains active and a pending edit request is created.
4. **Given** an admin marks a subject for deletion, **When** they confirm, **Then** the subject shows a "Pending Deletion" badge but remains active until sudo-1337 approves.
5. **Given** an admin has no assigned class, **When** they access the dashboard, **Then** they see a clear message that no class is assigned and should contact the sudo-1337.
6. **Given** an admin has a pending subject change, **When** they choose to edit or cancel it before sudo-1337 review, **Then** the pending change is updated or removed immediately.

---

### User Story 2 - Admin Manages Categories & Content Freely (Priority: P2)

After selecting a subject (by clicking its card), the admin sees all categories for that subject as visual tabs or segmented panels (not dropdowns). They can add, rename, or delete categories instantly — no approval needed. Within each category, the admin can upload files, add links, add easter eggs, and delete content. All content operations take effect immediately.

**Why this priority**: Day-to-day admin work is uploading content and organizing categories. This must be frictionless and fast.

**Independent Test**: Can be fully tested by an admin clicking a subject, creating a category, uploading a file into it, and verifying the content appears immediately.

**Acceptance Scenarios**:

1. **Given** an admin clicks a subject card, **When** the subject detail view loads, **Then** categories appear as horizontal tabs or visual segments (not a dropdown), with content shown inline below.
2. **Given** an admin adds a new category, **When** they type the name and confirm, **Then** it appears as a new tab/segment immediately without page reload or jumping.
3. **Given** an admin is viewing a category, **When** they upload a file, add a link, or add an easter egg, **Then** the item appears in the content list instantly.
4. **Given** an admin deletes a content item, **When** they confirm deletion, **Then** the item is removed smoothly without the page jumping or layout shifting.
5. **Given** an admin renames a category, **When** they save, **Then** the tab/segment label updates in place.

---

### User Story 3 - Sudo-1337 Reviews and Approves Subject Changes (Priority: P3)

The sudo-1337 signs into their panel and sees a notification badge or dedicated section showing all pending subject changes across all classes. Each pending item shows: what changed, which admin requested it, which class it belongs to, and when. The sudo-1337 can approve or reject each change with a single click. Approved changes go live; rejected changes are removed with the admin notified via a visible status update on their dashboard.

**Why this priority**: The approval workflow completes the admin subject management story. Without this, pending changes pile up with no resolution.

**Independent Test**: Can be fully tested by the sudo-1337 viewing pending changes, approving one, rejecting another, and verifying the outcomes on both the sudo-1337 panel and the admin dashboard.

**Acceptance Scenarios**:

1. **Given** there are pending subject changes, **When** the sudo-1337 opens their panel, **Then** a "Pending Approvals" section or badge shows the count and lists all pending requests.
2. **Given** the sudo-1337 views a pending subject creation, **When** they click "Approve", **Then** the subject becomes active in the class and the pending badge is removed.
3. **Given** the sudo-1337 views a pending subject edit, **When** they click "Reject", **Then** the original subject remains unchanged and the admin sees a temporary "Rejected" badge on their dashboard until dismissed or next session.
4. **Given** the sudo-1337 views a pending subject deletion, **When** they click "Approve", **Then** the subject and all its categories/content are removed.

---

### User Story 4 - Sudo-1337 Manages Classes and Assigns Admins (Priority: P4)

The sudo-1337 can create, edit, and delete classes. They assign exactly one class per admin. The sudo-1337 panel shows all classes as cards with admin assignment status visible. The sudo-1337 can also toggle admin status for users and view which admin manages which class.

**Why this priority**: Class and user management is existing functionality being enhanced with better UI — less critical than new workflows but still important for the complete experience.

**Independent Test**: Can be fully tested by the sudo-1337 creating a class, assigning an admin to it, and verifying the admin sees that class on their dashboard.

**Acceptance Scenarios**:

1. **Given** the sudo-1337 is on their panel, **When** they view the classes section, **Then** classes appear as visual cards (not a table) showing class name, admin assignment, and subject count.
2. **Given** the sudo-1337 assigns a class to an admin, **When** they select the admin, **Then** the assignment updates immediately and the admin's dashboard reflects the new class.
3. **Given** a class has content or active admins, **When** the sudo-1337 tries to delete it, **Then** a warning shows what will be affected before confirmation.

---

### User Story 5 - AAA-Level UI Experience (Priority: P5)

All admin and sudo-1337 interfaces use modern, visually appealing layouts. No dropdown menus for primary navigation or selection. Content transitions smoothly. No layout shifts, no unexpected scrolling, no jumping. Panels stay stable while loading. Error and success feedback is inline and contextual — no intrusive popups for routine actions.

**Why this priority**: UI quality ties all stories together. Poor UI undermines the functional improvements.

**Independent Test**: Can be tested by walking through all admin and sudo-1337 workflows and verifying: no dropdowns for primary selection, no layout shifts during loading, smooth transitions, and clear visual hierarchy.

**Acceptance Scenarios**:

1. **Given** any admin or sudo-1337 page is loading data, **When** the user is waiting, **Then** skeleton placeholders maintain the layout (no content jumping when data arrives).
2. **Given** an admin or sudo-1337 performs any action, **When** feedback is needed, **Then** it appears inline near the action (toast/snackbar for confirmations, inline error messages for failures).
3. **Given** any list of items (subjects, categories, content), **When** displayed, **Then** they use card grids, tabs, or segmented controls — never dropdown selects as the primary interaction pattern.
4. **Given** a user navigates between sections, **When** transitioning, **Then** content transitions smoothly without the scroll position resetting unexpectedly.

---

### Edge Cases

- What happens when an admin's class assignment is removed while they're using the dashboard? They should see an immediate "no class assigned" message on the next data fetch.
- What happens when a sudo-1337 approves a subject deletion but the admin is currently viewing that subject? The content should gracefully show a "subject no longer available" state.
- What happens when two admins are assigned the same class? The system should prevent this — one class maps to exactly one admin.
- What happens when a pending subject change references a class that was deleted? The pending change should be automatically cleaned up.
- What happens when the sudo-1337 rejects a pending subject? The pending subject is removed from the admin's view. Since admins cannot add categories/content to pending subjects, no cascade cleanup is needed.

## Clarifications

### Session 2026-03-13

- Q: Can admins add categories and content to a pending (not yet approved) subject? → A: No — only active (approved) subjects allow category/content management.
- Q: How should rejection be communicated to the admin? → A: Temporary "Rejected" badge visible until admin dismisses or next session.
- Q: Can an admin edit or cancel their own pending subject change before sudo-1337 acts? → A: Yes — admin can both edit and cancel their own pending changes before sudo-1337 acts.
- Q: Must subject names be unique within a class? → A: Unique by default. Admin can override uniqueness to reuse a subject name from another class, enabling cross-class content sharing — all classes with the same subject name see shared content updates.
- Q: What should the canonical UI-facing label be for the super admin role? → A: "sudo-1337" is the universal name used in all UI labels and references.

## Requirements *(mandatory)*

### Functional Requirements

**Admin Dashboard:**

- **FR-001**: System MUST display the admin's assigned class name and details automatically upon login — admin cannot choose or switch classes.
- **FR-002**: System MUST display subjects as a visual card grid, never as dropdown menus.
- **FR-003**: Admin MUST be able to create a new subject (name + abbreviation) which enters "pending approval" state.
- **FR-004**: Admin MUST be able to edit an existing subject's name or abbreviation, creating a pending edit request.
- **FR-005**: Admin MUST be able to request deletion of a subject, which enters "pending deletion" state.
- **FR-005a**: Admin MUST be able to edit or cancel their own pending subject changes (create/edit/delete) before the sudo-1337 acts on them.
- **FR-005b**: Subject names MUST be unique within a class by default. Admin MAY override uniqueness to reuse a subject name from another class, opting into cross-class content sharing.
- **FR-005c**: When a subject name is shared across multiple classes, MongoDB content items (links, easter eggs) within that subject MUST be visible to all classes sharing it. Google Drive files remain per-class and are not shared — each class maintains its own Drive folder structure.
- **FR-006**: System MUST visually distinguish pending subjects from active subjects using badges or visual indicators.
- **FR-007**: Admin MUST be able to create, rename, and delete categories within active (approved) subjects only — pending subjects do not allow category or content management.
- **FR-008**: Admin MUST be able to upload files, create links, and create easter eggs within categories immediately (no approval needed).
- **FR-009**: Admin MUST be able to delete any content item within categories immediately (no approval needed).
- **FR-010**: System MUST show a clear "no class assigned" state when admin has no assigned class.

**Sudo-1337 Panel:**

- **FR-011**: System MUST show all pending subject changes (create/edit/delete) across all classes in a dedicated approvals section.
- **FR-012**: Sudo-1337 MUST be able to approve or reject each pending change individually.
- **FR-013**: Approved subject creations MUST become active and visible to students.
- **FR-014**: Approved subject deletions MUST remove the subject and all its categories and content.
- **FR-015**: Rejected changes MUST show a temporary "Rejected" badge on the admin's dashboard, visible until the admin dismisses it or starts a new session. After dismissal, the item is removed.
- **FR-016**: Sudo-1337 MUST be able to create, edit, and delete classes.
- **FR-017**: Sudo-1337 MUST be able to assign exactly one class per admin.
- **FR-018**: Sudo-1337 MUST be able to toggle admin status for users.

**UI/UX:**

- **FR-019**: System MUST NOT use dropdown menus as the primary selection mechanism for subjects, categories, or classes.
- **FR-020**: System MUST use skeleton loading placeholders to prevent layout shifts during data fetching.
- **FR-021**: System MUST provide inline contextual feedback for all user actions (no modal dialogs for routine confirmations).
- **FR-022**: System MUST maintain scroll position stability — no unexpected jumps when content loads or changes.

### Key Entities

- **Subject Change Request**: Represents a pending subject CRUD operation. Contains: the target class, change type (create/edit/delete), proposed subject data, requesting admin, status (pending/approved/rejected), timestamps.
- **Subject**: Academic subject within a class. Contains: name, abbreviation, active status, shared flag (indicates cross-class content sharing when name matches another class's subject). Lives within the class data structure. Names are unique within a class by default; admin can opt to reuse a name from another class to enable shared content visibility.
- **Category**: A folder/grouping within a subject. Contains: name, parent subject reference. Admin can freely manage.
- **Content Item**: A file, link, or easter egg within a category. Admin can freely manage.
- **Class**: An academic class/section. Assigned to exactly one admin by the sudo-1337.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin can navigate from login to uploading content within a subject in under 30 seconds (currently requires 4+ dropdown selections).
- **SC-002**: 100% of subject changes by admins require sudo-1337 approval before becoming visible to students.
- **SC-003**: Sudo-1337 can review and act on a pending subject change in under 10 seconds per item.
- **SC-004**: Zero layout shifts measured during page transitions and data loading across all admin and sudo-1337 views.
- **SC-005**: All primary selection interactions (subjects, categories, classes) use card/tab/grid patterns — zero dropdown menus in the primary workflow.
- **SC-006**: Admin task completion rate for content management (upload, link, delete) improves by removing the class selection step entirely.

## Assumptions

- One admin is assigned to exactly one class. If an admin needs to manage multiple classes, they need separate accounts or the sudo-1337 handles the other class.
- Pending subject changes are stored separately from the active class data, so students never see unapproved changes.
- Category and content CRUD do not require approval because they are lower-risk, high-frequency operations that admins need to perform quickly.
- The existing Google Drive integration for file uploads remains unchanged — only the UI wrapper is enhanced.
- "No dropdown menus" applies to primary workflow selection (choosing subjects, categories, classes). Standard form inputs (e.g., text fields with autocomplete) for data entry are acceptable.
