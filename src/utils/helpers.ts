// src/utils/helpers.ts
import { DriveFile, ParsedFile } from './types';

// Robust parsing for "URL Name" or "Name" formats
export const parseGoogleFile = (file: DriveFile): ParsedFile => {
  // 1. Decode the filename first (Fixes the %3A%2F issue)
  let rawName = decodeURIComponent(file.name);
  let name = rawName;
  let url = `https://drive.google.com/file/d/${file.id}/preview`;
  let type: ParsedFile['type'] = 'unknown';
  let isExternalLink = false;
  let youtubeId = null;

  // 2. Check if the name STARTS with a URL (Http/Https)
  // This regex looks for http(s) followed by the link, then a space, then the name
  const urlPrefixRegex = /^(https?:\/\/[^\s]+)(.*)$/;
  const match = rawName.match(urlPrefixRegex);

  if (match) {
    const extractedUrl = match[1]; // The URL part
    const remainingName = match[2].trim(); // The Name part (e.g. "DFS_BFS-Part1")
    
    url = extractedUrl;
    name = remainingName || "Untitled Link"; // Fallback if no name provided
    isExternalLink = true;

    // 3. Determine if it's YouTube or Generic URL
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      type = 'youtube';
      youtubeId = getYoutubeId(url);
    } else {
      type = 'unknown';
    }
  } else {
    // Standard File Logic (PDFs, Images, etc.)
    // Clean up any other weird encoding
    name = name.replace(/%20/g, ' '); 
    
    if (file.mimeType.includes('folder')) type = 'folder';
    else if (file.mimeType.includes('pdf')) type = 'pdf';
    else if (file.mimeType.includes('image')) type = 'image';
    else if (file.mimeType.includes('video')) type = 'video';
    else if (file.mimeType.includes('presentation')) type = 'slide';
    else if (file.mimeType.includes('spreadsheet')) type = 'sheet';
    else if (file.mimeType.includes('document')) type = 'doc';
  }

  // 4. Generate Thumbnail URL
  let thumbnailUrl: string | undefined;
  if (type === 'youtube' && youtubeId) {
    thumbnailUrl = getYoutubeThumbnail(youtubeId) || undefined;
  } else if (type === 'image' || type === 'video') {
    thumbnailUrl = `https://drive.google.com/thumbnail?id=${file.id}&sz=w800`;
  }

  return {
    id: file.id,
    name,
    url,
    type,
    isExternalLink,
    thumbnailUrl,
    youtubeId // We pass this ID so the player can use it
  };
};

export const getYoutubeThumbnail = (id: string | null) => {
  if (!id) return null;
  let vidId ;
  try{
    let tempUrl = new URL(id);
    vidId = tempUrl.searchParams.get("v");
  } catch{
    // not a url
    return null;
  }   
  return `https://img.youtube.com/vi/${vidId}/hqdefault.jpg`;
};

export const getYoutubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};