// src/utils/types.ts

export interface Subject {
  name: string;
  abbreviation: string;
  shared?: boolean;
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

export interface UseSmartSubjectReturn {
  data: SubjectMaterials | null;
  loading: boolean;
  fetching: boolean;
  newItems: string[];
  error: string | null;
}

export interface ParsedFile {
  id: string;
  name: string;
  url: string; // The actual clickable link (Drive preview or extracted URL)
  type: 'folder' | 'pdf' | 'image' | 'video' | 'youtube' | 'doc' | 'sheet' | 'slide' | 'unknown';
  thumbnailUrl?: string;
  isExternalLink: boolean;
  youtubeId?: string | null
}

// --- Study Session types ---

export interface SessionItem {
  id: string;
  name: string;
  url: string;
  type: ParsedFile['type'];
  subjectName: string;
  subjectAbbr: string;
  category: string;
  thumbnailUrl?: string;
  addedAt: number;
}

export interface StudySessionState {
  isActive: boolean;
  items: SessionItem[];
}

// --- Upload types ---

export interface UploadProgress {
  percent: number;
  speedBps: number; // bytes per second
  loadedBytes: number;
  totalBytes: number;
}

export interface UploadOptions {
  onProgress?: (progress: UploadProgress) => void;
  signal?: AbortSignal;
}

export interface UploadResult {
  id: string;
  name: string;
}

// --- Subject Change Request types ---

export type ChangeType = "create" | "edit" | "delete";

export type ChangeStatus = "pending" | "approved" | "rejected";

export interface ISubjectChangeRequest {
  _id: string;
  classId: string;
  changeType: ChangeType;
  subjectName: string;
  subjectAbbreviation: string;
  shared: boolean;
  semesterIndex: number;
  originalSubjectName?: string;
  originalSubjectAbbreviation?: string;
  status: ChangeStatus;
  requestedBy: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type SubjectWithPending = Subject & {
  pendingChange?: ISubjectChangeRequest;
  semesterIndex: number;
};

export interface PendingApproval extends ISubjectChangeRequest {
  className: string;
  requestedByName: string;
  requestedByEmail: string;
}

