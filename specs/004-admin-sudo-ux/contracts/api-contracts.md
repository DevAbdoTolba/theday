# API Contracts: Admin & Sudo UX Enhancement

**Feature**: 004-admin-sudo-ux | **Date**: 2026-03-13

All endpoints require `Authorization: Bearer <firebase-id-token>` header.

---

## Admin Endpoints (require `isAdmin: true`)

### `GET /api/admin/subjects?classId={classId}`

Returns active subjects for the admin's assigned class plus their pending change requests.

**Response** `200`:
```typescript
{
  subjects: Array<{
    name: string;
    abbreviation: string;
    shared: boolean;
    semesterIndex: number;
  }>;
  pendingChanges: Array<{
    _id: string;
    changeType: "create" | "edit" | "delete";
    subjectName: string;
    subjectAbbreviation: string;
    shared: boolean;
    semesterIndex: number;
    originalSubjectName?: string;
    originalSubjectAbbreviation?: string;
    status: "pending" | "rejected";
    createdAt: string;
    updatedAt: string;
  }>;
}
```

**Error** `403`: Admin not assigned to this class.

---

### `POST /api/admin/subjects`

Create a new subject change request.

**Request**:
```typescript
{
  classId: string;
  changeType: "create" | "edit" | "delete";
  subjectName: string;
  subjectAbbreviation: string;
  shared?: boolean;              // default: false
  semesterIndex: number;
  originalSubjectName?: string;  // required for edit/delete
}
```

**Response** `201`:
```typescript
{
  _id: string;
  status: "pending";
  // ... full SubjectChangeRequest fields
}
```

**Error** `400`: Validation failure (duplicate name, missing required fields).
**Error** `403`: Admin not assigned to target class.

---

### `PUT /api/admin/subjects?id={changeRequestId}`

Edit an own pending change request.

**Request**:
```typescript
{
  subjectName?: string;
  subjectAbbreviation?: string;
  shared?: boolean;
  semesterIndex?: number;
}
```

**Response** `200`: Updated SubjectChangeRequest.

**Error** `403`: Not the requesting admin, or request is not pending.
**Error** `404`: Change request not found.

---

### `DELETE /api/admin/subjects?id={changeRequestId}`

Cancel an own pending change request.

**Response** `200`: `{ deleted: true }`

**Error** `403`: Not the requesting admin, or request is not pending.
**Error** `404`: Change request not found.

---

### `GET /api/admin/subjects/check-name?classId={classId}&name={name}`

Check if a subject name exists in other classes (for cross-class sharing UX).

**Response** `200`:
```typescript
{
  existsInOtherClasses: boolean;
  matchingClasses: Array<{
    classId: string;
    className: string;
  }>;
}
```

---

### `GET /api/admin/categories?classId={classId}&subject={abbreviation}`

List categories (Drive folders) for a subject. Wraps existing `/api/admin/drive-folders` with consistent interface.

**Response** `200`:
```typescript
{
  categories: Array<{
    name: string;
    folderId: string;
  }>;
}
```

---

### `POST /api/admin/categories`

Create a new category (Drive folder) for a subject.

**Request**:
```typescript
{
  classId: string;
  subjectAbbreviation: string;
  categoryName: string;
}
```

**Response** `201`:
```typescript
{
  name: string;
  folderId: string;
}
```

---

### `PUT /api/admin/categories`

Rename a category (Drive folder).

**Request**:
```typescript
{
  folderId: string;
  newName: string;
}
```

**Response** `200`: `{ name: string; folderId: string; }`

---

### `DELETE /api/admin/categories?folderId={folderId}`

Delete a category (Drive folder) and its contents.

**Response** `200`: `{ deleted: true }`

---

## Sudo-1337 Endpoints (require super admin email)

### `GET /api/sudo/approvals`

List all pending subject change requests across all classes.

**Response** `200`:
```typescript
{
  pending: Array<{
    _id: string;
    classId: string;
    className: string;
    changeType: "create" | "edit" | "delete";
    subjectName: string;
    subjectAbbreviation: string;
    shared: boolean;
    semesterIndex: number;
    originalSubjectName?: string;
    originalSubjectAbbreviation?: string;
    requestedBy: string;
    requestedByName: string;
    requestedByEmail: string;
    createdAt: string;
  }>;
  count: number;
}
```

---

### `POST /api/sudo/approvals`

Approve or reject a pending subject change request.

**Request**:
```typescript
{
  changeRequestId: string;
  action: "approve" | "reject";
}
```

**Response** `200`:

For `approve`:
```typescript
{
  action: "approved";
  changeRequestId: string;
  // For create: subject added to class
  // For edit: subject updated in class
  // For delete: subject + content removed
}
```

For `reject`:
```typescript
{
  action: "rejected";
  changeRequestId: string;
  // Status set to "rejected", admin will see badge
}
```

**Error** `404`: Change request not found or not pending.

---

## Existing Endpoints (unchanged)

- `POST /api/auth/login` — Firebase token verification + user sync
- `GET /api/admin/classes` — List classes
- `GET/POST/DELETE /api/admin/content` — Content item CRUD
- `POST /api/admin/upload-session` — Google Drive upload
- `DELETE /api/admin/drive-file` — Google Drive file deletion
- `GET/POST/PUT/DELETE /api/sudo/classes` — Class CRUD
- `GET/PATCH /api/sudo/users` — User management

---

## Load-Time Impact (Constitution P-IV compliance)

| New Endpoint | Expected Frequency | Latency Target | Cache Strategy |
|-------------|-------------------|----------------|---------------|
| GET /api/admin/subjects | 1x on dashboard load + 30s poll | < 500ms | SWR: stale-while-revalidate, refetch on mutation |
| GET /api/admin/subjects/check-name | Debounced during subject name input | < 300ms | None (real-time check) |
| GET /api/admin/categories | 1x per subject click | < 500ms | SWR: cached by subject (60s TTL), refetch on mutation. Server: Cache-Control 60s + stale-while-revalidate 300s to limit Drive API calls (constitution P-IV) |
| POST/PUT/DELETE /api/admin/subjects | On admin action | < 1s | Triggers refetch |
| GET /api/sudo/approvals | 1x on panel load + 30s poll | < 500ms | SWR: stale-while-revalidate |
| POST /api/sudo/approvals | On sudo-1337 action | < 1s | Triggers refetch |
