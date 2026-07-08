// src/lib/grad-server.ts
// SERVER-ONLY. Import this module exclusively from API routes or inside
// getServerSideProps via `await import(...)` so the section registry and
// googleapis never reach the client bundle. The whole point of the
// Graduation Wing is that its key is undiscoverable from the browser.

import { google, drive_v3 } from "googleapis";
import { serverGet, serverSet } from "./server-cache";
import type { GradFile, GradFolder, GradTree } from "../utils/gradTypes";

interface GradSection {
  /** Exact Google Drive folder name that roots this section */
  folderName: string;
  title: string;
  tagline: string;
  /** Teaser sections render a "coming soon" page; no data is served for them */
  teaser?: boolean;
}

// Registry of hidden sections. Keys are the secret URL segments.
const GRAD_SECTIONS: Record<string, GradSection> = {
  iti: {
    folderName: "iti",
    title: "The Graduation Wing",
    tagline: "For the ones who made it out.",
  },
  cv: {
    folderName: "cv",
    title: "The Next Door",
    tagline: "Your story, on one page.",
    teaser: true,
  },
};

/** Sibling teaser routes to hint at from inside an open section. */
export function listTeaserPaths(excludeKey: string): string[] {
  const exclude = excludeKey.toLowerCase();
  return Object.entries(GRAD_SECTIONS)
    .filter(([k, s]) => s.teaser && k !== exclude)
    .map(([k]) => `/grad/d/${k}`);
}

const MAX_DEPTH = 6;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const FOLDER_MIME = "application/vnd.google-apps.folder";

export function getGradSection(key: string): GradSection | null {
  if (!key || typeof key !== "string") return null;
  return GRAD_SECTIONS[key.toLowerCase()] ?? null;
}

function getDrive(): drive_v3.Drive {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.CLIENT_EMAIL,
      private_key: process.env.PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
  return google.drive({ version: "v3", auth });
}

const naturalCompare = (a: string, b: string) =>
  a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });

function sortTree(node: GradFolder): void {
  node.folders.sort((a, b) => naturalCompare(a.name, b.name));
  node.files.sort((a, b) => naturalCompare(a.name, b.name));
  node.folders.forEach(sortTree);
}

// Coalesce concurrent tree builds (e.g. a burst of thumbnail requests on a
// cold cache) into one Drive round trip.
const inflightTrees = new Map<string, Promise<GradTree | null>>();

/**
 * Fetches the whole folder/file tree of a section with breadth-first
 * batched queries (one Drive call per depth level + one file sweep per
 * 40 folders), so even a deep section costs a handful of round trips.
 */
export async function fetchGradTree(key: string): Promise<GradTree | null> {
  const section = getGradSection(key);
  if (!section) return null;

  const cacheKey = `grad-tree:${key}`;
  const cached = serverGet<GradTree>(cacheKey, CACHE_TTL);
  if (cached) return cached;

  let inflight = inflightTrees.get(key);
  if (!inflight) {
    inflight = buildGradTree(key).finally(() => inflightTrees.delete(key));
    inflightTrees.set(key, inflight);
  }
  return inflight;
}

