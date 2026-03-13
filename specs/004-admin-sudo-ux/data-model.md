# Data Model: Admin & Sudo UX Enhancement

**Feature**: 004-admin-sudo-ux | **Date**: 2026-03-13

## New Collection: `subject_change_requests`

### SubjectChangeRequest

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `_id` | ObjectId | auto | auto | MongoDB auto-generated |
| `classId` | ObjectId (ref: classes) | yes | — | Target class for the change |
| `changeType` | String enum | yes | — | `"create"` \| `"edit"` \| `"delete"` |
| `subjectName` | String | yes | — | Proposed subject name |
| `subjectAbbreviation` | String | yes | — | Proposed subject abbreviation |
| `shared` | Boolean | no | false | Whether this subject opts into cross-class content sharing |
| `semesterIndex` | Number | yes | — | Which semester (data[].index) the subject belongs to |
| `originalSubjectName` | String | no | — | For `edit`/`delete`: the current subject name being changed |
| `originalSubjectAbbreviation` | String | no | — | For `edit`: the current abbreviation |
| `status` | String enum | yes | `"pending"` | `"pending"` \| `"approved"` \| `"rejected"` |
| `requestedBy` | String | yes | — | Firebase UID of the requesting admin |
| `reviewedBy` | String | no | — | Firebase UID of the sudo-1337 who acted |
| `reviewedAt` | Date | no | — | When the sudo-1337 acted |
| `createdAt` | Date | auto | now | Timestamp |
| `updatedAt` | Date | auto | now | Timestamp |

### Indexes

```text
{ classId: 1, status: 1 }         — Admin dashboard: pending changes for a class
{ status: 1, createdAt: -1 }      — Sudo-1337 panel: all pending, newest first
{ requestedBy: 1, status: 1 }     — Admin: my pending changes
```

### State Transitions

```text
                  ┌─── admin edits ───┐
                  │                    │
  [create] ──► PENDING ──► APPROVED ──► (applied to classes collection, request deleted)
                  │
                  ├──► REJECTED ──► (visible to admin until dismissed, TTL 7 days)
                  │
                  └──► CANCELLED ──► (deleted immediately by admin)
```

- **PENDING → APPROVED**: Sudo-1337 approves. For `create`: subject added to `classes.data[].subjects[]`. For `edit`: subject updated in place. For `delete`: subject + categories + content removed.
- **PENDING → REJECTED**: Sudo-1337 rejects. Status set to `rejected`. Admin sees temporary badge. Cleaned up after 7 days or admin dismissal.
- **PENDING → CANCELLED**: Admin cancels own request. Document deleted from collection.
- **PENDING → PENDING (edited)**: Admin edits own pending request. Fields updated in place.

### Validation Rules

- `changeType: "create"`: `subjectName` must be unique within the target class (unless `shared: true` and name exists in another class).
- `changeType: "edit"`: `originalSubjectName` must exist in the target class. `subjectName` (new name) must be unique within the class.
- `changeType: "delete"`: `originalSubjectName` must exist as an active subject in the target class.
- Only the `requestedBy` admin can edit/cancel a pending request.
- Only sudo-1337 can approve/reject.

---

## Modified Collection: `classes`

### Updated ISubject Interface

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `name` | String | yes | — | Subject display name |
| `abbreviation` | String | yes | — | Subject abbreviation code |
| `shared` | Boolean | no | false | **NEW**: Whether content is shared with other classes having the same subject name |

### Schema Change

```typescript
// Before
subjects: [{ name: String, abbreviation: String }]

// After
subjects: [{ name: String, abbreviation: String, shared: { type: Boolean, default: false } }]
```

### Cross-Class Content Sharing Query

When `shared: true`, content queries expand to:
1. Find all classes with a subject where `name` matches AND `shared: true`
2. Aggregate content items and Drive files across those classes for the matching subject/category
3. Content is read-only for non-owning classes (each admin manages their own class's content)

---

## Unchanged Collections

### `users`
No schema changes. Existing fields sufficient:
- `isAdmin` + `assignedClassId` drives admin dashboard behavior
- Super admin identified by email check in middleware

### `content_items`
No schema changes. Content items are already scoped by `classId` + `category`. Cross-class sharing is resolved at query time by finding matching classIds.

---

## Entity Relationship Diagram

```text
User (users)
  │
  ├──[1:1]── Class (classes)              via user.assignedClassId = class._id
  │             │
  │             └── data[].subjects[]      ISubject { name, abbreviation, shared }
  │                    │
  │                    └──[1:N]── ContentItem (content_items)  via classId + category
  │                    └──[1:N]── Google Drive files            via abbreviation → folder
  │
  └──[1:N]── SubjectChangeRequest (subject_change_requests)
                via requestedBy = user.firebaseUid
                references classId, subjectName, semesterIndex
```
