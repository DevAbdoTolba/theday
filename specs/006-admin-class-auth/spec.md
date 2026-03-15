# Feature Specification: Admin Class-Level Authorization

**Feature Branch**: `006-admin-class-auth`
**Created**: 2026-03-14
**Status**: Draft
**Input**: User description: "Add class-level authorization checks to all admin API endpoints to prevent admins from modifying data in classes they are not assigned to."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Cannot Modify Another Class's Content (Priority: P1)

An admin assigned to Class A attempts to create, read, or delete content items (links, easter eggs) for Class B via the content management endpoints. The system rejects the request and returns an access denied error, protecting Class B's data from unauthorized changes.

**Why this priority**: This is the most direct exploitation path — content endpoints accept a `classId` parameter on GET and POST but never verify it belongs to the requesting admin. An attacker only needs to change the classId value in their request.

**Independent Test**: Can be fully tested by sending a content creation request with a classId that differs from the admin's assignedClassId and confirming the request is rejected with a 403 response.

**Acceptance Scenarios**:

1. **Given** an admin assigned to Class A, **When** they send a GET request to the content endpoint with Class B's classId, **Then** the system returns 403 "Admin not assigned to this class"
2. **Given** an admin assigned to Class A, **When** they send a POST request to the content endpoint with Class B's classId, **Then** the system returns 403 "Admin not assigned to this class"
3. **Given** an admin assigned to Class A, **When** they send a GET or POST request with their own classId, **Then** the request succeeds as normal

---

### User Story 2 - Admin Cannot Upload or Create Links in Another Class's Drive Folders (Priority: P1)

An admin assigned to Class A attempts to upload files, create links, or initiate upload sessions targeting a Google Drive folder that belongs to Class B. The system rejects the request because the admin is not authorized to operate on that class's resources.

**Why this priority**: Drive-based endpoints (link, upload, upload-session) accept a folder identifier without any class ownership verification. An admin who knows (or guesses) another class's folder ID can inject files into that class's Drive structure.

**Independent Test**: Can be fully tested by sending an upload or link creation request with a classId that differs from the admin's assignedClassId, and confirming the request is rejected.

**Acceptance Scenarios**:

1. **Given** an admin assigned to Class A, **When** they send a link creation request with a classId that is not their own, **Then** the system returns 403
2. **Given** an admin assigned to Class A, **When** they send a file upload request with a classId that is not their own, **Then** the system returns 403
3. **Given** an admin assigned to Class A, **When** they send an upload session request with a classId that is not their own, **Then** the system returns 403
4. **Given** an admin with a valid classId, **When** they send any of these requests with their own classId, **Then** the request succeeds as normal

---

### User Story 3 - Admin Cannot Delete Files or Folders From Another Class (Priority: P1)

An admin assigned to Class A attempts to delete a file from Google Drive or delete/rename a category folder that belongs to Class B. The system rejects the request.

**Why this priority**: Destructive operations (file deletion, folder deletion, folder renaming) on another class's resources are the highest-severity vulnerability — data loss is irreversible.

**Independent Test**: Can be fully tested by sending a file deletion or folder modification request with a classId that is not the admin's assignedClassId, and confirming rejection.

**Acceptance Scenarios**:

1. **Given** an admin assigned to Class A, **When** they send a file deletion request with a classId that is not their own, **Then** the system returns 403
2. **Given** an admin assigned to Class A, **When** they send a category rename request with a classId that is not their own, **Then** the system returns 403
3. **Given** an admin assigned to Class A, **When** they send a category deletion request with a classId that is not their own, **Then** the system returns 403

---

### User Story 4 - Admin Cannot Browse Another Class's Drive Folders (Priority: P2)

An admin assigned to Class A attempts to list drive folders for a subject belonging to Class B. The system rejects the request, preventing information disclosure about another class's content structure.

**Why this priority**: While read-only, browsing another class's folder structure leaks information and can be used to discover folder IDs for exploitation via the write endpoints.

**Independent Test**: Can be fully tested by sending a folder listing request with a classId that is not the admin's assignedClassId and confirming rejection.

**Acceptance Scenarios**:

1. **Given** an admin assigned to Class A, **When** they browse drive folders with a classId that is not their own, **Then** the system returns 403
2. **Given** an admin with a valid classId, **When** they browse their own class's drive folders, **Then** the request succeeds

---

### User Story 5 - Super Admin Bypasses Class Restrictions (Priority: P2)

The super admin (system owner) can perform any operation on any class without being blocked by class assignment checks. Super admin access is determined by email, not by the assignedClassId field.

**Why this priority**: The super admin must retain full system access. Authorization checks must not accidentally lock out the super admin from managing all classes.

**Independent Test**: Can be fully tested by having the super admin call any admin endpoint with any classId and confirming all requests succeed regardless of assignedClassId.

**Acceptance Scenarios**:

1. **Given** the super admin, **When** they send any request to an admin endpoint with any classId, **Then** the request succeeds
2. **Given** the super admin has no assignedClassId set, **When** they call admin endpoints, **Then** the requests still succeed

---

### Edge Cases

- What happens when an admin has no `assignedClassId` at all (null/undefined)? The system should reject all class-specific operations with 403.
- What happens when an admin sends a request without a `classId` parameter? The system should return 400 (bad request) as it already does for missing required fields.
- What happens when an admin provides an invalid/non-existent `classId`? The system should still check authorization before performing any lookup — reject with 403 if it doesn't match, then 404 if the class doesn't exist.
- What happens with shared subjects? Content from shared subjects in other classes can still be read (existing shared content GET logic), but admins cannot write to another class's shared subject.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST verify that the requesting admin's assigned class matches the target class on every admin endpoint that operates on class-specific data, before performing any data operation.
- **FR-002**: System MUST require a `classId` parameter on all admin endpoints that currently only accept a folder or file identifier, so that class ownership can be verified.
- **FR-003**: System MUST return a 403 status code with a clear error message when an admin attempts to operate on a class they are not assigned to.
- **FR-004**: System MUST allow the super admin to bypass class assignment checks and operate on any class.
- **FR-005**: System MUST reject requests from admins who have no assigned class (null/undefined assignedClassId) for all class-specific operations.
- **FR-006**: System MUST perform the authorization check before any data mutation or external service call (before calling Google Drive or writing to the database).
- **FR-007**: System MUST maintain existing authorization behavior on endpoints that already correctly check class assignment (subjects GET/POST, categories GET/POST, content DELETE).

### Key Entities

- **Admin User**: An authenticated user with admin privileges and an assigned class linking them to one specific class they can manage.
- **Class**: A group containing semester data and subjects. Each admin is assigned to exactly one class (or none).
- **Super Admin**: A special admin identified by email address who has unrestricted access to all classes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of admin endpoints that operate on class-specific data enforce class assignment verification — no endpoint allows cross-class data access.
- **SC-002**: All unauthorized cross-class requests are rejected before any data is read, written, or deleted — zero data leakage or mutation occurs.
- **SC-003**: Super admin retains full access to all classes across all endpoints with zero access denials.
- **SC-004**: Zero breaking changes to existing authorized admin workflows — admins operating on their assigned class experience no change in behavior.

## Assumptions

- Each admin is assigned to exactly one class. Multi-class assignment is not supported.
- The super admin is identified by a single email address stored in a system constant, consistent with current implementation.
- Drive-based endpoints will require the client to pass a class identifier alongside the folder/file identifier — the frontend already knows which class the admin is working with and can include this parameter.
- The existing authorization pattern (comparing the user's assigned class against the requested class) is the correct model to replicate across all endpoints.
