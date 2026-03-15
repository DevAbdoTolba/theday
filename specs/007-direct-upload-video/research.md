# Research: Direct Upload & Video Content Type

**Feature**: 007-direct-upload-video | **Date**: 2026-03-15

## R1: Direct-to-Drive Upload via Resumable Session URI

**Decision**: Use the existing `/api/admin/upload-session` endpoint to create a resumable upload session, then upload directly from the browser to the Google Drive resumable URI using `XMLHttpRequest` (for progress tracking).

**Rationale**:
- The upload-session endpoint already exists and handles auth + CORS. It returns a `sessionUri` that the browser can PUT to directly.
- Google Drive's resumable upload protocol allows: (a) direct browser-to-Drive transfers, (b) progress tracking via `xhr.upload.onprogress`, (c) resume from last byte on failure.
- The resumable session URI includes CORS headers set by Google, so cross-origin requests from the browser work without additional server-side CORS configuration.
- `XMLHttpRequest` is chosen over `fetch()` because `fetch()` does not support upload progress events. The existing AddContent component already uses XHR for uploads.

**Alternatives considered**:
- `fetch()` with `ReadableStream`: No upload progress support in any browser.
- Chunked upload through server proxy: Defeats the purpose of eliminating Vercel bandwidth.
- `tus` protocol library: Adds a dependency; Google Drive's native resumable protocol is sufficient.

## R2: Upload Resume on Failure

**Decision**: On upload failure, query Google Drive for bytes received so far, then resume from that offset. Retry up to 3 times before showing error.

**Rationale**:
- Google Drive resumable uploads support querying upload status via `PUT` with `Content-Range: bytes */{totalSize}` — the response indicates how many bytes were received.
- After determining the resume offset, the client sends the remaining bytes with the correct `Content-Range` header.
- If the session URI itself is expired (HTTP 404), create a new session and restart from scratch (counts as a retry attempt).
- 3 retries balances resilience with avoiding infinite loops on persistent failures.

**Alternatives considered**:
- No retry (manual only): Poor UX for large files that take minutes.
- Infinite retries: Risk of hanging indefinitely on persistent server errors.

## R3: YouTube Link File Creation

**Decision**: Reuse the existing `/api/admin/link` endpoint for creating YouTube link files. It already creates Drive files named `{url} {title}` which is the exact convention the student-facing parser expects.

**Rationale**:
- The link endpoint handles auth, creates the file in the correct folder, and returns `{ id, name }`.
- No new API endpoint needed. The Video tab's YouTube Link option simply calls the same endpoint with the YouTube URL and title.
- YouTube URL validation (11-char video ID extraction) is performed client-side before calling the endpoint.

**Alternatives considered**:
- New dedicated `/api/admin/youtube-link` endpoint: Unnecessary duplication of `/api/admin/link`.
- Client-side Drive API call: Would require exposing service account credentials to the browser.

## R4: Video Tab UI Structure

**Decision**: Add a third tab ("Video") to the existing File/Link toggle in AddContent. Within the Video tab, use a radio group or toggle to switch between "YouTube Link" and "Upload Video File" sub-options.

**Rationale**:
- The existing AddContent component uses a simple `mode` state variable (`"file"` | `"link"`). Extending this to `"video-youtube"` | `"video-upload"` is the minimal change.
- MUI `ToggleButtonGroup` (already used for File/Link) can accommodate a third button. Sub-options within the Video view use a simple radio or secondary toggle.
- Video tab follows the same visual patterns as File and Link tabs for consistency (Constitution Principle III).

**Alternatives considered**:
- Separate VideoContent component: Violates component reusability; duplicates shared logic (auth, cache, error handling).
- Modal-based video picker: Over-engineered for two simple sub-options.

## R5: Video Staging Folder Configuration

**Decision**: Store the staging folder ID as an environment variable (`VIDEO_STAGING_FOLDER_ID`) and reference it via a constant in `src/lib/constants.ts`.

**Rationale**:
- Follows the existing pattern for Google Drive folder configuration in the project.
- Environment variable allows different staging folders per deployment environment (dev/prod).
- The folder must be pre-created in Google Drive with write access for the service account.

**Alternatives considered**:
- Hardcoded folder ID: Not environment-portable.
- Database-stored configuration: Over-engineered for a single constant.

## R6: File Size Limit Implementation

**Decision**: Check file size client-side before initiating upload. Two thresholds: 2 GB soft (confirmation dialog) and 5 GB hard (reject with manual upload instructions + Drive folder link).

**Rationale**:
- Client-side check is instantaneous — no wasted bandwidth on oversized files.
- The Drive folder link is constructed from the `folderId` prop: `https://drive.google.com/drive/folders/{folderId}`.
- 2 GB covers virtually all lecture recordings and documents; 5 GB is the practical browser upload ceiling.

**Alternatives considered**:
- Server-side size check: File bytes don't pass through server in the new flow, so server-side check is impossible.
- No limit: Risk of browser memory issues or multi-hour uploads that are likely to fail.

## R7: Frontend Display Name Stripping

**Decision**: Modify `parseGoogleFile()` in `src/utils/helpers.ts` to detect and strip `__{category}__{subject}` suffix from YouTube video display names.

**Rationale**:
- The naming convention `{title}__{category}__{subject}` is only used for pipeline routing. Students should see only the title.
- Detection: after extracting the display name from the `{url} {title}` pattern, check if the title contains `__` separators. If the file is a YouTube type, split on `__` and use only the first segment as the display name.
- This only applies to YouTube-type files (those with a recognized YouTube URL prefix). Regular files are unaffected.

**Alternatives considered**:
- Strip `__` suffixes from all file types: Would break legitimately named files.
- Store display name separately in metadata: Requires database changes; violates YAGNI.

## R8: Deprecating the Old Upload Endpoint

**Decision**: Keep `/api/admin/upload.ts` in place but unused. The AddContent component will no longer call it. Remove it in a future cleanup PR.

**Rationale**:
- Deleting it now risks breaking any other callers we haven't identified.
- A code comment marking it as deprecated is sufficient for this PR.
- The endpoint continues to function if called directly, but no UI path invokes it.

**Alternatives considered**:
- Delete immediately: Risk if there are unknown callers.
- Add a deprecation warning response: Over-engineered; no external consumers.
