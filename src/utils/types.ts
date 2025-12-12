// src/utils/types.ts

export interface Subject {
  name: string;
  abbreviation: string;
}

export interface Semester {
  index: number;
  subjects: Subject[];
}

export interface ClassStructure {
  class: string;
  data: Semester[];
}

export interface DriveFile {
  id: string;
  mimeType: string;
  name: string;
  parents: string[];
  size?: number;
  owners?: { emailAddress: string }[];
}

export interface SubjectMaterials {
  [category: string]: DriveFile[];
}

export interface ParsedFile {
  id: string;
  name: string;
  url: string; // The actual clickable link (Drive preview or extracted URL)
  type: 'folder' | 'pdf' | 'image' | 'video' | 'youtube' | 'doc' | 'sheet' | 'slide' | 'unknown';
  thumbnailUrl?: string;
  isExternalLink: boolean;
}