# Data Model: Direct Upload & Video Content Type

**Feature**: 007-direct-upload-video | **Date**: 2026-03-15

## Overview

This feature introduces **no new database models or collections**. All data is stored as Google Drive files using naming conventions as the schema. The key data entities are file naming patterns and configuration constants.

## Entities

### 1. Google Drive File (existing — unchanged)

Files in Google Drive are the primary content storage. This feature does not change the file structure, only how files are created (direct upload vs proxy).

**Attributes**:
- `id`: Google Drive file ID (string, unique)
- `name`: Filename (string — encodes metadata per conventions below)
- `mimeType`: MIME type (string)
- `parents`: Array of parent folder IDs

### 2. YouTube Link File (existing naming convention — unchanged)

A Google Drive file whose name encodes a URL and display title.

**Naming Pattern**: `{youtube-url} {title}`

**Examples**:
- `https://youtu.be/dQw4w9WgXcQ Learn Guitar Basics`
- `https://www.youtube.com/watch?v=abc12345678 Calculus Lecture 5`

**Parsing Rules** (in `parseGoogleFile()`):
- Regex: `/^(https?:\/\/[^\s]+)(.*)$/`
- First capture group = URL, second = display title (trimmed)
- YouTube detection: URL contains `youtube.com` or `youtu.be`
- Video ID extraction: 11-character ID from URL

### 3. Video Staging File (new naming convention)

A Google Drive file uploaded to the staging folder for async YouTube processing by the external Colab pipeline.

**Naming Pattern**: `{title}__{category}__{subject}` (no file extension)

**Examples**:
- `Calculus Lecture 5__Lectures__Mathematics`
- `Lab Demo Week 3__Videos__Physics`

**Parsing Rules** (for Colab pipeline — external, not implemented here):
- Split on `__` delimiter
- First segment = display title
- Second segment = target category folder name
- Third segment = target subject folder name

**Frontend Display Rules** (for `parseGoogleFile()` — after pipeline creates YouTube link):
- If file is YouTube type AND display name (text after URL) contains `__`:
  - Split display name on `__`
  - Show only the first segment as the visible title
- Non-YouTube files are unaffected

### 4. Upload Session (transient — not persisted)

A resumable upload session URI returned by Google Drive API. Not stored in any database.

**Attributes**:
- `sessionUri`: Full Google-issued URL for resumable upload (string)
- Lifetime: ~1 week of inactivity (Google default)
- Scope: Single file upload to a specific folder
- Auth: Pre-authorized via service account token at creation time

### 5. Configuration Constants (new)

| Constant | Source | Description |
|----------|--------|-------------|
| `VIDEO_STAGING_FOLDER_ID` | Environment variable | Google Drive folder ID for video staging |
| `UPLOAD_SOFT_LIMIT` | Code constant | 2 GB (2 * 1024 * 1024 * 1024) |
| `UPLOAD_HARD_LIMIT` | Code constant | 5 GB (5 * 1024 * 1024 * 1024) |
| `UPLOAD_MAX_RETRIES` | Code constant | 3 |

## State Transitions

### File Upload Lifecycle

```
[idle] → [session_creating] → [uploading] → [complete]
                                    ↓
                              [retry_1..3] → [failed]
```

- `idle`: No upload in progress
- `session_creating`: POST to `/api/admin/upload-session` in progress
- `uploading`: PUT to resumable session URI in progress (progress bar active)
- `retry_N`: Upload failed, auto-resuming from last byte (up to 3 attempts)
- `complete`: File successfully created in Drive; optimistic UI updated
- `failed`: All retries exhausted; error message shown

### Video Staging File Lifecycle (external — for reference only)

```
[uploaded_to_staging] → [pipeline_processing] → [youtube_uploaded] → [link_file_created] → [staging_file_deleted]
```

This lifecycle is managed entirely by the external Colab pipeline. This feature only handles the first state (`uploaded_to_staging`).

## Relationships

```
Subject Folder (Drive)
  └── Category Folder (Drive)
       ├── Regular File (uploaded via direct upload)
       ├── YouTube Link File ({url} {title})
       └── Other files...

Video Staging Folder (Drive) — separate hierarchy
  ├── {title}__{category}__{subject}  (awaiting pipeline)
  └── ...
```

No foreign keys or database relationships. All relationships are implicit via Google Drive folder hierarchy.
