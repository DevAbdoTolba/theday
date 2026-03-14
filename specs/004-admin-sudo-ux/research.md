# Research: Admin & Sudo UX Enhancement

**Feature**: 004-admin-sudo-ux | **Date**: 2026-03-13

## R1: Subject Change Request Storage Model

**Decision**: New `subject_change_requests` MongoDB collection (separate from `classes`).

**Rationale**: Pending changes must be invisible to students who read from the `classes` collection. A separate collection keeps the active data clean, supports querying all pending changes across classes (for sudo-1337 approvals view), and allows independent indexing on status/classId/requestedBy. Embedding pending changes inside the `classes` document would complicate queries and risk exposing unapproved data through existing read paths.

**Alternatives considered**:
- Embedded array in `classes` document: Rejected — complicates student-facing queries, requires filtering pending items on every read, risks data leakage.
- Status field on subjects within `classes.data[].subjects[]`: Rejected — existing code reads this array directly; adding status would require updating every consumer.

## R2: Cross-Class Content Sharing via Shared Subject Names

**Decision**: Add a `shared` boolean flag to `ISubject` in the class model. When an admin creates a subject and opts to reuse a name from another class, the subject is marked `shared: true`. Content queries for shared subjects aggregate across all classes with a matching subject name.

**Rationale**: Minimal schema change (one boolean flag). Content sharing is resolved at query time by matching on subject name + `shared: true`. No data duplication — content stays in its original class/category but is visible to other classes with the same shared subject.

**Alternatives considered**:
- Shared subject reference collection: Rejected — over-engineered for the use case. YAGNI principle.
- Content duplication across classes: Rejected — would create sync issues and storage waste.
- Symbolic link model (reference IDs): Rejected — adds indirection complexity without clear benefit at this scale.

## R3: Rejection Badge Dismissal Mechanism

**Decision**: Store a `dismissedRejections` array in `localStorage` (keyed by admin's firebaseUid). Each entry is the `_id` of a dismissed rejected SubjectChangeRequest. Rejected requests remain in MongoDB with `status: "rejected"` until the admin's next session or explicit dismissal, then the client filters them out. A background cleanup removes rejected requests older than 7 days.

**Rationale**: Avoids adding a `dismissedAt` field to the database for what is purely a UI concern. localStorage is per-browser which aligns with "next session" semantics — clearing storage or using a new browser naturally resets visibility. The 7-day TTL cleanup keeps the collection clean.

**Alternatives considered**:
- Database `dismissedAt` timestamp: Rejected — adds write operations for a UI-only concern.
- Session cookie: Rejected — cookies are sent with every request, wasting bandwidth for client-only state.
- Immediate deletion on rejection: Rejected — spec requires temporary visibility before removal.

## R4: Real-Time Update Mechanism for Approval Status

**Decision**: Polling with SWR-style revalidation. The admin dashboard polls `/api/admin/subjects` every 30 seconds for status changes. The sudo-1337 panel polls `/api/sudo/approvals` on the same interval. Mutations trigger immediate refetch.

**Rationale**: The scale (10-50 admins, 1 sudo-1337) does not justify WebSocket/SSE infrastructure. Polling at 30s is negligible load. SWR-style stale-while-revalidate gives instant UI with background freshness. Aligns with YAGNI principle — upgrade to SSE only if polling proves insufficient.

**Alternatives considered**:
- Server-Sent Events (SSE): Rejected — requires persistent connections, Vercel serverless doesn't support long-lived connections natively.
- WebSocket: Rejected — same Vercel limitation, adds socket server infrastructure complexity.
- No polling (manual refresh): Rejected — poor UX for seeing approval outcomes.

## R5: Admin Pending Change Edit/Cancel UX Pattern

**Decision**: Inline edit on the pending subject card. The pending card shows an "Edit" icon and a "Cancel" icon. Edit opens the same inline form used for creation (pre-populated). Cancel shows a brief confirmation tooltip, then deletes the SubjectChangeRequest.

**Rationale**: Inline editing keeps the admin in context — no modal or page navigation. The form is reused from subject creation (component reusability, constitution P-III). Cancel is a single-click with lightweight confirmation (inline tooltip, not modal — per FR-021).

**Alternatives considered**:
- Modal dialog for editing: Rejected — FR-021 prohibits modal dialogs for routine actions.
- Separate "My Pending Changes" page: Rejected — adds navigation overhead, YAGNI.

## R6: Subject Uniqueness Override UX

**Decision**: When an admin types a subject name that matches an existing subject in another class, the form shows an inline notice: "This subject exists in [Class X]. Create as shared?" with a toggle. If toggled on, the subject is created with `shared: true` and content becomes visible across classes. The uniqueness check is real-time (debounced API call during input).

**Rationale**: Discovery-based UX — the admin doesn't need to know about sharing upfront. The system detects the opportunity and offers it. This keeps the default flow simple (unique subjects) while making sharing opt-in and explicit.

**Alternatives considered**:
- Upfront "shared subject" mode toggle: Rejected — requires admin to know about sharing before they need it.
- Post-creation sharing via sudo-1337: Rejected — adds approval overhead for a low-risk operation.

## R7: Category Storage Model

**Decision**: Categories are stored as Google Drive folder names (existing pattern). No separate MongoDB collection for categories. The admin creates/renames/deletes Drive folders directly via the Google Drive API. Category listing comes from the existing `/api/admin/drive-folders` endpoint.

**Rationale**: This is the existing pattern — categories are Drive folders. Adding a MongoDB mirror would create sync complexity. The Drive API is already integrated with folder CRUD capability via the service account.

**Alternatives considered**:
- New `categories` MongoDB collection: Rejected — duplicates what Drive folders already represent; creates sync issues.
- Hybrid (MongoDB metadata + Drive storage): Rejected — over-engineered at current scale.
