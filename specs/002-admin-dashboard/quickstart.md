# Quickstart: Admin Content Dashboard

**Branch**: `002-admin-dashboard` | **Date**: 2026-03-12

## Prerequisites

- Node.js 18+
- MongoDB instance (existing — `MONGODB_URI` env var)
- Google Cloud Service Account with Drive API access (existing — `CLIENT_EMAIL`, `PRIVATE_KEY` env vars)
- Firebase project with Google sign-in provider enabled

## New Environment Variables

Add these to `.env.local` (and Vercel environment settings):

```bash
# Firebase Client SDK (public — prefixed with NEXT_PUBLIC_)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...

# Firebase Admin SDK (server-only — NOT prefixed)
FIREBASE_ADMIN_PROJECT_ID=...
FIREBASE_ADMIN_CLIENT_EMAIL=...
FIREBASE_ADMIN_PRIVATE_KEY=...
```

**Note**: The Google Service Account for Drive uploads may be the same as the existing one (`CLIENT_EMAIL`, `PRIVATE_KEY`), but its scope needs to include `https://www.googleapis.com/auth/drive` (currently only `drive.readonly`). The existing read-only auth client stays unchanged; a new write-capable client is created for upload routes only.

## New Dependencies

```bash
npm install firebase firebase-admin
```

## Key Architecture Decision

**File uploads do NOT pass through Vercel**. The flow is:

1. Client calls `/api/admin/upload-session` with file metadata (name, type, folder)
2. API route authenticates with Google Service Account → returns a resumable session URI
3. Client uploads file bytes directly to the session URI (Google Drive)
4. Vercel only handles the ~1 KB metadata request, bypassing its 4.5 MB body limit

## New Files Overview

```
src/
├── lib/
│   ├── firebase-client.ts       # Firebase client SDK init
│   ├── firebase-admin.ts        # Firebase Admin SDK init
│   ├── google-auth-write.ts     # Google Auth with drive write scope
│   └── auth-middleware.ts       # verifyAuth, requireAdmin, requireSuperAdmin
├── pages/
│   ├── admin/
│   │   └── index.tsx            # Admin content dashboard
│   ├── sudo-1337/
│   │   └── index.tsx            # Super admin page
│   └── api/
│       ├── auth/
│       │   └── login.ts         # Token verify + user upsert
│       ├── admin/
│       │   ├── upload-session.ts # Generate resumable upload URI
│       │   ├── content.ts       # CRUD links/easter eggs
│       │   ├── drive-file.ts    # Delete Drive files
│       │   └── drive-folders.ts # List category folders
│       └── sudo/
│           ├── users.ts         # User admin management
│           └── classes.ts       # Class CRUD
├── context/
│   └── AuthContext.tsx          # Firebase auth state provider
├── hooks/
│   └── useAuth.ts              # Auth hook (sign in, sign out, token)
└── components/
    └── admin/
        ├── AdminGuard.tsx       # Route protection wrapper
        ├── SuperAdminGuard.tsx  # sudo-1337 protection wrapper
        ├── ContentUploader.tsx  # File upload with progress
        ├── LinkForm.tsx         # Add/edit link form
        ├── EasterEggForm.tsx    # Add/edit easter egg form
        ├── ContentList.tsx      # Combined content display
        ├── UserManagement.tsx   # Admin flag toggling
        └── ClassManagement.tsx  # Class CRUD UI
```

## Development Flow

```bash
# Start development
npm run dev

# Visit admin dashboard (requires Google sign-in + admin flag)
open http://localhost:3000/admin

# Visit super admin page (requires mtolba2004@gmail.com)
open http://localhost:3000/sudo-1337
```

## Testing Manually

1. Sign in with `mtolba2004@gmail.com` via Google
2. Navigate to `/sudo-1337` — you should see user management + class management
3. Grant admin access to another test account
4. Sign in as that account → navigate to `/admin`
5. Select a class → select a category → upload a file
6. Verify the file appears in Google Drive and in the student-facing view
