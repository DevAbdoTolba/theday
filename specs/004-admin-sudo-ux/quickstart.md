# Quickstart: Admin & Sudo UX Enhancement

**Feature**: 004-admin-sudo-ux | **Date**: 2026-03-13

## Prerequisites

- Node.js 18+
- MongoDB running locally or connection string
- Firebase project with Google Auth enabled
- Google Drive API service account credentials
- Environment variables configured (see below)

## Environment Variables

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/theday

# Firebase Admin
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=your-client-email
FIREBASE_ADMIN_PRIVATE_KEY="your-private-key"

# Firebase Client (public)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id

# Google Drive Service Account
CLIENT_EMAIL=your-drive-service-email
PRIVATE_KEY="your-drive-private-key"
```

## Running Locally

```bash
npm install
npm run dev
```

- Admin dashboard: http://localhost:3000/admin
- Sudo-1337 panel: http://localhost:3000/sudo-1337

## Key Files for This Feature

### New Files
| File | Purpose |
|------|---------|
| `src/lib/models/subject-change-request.ts` | SubjectChangeRequest Mongoose model |
| `src/pages/api/admin/subjects.ts` | Admin subject change request CRUD |
| `src/pages/api/admin/categories.ts` | Category CRUD (Drive folder ops) |
| `src/pages/api/admin/subjects/check-name.ts` | Subject name uniqueness + sharing check |
| `src/pages/api/sudo/approvals.ts` | Approve/reject pending changes |
| `src/components/admin/SubjectCard.tsx` | Subject display card |
| `src/components/admin/SubjectGrid.tsx` | Grid layout for subject cards |
| `src/components/admin/SubjectForm.tsx` | Inline create/edit subject form |
| `src/components/admin/CategoryTabs.tsx` | Horizontal category tabs |
| `src/components/admin/ContentPanel.tsx` | Content list within category |
| `src/components/admin/PendingBadge.tsx` | Reusable pending/rejected badge |
| `src/components/admin/ApprovalCard.tsx` | Pending change card for sudo-1337 |
| `src/components/admin/ApprovalList.tsx` | List of approvals for sudo-1337 |
| `src/components/admin/ClassCard.tsx` | Class card for sudo-1337 panel |
| `src/components/admin/ClassGrid.tsx` | Grid layout for class cards |
| `src/components/admin/SkeletonGrid.tsx` | Skeleton loader for card grids |
| `src/hooks/useSubjectChanges.ts` | Hook: fetch/mutate subject changes |
| `src/hooks/useApprovals.ts` | Hook: fetch/mutate approvals |

### Modified Files
| File | Change |
|------|--------|
| `src/lib/models/class.ts` | Add `shared` boolean to ISubject |
| `src/pages/admin/index.tsx` | Rewrite: card grid UI |
| `src/pages/sudo-1337/index.tsx` | Rewrite: card UI + approvals |
| `src/utils/types.ts` | Add SubjectChangeRequest types |

## Verification

### Admin Flow
1. Sign in as an admin user (isAdmin: true, assignedClassId set)
2. See assigned class name + subject cards in grid
3. Create a subject → appears with "Pending Approval" badge
4. Edit/cancel the pending subject
5. View categories as tabs, manage content inline

### Sudo-1337 Flow
1. Sign in as super admin (mtolba2004@gmail.com)
2. See "Pending Approvals" section with count badge
3. Approve a subject creation → subject goes live
4. Reject a subject → admin sees "Rejected" badge
5. Manage classes as cards, assign admins
