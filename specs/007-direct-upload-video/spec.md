# Feature Specification: Direct Upload & Video Content Type

**Feature Branch**: `007-direct-upload-video`
**Created**: 2026-03-15
**Status**: Draft
**Input**: User description: "Switch file uploads from Vercel proxy to direct-to-Google-Drive uploads using resumable upload sessions, and add a Video content type to the admin AddContent component with YouTube URL and video file upload options."

## Clarifications

### Session 2026-03-15

- Q: What naming convention should video files use in the staging folder so the Colab pipeline can route the result to the correct subject/category? → A: Filename format is `{title}__{category}__{subject}` with no file extension (title first for readability). The frontend must strip the trailing `__{category}__{subject}` from YouTube video display names, showing only the title.
- Q: After uploading a video to staging, should it appear in the content list or only show a success message? → A: Video uploads behave identically to normal file uploads — standard optimistic UI, appears in the content list immediately. The "processed within 24 hours" is informational only, not a blocking state. The pipeline has no approval role.
- Q: Should there be a new file size limit replacing the old 50 MB cap? → A: Two-tier limit. 2 GB soft limit (confirmation dialog warning). 5 GB hard limit (reject the file, show instructions to upload manually via Google Drive, and provide a link to open the target Drive folder).
- Q: On upload failure mid-transfer, should the system auto-resume or require manual retry? → A: Auto-resume from last byte — retry automatically (up to 3 attempts) before showing a failure message.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Direct File Upload to Google Drive (Priority: P1)

An admin uploads a file (document, image, etc.) to a class subject via the AddContent component. Instead of the file bytes routing through the Vercel serverless function (which buffers the entire payload and is capped at 50 MB), the browser obtains a resumable upload session URI from the server and then streams the file bytes directly to Google Drive. The admin sees the same drag-and-drop interface and progress bar they are used to, with no change in workflow — only the underlying transport changes.

**Why this priority**: This is the core infrastructure change. Every file upload (including the new video upload in US3) depends on this mechanism. It eliminates Vercel bandwidth costs and removes the 50 MB ceiling, unblocking large file support.

**Independent Test**: Can be fully tested by uploading a file > 50 MB and confirming it appears in the correct Drive folder with accurate progress reporting. The existing 50 MB client-side check is removed; upload completes without routing through Vercel.

**Acceptance Scenarios**:

1. **Given** an admin is on the AddContent file tab, **When** they select or drag-and-drop a 100 MB file, **Then** the system creates a resumable upload session server-side, the browser uploads directly to Google Drive, a progress bar reflects real upload progress, and the file appears in the correct Drive folder.
2. **Given** an admin uploads a file that already exists in the subject category, **When** the duplicate detection dialog appears and the admin confirms replacement, **Then** the old file is deleted and the new file is uploaded directly to Drive.
3. **Given** an admin's network connection drops mid-upload, **When** the upload fails, **Then** the system automatically resumes from the last successfully uploaded byte (up to 3 attempts). If all retries fail, a clear error message is shown.
4. **Given** an admin uploads a small file (< 5 MB), **When** the upload completes, **Then** the experience is indistinguishable from the old flow — same progress bar, same optimistic UI update to the content list.

---

### User Story 2 - Add YouTube Link as Video Content (Priority: P2)

An admin wants to add a YouTube video to a class subject. They open the AddContent component, select the new "Video" tab, choose the "YouTube Link" option, paste a YouTube URL, enter a display title, and submit. The system creates a file in Google Drive named "{youtube-url} {title}" following the existing convention that the student-facing parser already understands. The video immediately appears as a playable YouTube embed in the student view.

**Why this priority**: Provides a clear, purpose-built path for the most common video workflow (YouTube links). Currently admins must use the generic Link tab, which does not validate YouTube URLs or guide them toward the correct naming convention.

**Independent Test**: Can be fully tested by adding a YouTube link via the Video tab and confirming the student view renders the YouTube embed player with correct title and thumbnail.

**Acceptance Scenarios**:

