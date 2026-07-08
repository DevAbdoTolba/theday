// src/utils/gradStore.ts
// localStorage persistence for the Graduation Wing: the device pass
// (what makes the seal button appear forever), the cached tree for
// instant loads, and per-file study progress.

import type { GradPass, GradTree } from "./gradTypes";

const PASS_KEY = "gradPass";
const SEAL_SEEN_KEY = "gradSealSeen";
const treeKey = (key: string) => `gradTree:${key}`;
const doneKey = (key: string) => `gradDone:${key}`;
const lastKey = (key: string) => `gradLast:${key}`;

const canStore = () => typeof window !== "undefined";

function readJson<T>(key: string): T | null {
  if (!canStore()) return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  if (!canStore()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full / private mode — the wing still works, just not persisted
  }
}

// --- Device pass -----------------------------------------------------------

export function getGradPass(): GradPass | null {
  const pass = readJson<GradPass>(PASS_KEY);
  return pass && pass.v === 1 && typeof pass.path === "string" ? pass : null;
}

/** Returns true when this call is the very first unlock on this device. */
export function grantGradPass(path: string, title: string): boolean {
  const existing = getGradPass();
  if (existing?.path === path) return false;
  const pass: GradPass = { v: 1, path, title, unlockedAt: Date.now() };
  writeJson(PASS_KEY, pass);
  return existing === null;
}

export function hasSeenSeal(): boolean {
  return canStore() && localStorage.getItem(SEAL_SEEN_KEY) === "1";
}

export function markSealSeen(): void {
  if (canStore()) localStorage.setItem(SEAL_SEEN_KEY, "1");
}

// --- One-time cinematic intro ------------------------------------------------

const introKey = (key: string) => `gradIntro:${key}`;

export function hasSeenIntro(key: string): boolean {
  return canStore() && localStorage.getItem(introKey(key)) === "1";
}

/** Called the moment playback (or a confirmed skip) starts — it never replays. */
export function markIntroSeen(key: string): void {
  if (canStore()) localStorage.setItem(introKey(key), "1");
}

// --- Tree cache (stale-while-revalidate) ------------------------------------

export function getCachedTree(key: string): GradTree | null {
  return readJson<GradTree>(treeKey(key));
}

export function setCachedTree(tree: GradTree): void {
  writeJson(treeKey(tree.key), tree);
}

// --- Study progress ----------------------------------------------------------

export function getStudied(key: string): Record<string, number> {
  return readJson<Record<string, number>>(doneKey(key)) ?? {};
}

export function toggleStudied(key: string, fileId: string): Record<string, number> {
  const studied = getStudied(key);
  if (studied[fileId]) {
    delete studied[fileId];
  } else {
    studied[fileId] = Date.now();
  }
  writeJson(doneKey(key), studied);
  return { ...studied };
}

// --- Last opened file ---------------------------------------------------------

export interface GradLastOpened {
  fileId: string;
  fileName: string;
  folderId: string;
  at: number;
}

export function getLastOpened(key: string): GradLastOpened | null {
  return readJson<GradLastOpened>(lastKey(key));
}

export function setLastOpened(key: string, value: GradLastOpened): void {
  writeJson(lastKey(key), value);
}
