# Specify Prompts

Ready-to-paste prompts for `/speckit.specify` in new chat sessions.

## Decision: Separate, Not Combined

These are two separate features because:
- **Different users**: #1 is admin-facing, #2 is student-facing
- **Different codepaths**: #1 touches API routes + upload components, #2 touches the student browse UI + AI cart
- **Different risk profiles**: #1 is a backend/infra fix, #2 is a major UX redesign
- **Independent delivery**: #1 can ship and provide value immediately, #2 needs design iteration

Recommended order: **#1 first** (unblocks video content for admins, fixes Vercel cost issue), then **#2** (bigger scope, benefits from having video handling already in place since YouTube URLs are key NotebookLM sources).

---

## Feature #1: Resumable Uploads & Video Handling

```
/speckit.specify Switch file uploads from the Vercel proxy approach (/api/admin/upload which buffers the entire file through the serverless function) to direct-to-Google-Drive uploads using the existing resumable upload session endpoint (/api/admin/upload-session). The session creation stays server-side (handles auth + CORS), but the actual file bytes go directly from the browser to Google Drive's resumable session URI, eliminating Vercel bandwidth consumption and removing the 50MB file size limit. Additionally, add a "Video" content type to the admin AddContent component (alongside the existing File and Link tabs). The Video tab should have two options: (1) paste a YouTube URL + title, which creates a Drive file named "{youtube-url} {title}" matching the existing student-facing parser convention, and (2) upload a video file directly to a designated Drive staging folder with a message "Video will be processed within 24 hours" for later YouTube conversion via an existing Colab script. Only sudo-1337 has YouTube account access, so regular admins cannot upload directly to YouTube. The Colab pipeline is external and unchanged — it scans Drive for video files, uploads them to YouTube as unlisted, creates the "{url} {title}" link file, and deletes the original. This feature must maintain the existing duplicate detection, progress bar UX, and drag-and-drop functionality while switching the underlying upload mechanism.
```

---

## Feature #2: NotebookLM Integration & AI Study Mode Redesign

```
/speckit.specify Redesign the existing AI study cart (feature 003-ai-study-cart) into an immersive "Study Session Builder" that helps students collect study materials from multiple subjects/courses and export them to Google NotebookLM. Students should be able to build a single study session spanning multiple courses (e.g., Data Structures + Algorithms for finals week) — cross-subject connections are a key benefit of AI-assisted study. The current implementation uses a simple toggle switch and basic cart — it needs to feel engaging and interactive to drive real adoption. When a student activates AI mode, the interface should visually transform (e.g., subtle overlay, selection rings on file cards, floating collection panel) to create a focused material-gathering experience. Students should be able to tap/click file cards across multiple subjects and categories to collect them, with items auto-grouped by subject in the collection panel using collapsible sections and visual separation (color-coded chips or subject headers) so multi-course sessions stay organized. The export flow has two actions: (1) "Copy URLs for NotebookLM" copies all selected Google Drive file URLs (format: drive.google.com/file/d/{ID}/preview) and YouTube URLs to clipboard so the student can paste them as sources in NotebookLM, and (2) "Copy Study Context" copies a structured XML prompt (inspired by repomix.com's approach) containing course metadata for each subject, material names, types, categories, and AI instructions — the student pastes this as a text source in NotebookLM to give the AI structural context about the materials and how they relate across subjects. An "Open in NotebookLM" button should copy URLs to clipboard and open NotebookLM in a new tab with a toast guide. NotebookLM has no free-tier API or deep linking, so all source addition is manual by the student — our job is to make the collection and copying as frictionless as possible. The existing AI cart uses localStorage, AiCartContext, Framer Motion animations, and cross-tab sync — the redesign should build on this foundation. Google Drive files are accessed via drive.google.com/file/d/{ID}/preview and YouTube videos via their watch URLs. NotebookLM accepts both as "website URL" sources on the free tier (50 sources/notebook, must have captions for YouTube).
```
