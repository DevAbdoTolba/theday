export const SUPER_ADMIN_EMAIL = "mtolba2004@gmail.com";

// Upload size limits
export const UPLOAD_SOFT_LIMIT = 2 * 1024 * 1024 * 1024; // 2 GB
export const UPLOAD_HARD_LIMIT = 5 * 1024 * 1024 * 1024; // 5 GB
export const UPLOAD_MAX_RETRIES = 3;

// Staging folder for video files awaiting YouTube processing (set VIDEO_STAGING_FOLDER_ID in env)
export const VIDEO_STAGING_FOLDER_ID = process.env.VIDEO_STAGING_FOLDER_ID ?? "";

// Accepted video MIME types for the Video tab upload option
export const VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/quicktime",    // .mov
  "video/x-msvideo",   // .avi
  "video/x-matroska",  // .mkv
  "video/webm",
] as const;
