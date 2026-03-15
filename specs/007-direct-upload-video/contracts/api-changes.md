# API Contract Changes: Direct Upload & Video Content Type

**Feature**: 007-direct-upload-video | **Date**: 2026-03-15

## Summary of Changes

| Endpoint | Change | Description |
|----------|--------|-------------|
| `POST /api/admin/upload-session` | No change | Already provides resumable session URI; client-side usage changes |
| `POST /api/admin/link` | No change | Reused for YouTube link file creation from Video tab |
| `POST /api/admin/upload` | Deprecated | No longer called by AddContent; kept for backward compatibility |
| Browser → Google Drive | New (client-side) | Direct PUT to resumable session URI |

## Endpoint Details

### POST /api/admin/upload-session (unchanged)

Creates a resumable upload session URI for direct browser-to-Drive upload.

**Request**:
```json
{
  "fileName": "document.pdf",
  "mimeType": "application/pdf",
  "folderId": "drive-folder-id",
  "classId": "class-id"
}
```

**Response** (200):
```json
{
  "sessionUri": "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&upload_id=..."
}
```

**Auth**: Bearer token (Firebase ID token) + `requireAdminForClass(classId)`

**Usage change**: Previously used only experimentally. Now the primary upload path for all file uploads from AddContent.

### POST /api/admin/link (unchanged)

Creates a file in Google Drive with `{url} {title}` naming convention.

**Request**:
```json
{
  "url": "https://youtu.be/dQw4w9WgXcQ",
  "title": "Learn Guitar Basics",
  "folderId": "category-folder-id",
  "classId": "class-id"
}
```

**Response** (201):
```json
{
  "id": "drive-file-id",
  "name": "https://youtu.be/dQw4w9WgXcQ Learn Guitar Basics"
}
```

**Auth**: Bearer token + `requireAdminForClass(classId)`

**Usage change**: Now also called from the Video tab's YouTube Link sub-option. No endpoint changes needed.

### POST /api/admin/upload (deprecated)

**Status**: Deprecated — no longer called by AddContent component.

The endpoint remains functional but is superseded by the direct upload flow (`upload-session` + browser PUT). Will be removed in a future cleanup PR.

## Client-Side Upload Protocol

### Direct Upload to Google Drive Resumable URI

After obtaining `sessionUri` from `/api/admin/upload-session`, the browser uploads directly to Google Drive.

**Request**:
```
PUT {sessionUri}
Content-Type: {mimeType}
Content-Length: {fileSize}
Content-Range: bytes 0-{fileSize-1}/{fileSize}

[file bytes]
```

**Response** (200):
```json
{
  "id": "created-drive-file-id",
  "name": "uploaded-filename"
}
```

**Progress**: Tracked via `XMLHttpRequest.upload.onprogress` event.

### Resume After Failure

**Step 1 — Query upload status**:
```
PUT {sessionUri}
Content-Length: 0
Content-Range: bytes */{totalSize}
```

**Response** (308 Resume Incomplete):
```
Range: bytes=0-{lastByteReceived}
```

**Step 2 — Resume upload**:
```
PUT {sessionUri}
Content-Range: bytes {lastByteReceived+1}-{totalSize-1}/{totalSize}

[remaining file bytes]
```

**Response** (200): Same as successful upload.

**Error cases**:
- 404: Session expired — create new session and restart (counts as retry)
- 5xx: Transient error — retry from last byte
- Max 3 retry attempts before showing error to admin

## Video Tab Interactions

### YouTube Link Flow

```
1. Admin selects Video tab → YouTube Link sub-option
2. Admin enters YouTube URL + display title
3. Client validates URL (11-char video ID extraction)
4. Client calls POST /api/admin/link with { url, title, folderId, classId }
5. Server creates Drive file: "{url} {title}"
6. Client receives { id, name }
7. Client updates optimistic cache
```

### Video File Upload Flow

```
1. Admin selects Video tab → Upload Video File sub-option
2. Admin selects/drags video file + enters display title
3. Client validates: video MIME type + size limits (2GB soft / 5GB hard)
4. Client calls POST /api/admin/upload-session with:
   - fileName: "{title}__{category}__{subject}" (no extension)
   - mimeType: original video MIME type
   - folderId: VIDEO_STAGING_FOLDER_ID (from constants)
   - classId: current class ID
5. Client receives { sessionUri }
6. Client PUTs file bytes directly to sessionUri (with progress + auto-retry)
7. Client updates optimistic cache
8. Client shows info: "Video will be processed within 24 hours"
```

### File Size Validation

```
if (file.size > 5GB):
  REJECT — show error + link to Drive folder
  Link: https://drive.google.com/drive/folders/{folderId}

if (file.size > 2GB):
  CONFIRM — show dialog: "This file is over 2 GB. Upload may take a while. Continue?"
  if (confirmed): proceed
  if (cancelled): abort

else:
  proceed normally
```
