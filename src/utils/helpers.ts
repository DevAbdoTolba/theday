// src/utils/helpers.ts
import { DriveFile, ParsedFile } from './types';

// Robust parsing for "URL Name" or "Name" formats
export const parseGoogleFile = (file: DriveFile): ParsedFile => {
  let name = file.name.trim();
  let url = `https://drive.google.com/file/d/${file.id}/preview`;
  let isExternalLink = false;
  let type: ParsedFile['type'] = 'unknown';

  // 1. Handle URL in name (e.g., "https://youtube.com/... Lecture 1")
  // Regex to capture a URL at the start or end of the string
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const match = name.match(urlRegex);

  if (match) {
    const extractedUrl = decodeURIComponent(match[0]);
    // Remove the URL from the name
    name = name.replace(match[0], '').trim().replace(/%20/g, ' ');
    
    // Determine if it's a YouTube link
    if (extractedUrl.includes('youtube.com') || extractedUrl.includes('youtu.be')) {
      url = extractedUrl.replace('youtube.com', 'yout-ube.com'); // Use privacy-friendly proxy if needed, or standard
      type = 'youtube';
      isExternalLink = true;
    } else {
      url = extractedUrl;
      isExternalLink = true;
    }
  } else {
    // Clean potential URL encoding in name
    name = name.replace(/%20/g, ' ');
  }

  // 2. Determine Type from MimeType (if not already set via URL)
  if (type === 'unknown') {
    if (file.mimeType.includes('folder')) type = 'folder';
    else if (file.mimeType.includes('pdf')) type = 'pdf';
    else if (file.mimeType.includes('image')) type = 'image';
    else if (file.mimeType.includes('video')) type = 'video';
    else if (file.mimeType.includes('presentation') || file.mimeType.includes('powerpoint')) type = 'slide';
    else if (file.mimeType.includes('spreadsheet') || file.mimeType.includes('excel')) type = 'sheet';
    else if (file.mimeType.includes('document') || file.mimeType.includes('word')) type = 'doc';
  }

  return {
    id: file.id,
    name: name || "Untitled", // Fallback for empty names
    url,
    type,
    isExternalLink,
    thumbnailUrl: type === 'image' || type === 'video' 
      ? `https://drive.google.com/thumbnail?id=${file.id}&sz=w400` 
      : undefined
  };
};

export const getYoutubeThumbnail = (url: string) => {
  try {
    const urlObj = new URL(url);
    const vId = urlObj.searchParams.get("v");
    if (vId) return `https://img.youtube.com/vi/${vId}/0.jpg`;
  } catch (e) {
    return null;
  }
  return null;
};