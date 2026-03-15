# Quickstart: Direct Upload & Video Content Type

**Feature**: 007-direct-upload-video | **Date**: 2026-03-15

## Prerequisites

1. Node.js and npm installed
2. Google Drive service account credentials configured:
   - `CLIENT_EMAIL` — service account email
   - `PRIVATE_KEY` — service account private key
3. Firebase project configured:
   - `FIREBASE_*` environment variables set
4. MongoDB connection configured
5. New environment variable: `VIDEO_STAGING_FOLDER_ID` — Google Drive folder ID for video staging

## Setup

```bash
# Clone and install
git checkout 007-direct-upload-video
npm install

# Add new env variable to .env.local
echo "VIDEO_STAGING_FOLDER_ID=your-staging-folder-id" >> .env.local

# Run development server
npm run dev
```

## Key Files to Modify

| File | Change Type | Purpose |
|------|-------------|---------|
| `src/utils/upload.ts` | NEW | Direct upload helper with resume + progress |
| `src/components/admin/AddContent.tsx` | MODIFY | Add Video tab, switch to direct upload |
| `src/utils/helpers.ts` | MODIFY | Strip `__` suffix from YouTube display names |
| `src/lib/constants.ts` | MODIFY | Add staging folder ID + size limit constants |
| `src/pages/api/admin/upload.ts` | DEPRECATE | Add deprecation comment |

## Testing

No automated test framework. Manual testing workflow:

1. **Direct upload (File tab)**: Upload a file > 50 MB, verify it appears in Drive and content list
2. **Duplicate detection**: Upload a file with the same name, verify replacement dialog works
3. **YouTube link (Video tab)**: Paste a YouTube URL + title, verify Drive file created with correct name, verify student view shows embed player
4. **Video upload (Video tab)**: Upload a .mp4 file, verify it lands in staging folder with `{title}__{category}__{subject}` name
5. **Size limits**: Test with files > 2 GB (confirm dialog) and > 5 GB (rejection + Drive link)
6. **Resume**: Simulate network interruption during upload, verify auto-retry

## Architecture Overview

```
Admin Browser                    Server (Vercel)              Google Drive
     │                                │                           │
     │ 1. POST /upload-session        │                           │
     │ ─────────────────────────────> │                           │
     │                                │ 2. Create resumable URI   │
     │                                │ ──────────────────────── >│
     │                                │ <──── sessionUri ──────── │
     │ <────── { sessionUri } ─────── │                           │
     │                                │                           │
     │ 3. PUT file bytes directly ──────────────────────────────>│
     │    (progress events)           │                           │
     │ <────── { id, name } ────────────────────────────────────│
     │                                │                           │
     │ 4. Update optimistic cache     │                           │
```

File bytes never touch the Vercel serverless function. Only the session creation request (~1 KB) routes through the server.