1. **Given** an admin is on the Video tab's YouTube Link option, **When** they paste a valid YouTube URL (youtube.com or youtu.be format) and a title, **Then** a Drive file named "{youtube-url} {title}" is created in the subject's category folder.
2. **Given** an admin pastes an invalid URL (not a YouTube link), **When** they attempt to submit, **Then** the system shows a validation error indicating the URL must be a valid YouTube link.
3. **Given** a YouTube link file already exists with the same name in the category, **When** the admin submits a duplicate, **Then** the existing duplicate detection dialog appears and handles replacement.
4. **Given** the file is created successfully, **When** a student views the subject, **Then** the existing parser detects the YouTube URL, extracts the video ID, and renders the embed player with the correct title.

---

### User Story 3 - Upload Video File for Later YouTube Processing (Priority: P3)

An admin has a video file (e.g., lecture recording) that needs to be on YouTube but cannot upload directly to YouTube themselves (only the super admin has YouTube account access). The admin opens the Video tab, selects "Upload Video File," picks or drags a video file, and uploads it to a designated staging folder in Google Drive. A message informs them "Video will be processed within 24 hours." An external Colab pipeline (unchanged by this feature) later picks up the file, uploads it to YouTube as unlisted, creates the "{url} {title}" link file, and deletes the original.

**Why this priority**: Completes the video workflow for non-super-admin users who cannot upload to YouTube directly. Depends on the direct upload mechanism (US1) for large video files. The Colab pipeline is external and already exists.

**Independent Test**: Can be fully tested by uploading a video file and confirming it lands in the staging folder with the correct name, and verifying the "processing within 24 hours" message is displayed.

**Acceptance Scenarios**:

1. **Given** an admin is on the Video tab's Upload Video File option, **When** they select or drag a video file (MP4, MOV, AVI, MKV, WebM) and enter a display title, **Then** the file is uploaded to the staging folder with the name `{title}__{category}__{subject}` (no file extension), using the resumable upload mechanism with a progress bar showing upload progress.
2. **Given** the video upload completes, **When** the success state is shown, **Then** the file appears in the content list via optimistic UI (like any normal upload), and the admin also sees an informational message "Video will be processed within 24 hours."
3. **Given** an admin selects a non-video file type through the Video tab's Upload option, **When** they attempt to submit, **Then** the system rejects the file with a message indicating only video formats are accepted.
4. **Given** the upload succeeds, **When** the external Colab pipeline runs, **Then** it finds the file in the staging folder (this is external behavior; the feature only ensures the file is placed correctly).

---

### Edge Cases