async function buildGradTree(key: string): Promise<GradTree | null> {
  const section = getGradSection(key);
  if (!section) return null;

  const cacheKey = `grad-tree:${key}`;
  const drive = getDrive();

  const { data: rootSearch } = await drive.files.list({
    q: `name = '${section.folderName}' and mimeType = '${FOLDER_MIME}' and trashed = false`,
    fields: "files(id, name)",
  });

  const rootIds = (rootSearch.files ?? [])
    .map((f) => f.id)
    .filter((id): id is string => Boolean(id));

  // Synthetic root — if Drive ever holds several folders with the section
  // name, their contents merge into one tree.
  const root: GradFolder = {
    id: rootIds[0] ?? "grad-root",
    name: section.folderName,
    folders: [],
    files: [],
  };

  if (rootIds.length === 0) {
    const empty: GradTree = {
      key,
      title: section.title,
      tagline: section.tagline,
      root,
      fetchedAt: Date.now(),
    };
    return empty; // not cached — the folder may appear at any moment
  }

  const nodeByFolderId = new Map<string, GradFolder>();
  rootIds.forEach((id) => nodeByFolderId.set(id, root));

  // BFS over folder levels
  let level = rootIds;
  const allFolderIds = [...rootIds];
  for (let depth = 0; depth < MAX_DEPTH && level.length > 0; depth++) {
    const parentsQuery = level.map((id) => `'${id}' in parents`).join(" or ");
    const { data } = await drive.files.list({
      q: `(${parentsQuery}) and mimeType = '${FOLDER_MIME}' and trashed = false`,
      fields: "files(id, name, parents)",
      pageSize: 1000,
    });

    const next: string[] = [];
    (data.files ?? []).forEach((f) => {
      if (!f.id || !f.name) return;
      const parent = nodeByFolderId.get(f.parents?.[0] ?? "");
      if (!parent) return;
      const node: GradFolder = { id: f.id, name: f.name, folders: [], files: [] };
      parent.folders.push(node);
      nodeByFolderId.set(f.id, node);
      next.push(f.id);
      allFolderIds.push(f.id);
    });
    level = next;
  }

  // Fetch files for all discovered folders, batched to keep queries short
  const BATCH = 40;
  for (let i = 0; i < allFolderIds.length; i += BATCH) {
    const batch = allFolderIds.slice(i, i + BATCH);
    const parentsQuery = batch.map((id) => `'${id}' in parents`).join(" or ");
    let pageToken: string | undefined;
    do {
      const { data } = await drive.files.list({
        q: `(${parentsQuery}) and mimeType != '${FOLDER_MIME}' and trashed = false`,
        fields: "nextPageToken, files(id, name, mimeType, parents, size)",
        pageSize: 1000,
        pageToken,
      });
      (data.files ?? []).forEach((f) => {
        if (!f.id || !f.name) return;
        const parent = nodeByFolderId.get(f.parents?.[0] ?? "");
        if (!parent) return;
        const file: GradFile = {
          id: f.id,
          name: f.name,
          mimeType: f.mimeType ?? "application/octet-stream",
        };
        if (f.size) file.size = parseInt(f.size, 10);
        parent.files.push(file);
      });
      pageToken = data.nextPageToken ?? undefined;
    } while (pageToken);
  }

  sortTree(root);

  const tree: GradTree = {
    key,
    title: section.title,
    tagline: section.tagline,
    root,
    fetchedAt: Date.now(),
  };
  serverSet(cacheKey, tree);
  return tree;
}

// --- Thumbnails ---------------------------------------------------------------
// Served through our own API instead of drive.google.com/thumbnail directly:
// the browser's Google cookies, burst rate limits, and sharing settings all
// stop mattering — the service account fetches once, we cache and re-serve.

const THUMB_TTL = 6 * 60 * 60 * 1000; // 6 hours

export interface GradThumb {
  /** base64-encoded image bytes (Buffer-safe for the in-memory cache) */
  data: string;
  mime: string;
}

function collectTreeFileIds(node: GradFolder, into = new Set<string>()): Set<string> {
  node.files.forEach((f) => into.add(f.id));
  node.folders.forEach((f) => collectTreeFileIds(f, into));
  return into;
}

export async function fetchGradThumb(
  key: string,
  fileId: string,
  size: number
): Promise<GradThumb | null> {
  if (!getGradSection(key)) return null;
  if (!/^[\w-]{10,}$/.test(fileId)) return null;

  const cacheKey = `grad-thumb:${key}:${fileId}:${size}`;
  const cached = serverGet<GradThumb>(cacheKey, THUMB_TTL);
  if (cached) return cached;

  // Only serve files that actually live in this section's tree
  const tree = await fetchGradTree(key);
  if (!tree || !collectTreeFileIds(tree.root).has(fileId)) return null;

  const drive = getDrive();
  const { data: meta } = await drive.files.get({
    fileId,
    fields: "thumbnailLink",
  });
  if (!meta.thumbnailLink) return null;

  // thumbnailLink ends with a size directive like "=s220" — swap it
  const sized = meta.thumbnailLink.replace(/=s\d+[^/]*$/, `=s${size}`);
  const resp = await fetch(sized);
  if (!resp.ok) return null;

  const thumb: GradThumb = {
    data: Buffer.from(await resp.arrayBuffer()).toString("base64"),
    mime: resp.headers.get("content-type") ?? "image/jpeg",
  };
  serverSet(cacheKey, thumb);
  return thumb;
}
