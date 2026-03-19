# Feature Specification: Admin Content Dashboard

**Feature Branch**: `002-admin-dashboard`
**Created**: 2026-03-12
**Status**: Draft
**Input**: User description: "We need an admin dashboard to upload content for each class. Only open access to those who are flagged as admin which only me email: mtolba2004@gmail.com can see this super admin page (call it sudo-1337). Auth made by Firebase."

## User Scenarios & Testing

### User Story 1 - Super Admin Manages Admin Access (Priority: P1)

As the super admin (mtolba2004@gmail.com), I want to access a dedicated "sudo-1337" page where I can flag or unflag users as admins and manage classes (create, edit, delete), so that I control both who can upload content and what classes exist.

**Why this priority**: Without admin management, no other users can be granted access to the content dashboard. This is the foundation of the entire access control system.

**Independent Test**: Can be fully tested by logging in as mtolba2004@gmail.com, navigating to sudo-1337, and granting/revoking admin privileges. Delivers value by establishing the access control hierarchy.

**Acceptance Scenarios**:

1. **Given** I am logged in as mtolba2004@gmail.com, **When** I navigate to the sudo-1337 page, **Then** I see a list of registered users and can toggle their admin status, and I see a class management section.
2. **Given** I am logged in as any other user, **When** I attempt to navigate to the sudo-1337 page, **Then** I am denied access and redirected away.
3. **Given** I am on the sudo-1337 page, **When** I flag a user as admin, **Then** that user can immediately access the admin content dashboard on their next page load.
4. **Given** I am on the sudo-1337 page, **When** I remove admin status from a user, **Then** that user loses access to the admin content dashboard immediately.
5. **Given** I am on the sudo-1337 page, **When** I create, edit, or delete a class, **Then** the change is reflected in MongoDB and visible to all admins on the content dashboard.

---

### User Story 2 - Admin Uploads Content for a Class (Priority: P1)

As an admin user, I want to upload content organized by class — including files of any type, URLs/links to external resources, and easter eggs (hidden content discoverable through code logic) — so that students and teachers have access to the materials they need.

**Why this priority**: Content uploading is the core purpose of the admin dashboard. Without it, the dashboard provides no value.

**Independent Test**: Can be fully tested by logging in as a flagged admin, selecting a class, uploading a file, and verifying it appears in that class's content listing.

**Acceptance Scenarios**:

1. **Given** I am a flagged admin, **When** I log in and navigate to the admin dashboard, **Then** I see a list of classes I can manage content for.
2. **Given** I am on a class's content page, **When** I upload a file, **Then** the file is stored and associated with that class.
3. **Given** I have uploaded content to a class, **When** I view the class content list, **Then** I see the uploaded file with its name, upload date, and file size.
4. **Given** I am a flagged admin, **When** I upload a file that exceeds the maximum allowed size, **Then** I receive a clear error message indicating the size limit.

---

### User Story 3 - Admin Manages Existing Content (Priority: P2)

As an admin user, I want to view, delete, and replace content that has been uploaded to a class, so that I can keep materials current and accurate.

**Why this priority**: After uploading, admins need the ability to maintain and curate content. This is essential for ongoing operations but secondary to initial upload capability.

**Independent Test**: Can be fully tested by navigating to a class with existing content, deleting a file, and uploading a replacement.

**Acceptance Scenarios**:

1. **Given** I am viewing a class's content list, **When** I delete a content item, **Then** the item is removed from the class and no longer accessible.
2. **Given** I am viewing a class's content list, **When** I upload a new version of an existing file, **Then** the old version is replaced.
3. **Given** I delete content, **When** I confirm the deletion, **Then** the system asks for confirmation before permanently removing the file.

---

### User Story 4 - Non-Admin User Denied Access (Priority: P1)

As a regular (non-admin) user, I should not be able to access the admin dashboard or the sudo-1337 page, so that content management remains controlled and secure.

**Why this priority**: Security enforcement is critical from day one. Without proper access control, the entire feature is compromised.

**Independent Test**: Can be fully tested by logging in as a non-admin user and attempting to access admin routes directly via URL.

**Acceptance Scenarios**:

1. **Given** I am a logged-in user without admin flag, **When** I attempt to navigate to the admin dashboard URL, **Then** I am denied access and shown an appropriate message.
2. **Given** I am not logged in, **When** I attempt to access the admin dashboard or sudo-1337, **Then** I am redirected to the login page.
3. **Given** I am a flagged admin but not mtolba2004@gmail.com, **When** I attempt to access the sudo-1337 page, **Then** I am denied access.

---

### Edge Cases

- What happens when the super admin (mtolba2004@gmail.com) tries to remove their own admin flag? The system prevents self-demotion of the super admin account.
- How does the system handle uploading a file with the same name as an existing file in the same class? The system prompts the admin to confirm replacement or rename.
- What happens if an admin's status is revoked while they are in the middle of uploading content? The upload fails gracefully with an access denied message upon submission.
- What happens when a class has no content uploaded yet? The admin sees an empty state with a clear call-to-action to upload the first file.
- What if the super admin email is not yet registered in the system? The sudo-1337 page is only accessible after mtolba2004@gmail.com has created an account and authenticated via Firebase.