- What happens when the resumable upload session URI expires before the upload completes? The auto-resume mechanism detects the 4xx error; if the session is expired (not resumable), the system creates a new session and restarts the upload, counting toward the 3-retry limit.
- What happens when the admin loses authentication mid-upload? Since the session URI is pre-authorized by Google, the in-progress upload can still complete. If the session creation itself fails due to auth, a clear error is shown.
- What happens when an admin pastes a YouTube URL that is a playlist, channel, or non-video page? The system validates that the URL contains a recognizable video ID (11-character ID) and rejects non-video YouTube URLs.
- What happens when two admins upload a file with the same name simultaneously? The duplicate detection check runs before upload; if both pass the check before either uploads, both files may land in Drive. This is acceptable — the second uploader may see a duplicate on next load and can resolve manually.
- What happens if the video staging folder does not exist or is inaccessible? The system returns a clear error indicating the staging folder is not configured or accessible, rather than silently failing.
- What happens when a file exceeds 5 GB? The system rejects the upload, explains the hard limit, and provides a direct link to the target Google Drive folder so the admin can upload manually via the Drive web UI.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST create resumable upload sessions server-side (handling authentication and CORS) and return the session URI to the browser for direct upload.
- **FR-002**: System MUST upload file bytes directly from the browser to the resumable session URI, bypassing the serverless function for file content transfer.
- **FR-003**: System MUST display real-time upload progress during direct uploads, reflecting actual bytes transferred.
- **FR-004**: System MUST replace the 50 MB file size limit with a two-tier limit: a 2 GB soft limit that shows a confirmation dialog warning the admin before proceeding, and a 5 GB hard limit that rejects the file.
- **FR-005**: When a file exceeds the 5 GB hard limit, the system MUST display instructions to upload manually via Google Drive and provide a link that opens the target Drive folder directly.
- **FR-006**: System MUST preserve existing duplicate file detection — checking for files with the same name in the target category before uploading and prompting the admin to confirm replacement.
- **FR-007**: System MUST preserve existing drag-and-drop functionality for file selection in the AddContent component.
- **FR-008**: System MUST preserve optimistic UI updates — immediately adding the uploaded file to the content list cache after successful upload.
- **FR-009**: System MUST add a "Video" tab to the AddContent component alongside the existing "File" and "Link" tabs.
- **FR-010**: The Video tab MUST provide a "YouTube Link" option that accepts a YouTube URL and a display title.
- **FR-011**: The YouTube Link option MUST validate that the provided URL is a valid YouTube video URL (containing a recognizable 11-character video ID).
- **FR-012**: The YouTube Link option MUST create a file in the subject's category folder named following the "{youtube-url} {title}" convention, matching the existing student-facing parser expectation.
- **FR-013**: The Video tab MUST provide an "Upload Video File" option for uploading video files to a designated staging folder.
- **FR-014**: The Upload Video File option MUST restrict accepted file types to common video formats (MP4, MOV, AVI, MKV, WebM).
- **FR-015**: The Upload Video File option MUST name the uploaded file as `{title}__{category}__{subject}` with no file extension, so the Colab pipeline can auto-route the resulting YouTube link to the correct folder.
- **FR-016**: The Upload Video File option MUST behave like a normal file upload — optimistic UI adds the file to the content list immediately. An informational message "Video will be processed within 24 hours" is shown alongside the standard success feedback.
- **FR-017**: The Upload Video File option MUST use the direct resumable upload mechanism (FR-001/FR-002) for transferring video bytes.
- **FR-018**: The student-facing frontend MUST strip the trailing `__{category}__{subject}` from YouTube video display names, showing only the title portion (e.g., a file named `https://youtu.be/xxx lecture__Chapter1__Math` displays as "lecture").
- **FR-019**: On upload failure mid-transfer, the system MUST automatically resume from the last successfully uploaded byte, retrying up to 3 times before showing a failure message to the admin.
- **FR-020**: System MUST show clear, actionable error messages for upload failures (after retry exhaustion), expired sessions, invalid YouTube URLs, and unsupported file types.
- **FR-021**: All new operations MUST enforce the existing class-level authorization model (super admin bypass, class-scoped admin check).

### Key Entities

- **Upload Session**: A server-created authorization token (resumable session URI) that grants the browser temporary, scoped write access to upload a specific file to a specific folder. Expires after a period of inactivity.
- **Video Staging Folder**: A designated folder where video files are placed for asynchronous YouTube processing by the external Colab pipeline. Separate from subject category folders. Files are named `{title}__{category}__{subject}` (no extension) so the pipeline can auto-route results.
- **YouTube Link File**: A file whose name follows the pattern "{youtube-url} {title}" — contains no meaningful file content; its name encodes both the video URL and display title for the student-facing parser.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admins can upload files up to 2 GB without warnings and up to 5 GB after confirming the soft-limit dialog. Files above 5 GB are rejected with a link to upload manually via Google Drive.
- **SC-002**: File upload content transfer does not consume serverless function bandwidth — only the session creation request (a few KB) passes through the server.
- **SC-003**: Upload progress bar accurately reflects bytes transferred, updating at least every 2 seconds during active upload.
- **SC-004**: Admins can add a YouTube video link in under 30 seconds (paste URL, enter title, submit).
- **SC-005**: YouTube link files created via the Video tab are correctly parsed and rendered as playable embeds in the student view on first load.
- **SC-006**: Video files uploaded via the staging option appear in the designated folder within 5 seconds of upload completion.
- **SC-007**: All existing upload workflows (file upload, link creation, duplicate detection, drag-and-drop) continue to function identically from the admin's perspective.
- **SC-008**: Zero increase in serverless function bandwidth usage per file upload compared to the current proxy approach.

## Assumptions

- The existing upload session endpoint provides the foundation for resumable upload session creation and needs only minor modifications (if any) to support the new direct upload flow.
- The external Colab pipeline for YouTube video processing is unchanged and will continue to scan the designated staging folder. This feature only ensures files are placed in the correct location.
- The video staging folder will be pre-created and its folder ID configured as an environment variable or constant, similar to how other folder IDs are managed in the system.
- Browser support for upload progress events is sufficient for the target user base (modern browsers used by admins).
- Resumable upload session URIs have a reasonable timeout (typically ~1 week), so uploads that take several minutes for large files will not be interrupted by session expiry under normal conditions.
