export const SUPER_ADMIN_EMAIL = "mtolba2004@gmail.com";

// Upload size limits
export const UPLOAD_SOFT_LIMIT = 2 * 1024 * 1024 * 1024; // 2 GB
export const UPLOAD_HARD_LIMIT = 5 * 1024 * 1024 * 1024; // 5 GB
export const UPLOAD_MAX_RETRIES = 3;

// Accepted video MIME types for the Video tab upload option
export const VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/quicktime",    // .mov
  "video/x-msvideo",   // .avi
  "video/x-matroska",  // .mkv
  "video/webm",
] as const;