## Requirements

### Functional Requirements

- **FR-001**: System MUST authenticate all users via Firebase Authentication using Google sign-in as the sole sign-in method.
- **FR-002**: System MUST maintain an admin flag on each user record that determines access to the admin content dashboard.
- **FR-003**: System MUST restrict the sudo-1337 page exclusively to the user authenticated with email mtolba2004@gmail.com.
- **FR-004**: The sudo-1337 page MUST allow the super admin to view all registered users and toggle their admin status.
- **FR-005**: System MUST prevent the super admin from removing their own super admin privileges.
- **FR-006**: Admin users MUST be able to view all available classes (sourced from MongoDB) on the admin dashboard, with content organized using the existing category-based structure already present in the codebase.
- **FR-014**: The sudo-1337 page MUST allow the super admin to create, edit, and delete classes in addition to managing admin access.
- **FR-007**: Admin users MUST be able to upload content to a specific class. Content types include: files (any format, unrestricted), URLs/links to external resources, and easter eggs (hidden content/features discoverable through code logic).
- **FR-008**: Admin users MUST be able to view all content uploaded to a class, displaying appropriate metadata per content type: file name/size/upload date for files, URL and title for links, and name/trigger description for easter eggs.
- **FR-009**: Admin users MUST be able to delete content from a class, with a confirmation step before deletion.
- **FR-010**: System MUST enforce a maximum file upload size of 50 MB per file (no restriction on file format).
- **FR-011**: System MUST deny access to admin routes for any user not flagged as admin, returning them to a non-admin view or login screen.
- **FR-012**: System MUST deny access to sudo-1337 for any user who is not mtolba2004@gmail.com, including other admin users.
- **FR-013**: System MUST handle concurrent admin sessions without data conflicts when multiple admins upload to the same class simultaneously.

### Key Entities

- **User**: A person who authenticates via Firebase. Has an email, display name, and an admin flag (boolean). One special user (mtolba2004@gmail.com) has super admin privileges.
- **Class**: An organizational unit representing a course or subject. Has a name and serves as the grouping container for content.
- **Content Item**: A piece of content uploaded by an admin to a specific class. Can be one of three types: (1) **File** — any file format, with file name, file size, and upload date; (2) **Link** — a URL to an external resource, with a title and URL; (3) **Easter Egg** — hidden content or feature discoverable through code logic, with a name, trigger description, and payload. All content items reference the uploading admin and target class.

## Success Criteria

### Measurable Outcomes

- **SC-001**: The super admin can grant admin access to a new user within 30 seconds of navigating to sudo-1337.
- **SC-002**: An admin can upload a content file to a class in under 1 minute (excluding file transfer time for large files).
- **SC-003**: Non-admin users are blocked from accessing admin pages 100% of the time, with no bypass possible via direct URL navigation.
- **SC-004**: The system supports at least 20 concurrent admin users uploading content without errors or data loss.
- **SC-005**: Admins can find and manage content for any class within 3 clicks from the dashboard landing page.
- **SC-006**: 95% of admin users can complete their first content upload without external help or documentation.

## Clarifications

### Session 2026-03-12

- Q: What types of content can admins upload to a class? → A: Any file type (unrestricted), URLs/links to external resources, and easter eggs (hidden content/features discoverable through code logic).
- Q: How should content be organized within a class? → A: Organization logic already exists in the codebase (category-based, closest to admin-defined groups). The admin upload flow must integrate with the existing organization structure rather than introduce a new one.
- Q: How should admins sign in via Firebase? → A: Google sign-in only.
- Q: Where do classes come from? → A: Classes already exist in MongoDB. The super admin can also create/edit/delete classes from the sudo-1337 page.

## Assumptions

- Firebase Authentication is already configured or will be set up as part of this feature's implementation.
- The list of classes and category-based content organization logic already exist in the codebase (stored in MongoDB). The admin dashboard reads from and writes to this existing structure. The super admin can manage classes (create/edit/delete) from sudo-1337.
- The maximum file upload size of 50 MB is a reasonable default. No file format restrictions — admins can upload any file type.
- Content uploaded is stored in a cloud storage service integrated with Firebase (e.g., Firebase Storage or similar).
- The super admin email (mtolba2004@gmail.com) is hardcoded as the sole super admin. There is no mechanism to add additional super admins.

## Out of Scope

- Class management by regular admins (only super admin can manage classes via sudo-1337).
- Student/teacher-facing content viewing interface.
- Content versioning or revision history.
- Bulk upload of multiple files at once (single file upload per action).
- Notification system for content updates.
- Content search or filtering beyond browsing by class.
