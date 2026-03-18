# Idea: Resumable Uploads & Video Handling

## Problem

### Upload Proxy Burns Vercel Quota
Currently `/api/admin/upload` proxies the entire file through Vercel's serverless function to Google Drive. Every byte of every upload consumes Vercel bandwidth, function execution time, and memory. The 50MB limit exists because of serverless constraints, not Google Drive's limits. A resumable upload session endpoint (`/api/admin/upload-session`) already exists but isn't used by the frontend.

### Videos Are Too Large for the Current Flow
- Google Drive has a 15GB quota — videos were the biggest space consumer
- A Colab script converts Drive videos to YouTube (unlisted) at ~6/day (YouTube API quota)
- The script creates Drive files named `{youtube-url} {title}` which the student-facing parser detects as clickable YouTube links
- With multi-admin, admins need a way to contribute videos but don't have YouTube account access
- Only sudo-1337 has access to the YouTube account

### The Colab Script (Reference)
- Runs on Google Colab (free)
- Mounts Google Drive, finds video files (.mp4, .mkv, .avi, .m4v)
- Authenticates to YouTube API via OAuth2 client secrets
- Uploads each video as "unlisted" to a shared YouTube channel
- Creates a `{youtube-url} {title}` file in the same Drive folder
- Deletes the original video file from Drive (frees quota)
- Rate limited to ~6 uploads/day by YouTube API quota

## User Stories

### US1: Admin uploads files without burning Vercel quota
As an admin, when I upload a file through the dashboard, it should go directly to Google Drive without passing through Vercel's servers, so that uploads are faster, have no size limit, and don't consume the platform's hosting quota.

### US2: Admin uploads large non-video files (>50MB)
As an admin, I should be able to upload files larger than 50MB (e.g., large PDFs, archives) through the dashboard, since the current 50MB limit is an artificial constraint of the proxy approach.

### US3: Admin adds a video by pasting a YouTube URL
As an admin, I should be able to add a video to a category by pasting a YouTube URL and title, so the video appears to students as a playable YouTube embed without needing to upload anything.

### US4: Admin uploads a video file for later YouTube conversion
As an admin, I should be able to upload a video file through the dashboard to a staging area on Drive, with a clear message that "Video will be processed and available within 24 hours," so that the existing Colab pipeline can convert it to YouTube.

### US5: Sudo-1337 manages the YouTube conversion pipeline
As sudo-1337, I should have visibility into which videos are queued for YouTube conversion, so I can trigger the Colab script and track progress.

## Technical Notes

- `upload-session.ts` already creates a Google Drive resumable session URI
- The resumable session URI returned by Google IS CORS-enabled for direct browser upload
- The original CORS issue was likely with the session *creation* step (now server-side)
- Student parser uses regex `^(https?:\/\/[^\s]+)(.*)$` on filenames to detect URL-based files
- YouTube detection: `url.includes('youtube.com') || url.includes('youtu.be')`
- AddContent.tsx already has File/Link toggle — needs a Video tab added
- ContentUploader.tsx is orphaned/unused code

## Open Questions
- Should the Colab script be adapted to scan per-class folders instead of one hardcoded path?
- Should there be a server-side cron/webhook that triggers video processing?
- What happens if an admin uploads a video but the Colab script never runs?
