// src/utils/upload.ts
//
// Direct browser-to-Google-Drive upload utility using the resumable upload protocol.
// The caller must first obtain a sessionUri from /api/admin/upload-session.
//
// Retry logic:
//   - On failure, queries Drive for the number of bytes received so far and resumes
//     from that offset (PUT with Content-Range: bytes {offset}-{end}/{total}).
//   - On session expiry (404), throws a SessionExpiredError so the caller can
//     create a new session and retry from scratch.
//   - Retries up to UPLOAD_MAX_RETRIES times total before rejecting.

import { UPLOAD_MAX_RETRIES } from "../lib/constants";
import { UploadOptions, UploadProgress, UploadResult } from "./types";

export class SessionExpiredError extends Error {
  constructor() {
    super("Upload session expired");
    this.name = "SessionExpiredError";
  }
}

export class UploadAbortedError extends Error {
  constructor() {
    super("Upload cancelled");
    this.name = "UploadAbortedError";
  }
}

/** Query how many bytes Drive has received for a resumable session. */
async function queryUploadOffset(sessionUri: string, totalSize: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      if (xhr.status === 308) {
        const range = xhr.getResponseHeader("Range");
        if (range) {
          const match = range.match(/bytes=0-(\d+)/);
          if (match) return resolve(parseInt(match[1], 10) + 1);
        }
        return resolve(0);
      }
      if (xhr.status === 200 || xhr.status === 201) return resolve(totalSize);
      if (xhr.status === 404) return reject(new SessionExpiredError());
      reject(new Error(`Unexpected status querying upload offset: ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error("Network error querying upload offset"));
    xhr.open("PUT", sessionUri);
    xhr.setRequestHeader("Content-Range", `bytes */${totalSize}`);
    xhr.setRequestHeader("Content-Length", "0");
    xhr.send();
  });
}

/** Upload a slice of the file to the resumable session URI. */
function uploadSlice(
  sessionUri: string,
  file: File,
  offset: number,
  onProgress: (loaded: number) => void,
  signal?: AbortSignal
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new UploadAbortedError());

    const slice = file.slice(offset);
    const total = file.size;
    const end = total - 1;

    const xhr = new XMLHttpRequest();

    const onAbort = () => {
      xhr.abort();
      reject(new UploadAbortedError());
    };
    signal?.addEventListener("abort", onAbort, { once: true });

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(offset + e.loaded);
      }
    };

    xhr.onload = () => {
      signal?.removeEventListener("abort", onAbort);
      if (xhr.status === 200 || xhr.status === 201) {
        try {
          const result = JSON.parse(xhr.responseText) as UploadResult;
          return resolve(result);
        } catch {
          return reject(new Error("Failed to parse Drive response"));
        }
      }
      if (xhr.status === 308) return reject(new Error("Upload incomplete (308)"));
      if (xhr.status === 404) return reject(new SessionExpiredError());
      let msg = `Upload failed (${xhr.status})`;
      try {
        const body = JSON.parse(xhr.responseText) as { error?: { message?: string } };
        if (body.error?.message) msg = body.error.message;
      } catch { /* ignore */ }
      reject(new Error(msg));
    };

    xhr.onerror = () => {
      signal?.removeEventListener("abort", onAbort);
      reject(new Error("Network error during upload"));
    };

    xhr.open("PUT", sessionUri);
    xhr.setRequestHeader("Content-Range", `bytes ${offset}-${end}/${total}`);
    xhr.send(slice);
  });
}

/**
 * Upload a file directly to Google Drive using a resumable session URI.
 *
 * @param file       - The File object to upload.
 * @param sessionUri - The resumable upload session URI from /api/admin/upload-session.
 * @param options    - Optional progress callback.
 * @returns          - The created Drive file { id, name }.
 * @throws           - SessionExpiredError if the session expires and cannot be resumed.
 */
export async function uploadFileDirect(
  file: File,
  sessionUri: string,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const { onProgress, signal } = options;

  // Speed tracking state
  let lastTimestamp = Date.now();
  let lastLoaded = 0;
  let smoothSpeed = 0; // exponential moving average

  const reportProgress = (loadedBytes: number) => {
    if (!onProgress) return;

    const now = Date.now();
    const elapsed = (now - lastTimestamp) / 1000; // seconds

    if (elapsed > 0.3) {
      const bytesInInterval = loadedBytes - lastLoaded;
      const instantSpeed = bytesInInterval / elapsed;
      // Smooth with EMA (alpha = 0.3 for responsiveness)
      smoothSpeed = smoothSpeed === 0 ? instantSpeed : smoothSpeed * 0.7 + instantSpeed * 0.3;
      lastTimestamp = now;
      lastLoaded = loadedBytes;
    }

    const pct = Math.round((loadedBytes / file.size) * 100);
    onProgress({
      percent: Math.min(pct, 99),
      speedBps: Math.round(smoothSpeed),
      loadedBytes,
      totalBytes: file.size,
    });
  };

  let attempt = 0;
  let offset = 0;

  while (attempt < UPLOAD_MAX_RETRIES) {
    try {
      const result = await uploadSlice(sessionUri, file, offset, reportProgress, signal);
      if (onProgress) {
        onProgress({ percent: 100, speedBps: 0, loadedBytes: file.size, totalBytes: file.size });
      }
      return result;
    } catch (err) {
      attempt++;
      if (err instanceof SessionExpiredError) throw err;
      if (attempt >= UPLOAD_MAX_RETRIES) throw err;

      try {
        offset = await queryUploadOffset(sessionUri, file.size);
      } catch (queryErr) {
        if (queryErr instanceof SessionExpiredError) throw queryErr;
      }
    }
  }

  throw new Error("Upload failed after maximum retries");
}
