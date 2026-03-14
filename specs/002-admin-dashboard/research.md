# Research: Admin Content Dashboard

**Branch**: `002-admin-dashboard` | **Date**: 2026-03-12

## R1: Direct Client-to-Drive Resumable Upload

**Decision**: Use Google Drive API v3 resumable upload protocol with a two-phase architecture: (1) API route creates session, (2) browser uploads directly to session URI.

**Rationale**: Vercel serverless functions have a 4.5 MB request body limit and 10s default / 60s max execution timeout. Direct-to-Drive uploads bypass both constraints entirely. The API route only needs to authenticate and obtain a session URI (~1 KB response, <2s execution).

**How it works**:

1. **Session creation** (API route on Vercel):
   - Service account authenticates with `https://www.googleapis.com/auth/drive` scope
   - POST to `https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable` with file metadata (name, mimeType, parent folder ID)
   - Returns a `Location` header containing the resumable session URI
   - API route returns this URI to the frontend

2. **Direct upload** (browser client):
   - Client PUTs file bytes directly to the session URI
   - Session URI is pre-authorized — no additional auth headers needed from the client
   - Supports chunked uploads and progress tracking via `Content-Range` headers
   - CORS is handled by Google — session URIs accept cross-origin requests

3. **Scope change**: Existing `google-auth.js` uses `drive.readonly`. Upload routes need a separate auth client with `drive` or `drive.file` scope. Keep read-only client for existing read routes.

**Alternatives considered**:
- **Proxy through Vercel**: Rejected — hits 4.5 MB body limit and 10s timeout
- **Firebase Storage + Cloud Function**: Rejected — adds infrastructure complexity, user explicitly chose Google Drive
- **Simple (non-resumable) upload**: Rejected — no progress tracking, fails on large files, no retry capability

## R2: Firebase Authentication with Google Sign-In

**Decision**: Add `firebase` (client SDK) and `firebase-admin` (server SDK). Use `GoogleAuthProvider` with `signInWithPopup` for sign-in. Verify ID tokens server-side in API routes.

**Rationale**: Firebase Auth is the specified auth provider. Google sign-in is the sole method (per clarification). The admin SDK provides secure token verification in API routes without exposing secrets client-side.

**Implementation pattern**:

1. **Client**: `firebase/auth` → `signInWithPopup(auth, googleProvider)` → get ID token via `user.getIdToken()`
2. **API routes**: Extract `Authorization: Bearer <token>` → `admin.auth().verifyIdToken(token)` → lookup user in MongoDB → check admin flag
3. **Environment variables**: `NEXT_PUBLIC_FIREBASE_*` for client config, `FIREBASE_ADMIN_*` for server (service account JSON or individual fields)

**Alternatives considered**:
- **NextAuth.js**: Rejected — adds another abstraction layer; Firebase is specified
- **Firebase Auth + Firestore for user data**: Rejected — user data already in MongoDB; no reason to split

## R3: User Data Storage in MongoDB

**Decision**: Create a new `users` collection in MongoDB for admin flag management. The super admin email is hardcoded.

**Rationale**: MongoDB is already used for class data (transcript/classes collection). Adding a users collection keeps all server data in one place. Mongoose models should follow the existing inline pattern used in API routes, but extracted to a shared models directory for reuse across admin routes.

**Schema decisions**:
- `firebaseUid` as the primary identifier (from Firebase Auth)
- `email` indexed for super admin lookup
- `isAdmin` boolean flag (default: false)
- Auto-create user record on first sign-in (upsert pattern)

**Alternatives considered**:
- **Firebase custom claims for admin flag**: Rejected — requires Admin SDK call to set claims, adds latency, and claims only update on token refresh. MongoDB flag is immediately queryable.
- **Firestore for user data**: Rejected — adds another database; MongoDB already exists

## R4: Content Items for Links and Easter Eggs

**Decision**: Store links and easter eggs in a new `content_items` MongoDB collection. Files remain in Google Drive (source of truth for file content).

**Rationale**: Google Drive already serves as the file storage and the existing UI reads directly from Drive. Uploaded files go into the correct Drive folder and appear automatically. Links and easter eggs have no Drive equivalent, so they need MongoDB storage.

**Hybrid content model**:
- **Files**: Uploaded to Google Drive via resumable upload → appear in existing Drive-based UI
- **Links**: Stored in MongoDB with classId, category, title, url
- **Easter Eggs**: Stored in MongoDB with classId, category, name, triggerDescription, payload

**Alternatives considered**:
- **All content in MongoDB (files as metadata only)**: Rejected — breaks existing Drive-based file browsing
- **All content in Drive (links as .url files)**: Rejected — hacky, doesn't support easter eggs

## R5: Existing Codebase Patterns

**Decision**: Follow existing project patterns for consistency.

**Key patterns observed**:
- **Pages Router** (not App Router) — all new pages go in `src/pages/`
- **API routes** in `src/pages/api/` — handler function pattern
- **Mongoose models** defined inline in API routes (existing pattern, but we'll extract to shared models for admin routes that reuse them)
- **MUI v6** with `sx` prop styling, Emotion, `createTheme` with light/dark mode
- **Components** in `src/components/` with TypeScript
- **Context providers** in `src/context/`
- **Hooks** in `src/hooks/`
- **Google Auth** service account credentials from env vars (`CLIENT_EMAIL`, `PRIVATE_KEY`)
- **No existing test framework** — tests not required for this feature per current project state

## R6: New Dependencies

**Decision**: Add two new npm packages.

| Package | Purpose | Justification |
|---------|---------|---------------|
| `firebase` | Client-side auth (Google sign-in) | Required by spec — Firebase Auth |
| `firebase-admin` | Server-side token verification | Required for secure API route protection |

No other new dependencies needed. `googleapis` (already installed) handles Drive uploads.
