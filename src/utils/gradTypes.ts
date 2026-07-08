// src/utils/gradTypes.ts
// Shared (client-safe) types for the Graduation Wing.
// No secrets here — section keys live server-side in src/lib/grad-server.ts.

export interface GradFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
}

export interface GradFolder {
  id: string;
  name: string;
  folders: GradFolder[];
  files: GradFile[];
}

export interface GradTree {
  /** URL key of the section (e.g. the last segment of /grad/d/…) */
  key: string;
  title: string;
  tagline: string;
  root: GradFolder;
  fetchedAt: number;
}

export interface GradPass {
  v: 1;
  path: string;
  title: string;
  unlockedAt: number;
}
