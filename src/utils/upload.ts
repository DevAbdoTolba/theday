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
import { UploadOptions, UploadResult } from "./types";

export class SessionExpiredError extends Error {
  constructor() {
    super("Upload session expired");
    this.name = "SessionExpiredError";
  }
}

/** Query how many bytes Drive has received for a resumable session. */
async function queryUploadOffset(sessionUri: string, totalSize: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      if (xhr.status === 308) {
        // Range header: "bytes=0-{lastByte}"
        const range = xhr.getResponseHeader("Range");
        if (range) {
          const match = range.match(/bytes=0-(\d+)/);
          if (match) return resolve(parseInt(match[1], 10) + 1);
        }
        // No Range header means nothing received yet
        return resolve(0);
      }
      if (xhr.status === 200 || xhr.status === 201) {
        // Upload already complete
        return resolve(totalSize);
      }
      if (xhr.status === 404) {
        return reject(new SessionExpiredError());
      }
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
  onProgress: (loaded: number) => void
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const slice = file.slice(offset);
    const total = file.size;
    const end = total - 1;

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(offset + e.loaded);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 201) {
        try {
          const result = JSON.parse(xhr.responseText) as UploadResult;
          return resolve(result);
        } catch {
          return reject(new Error("Failed to parse Drive response"));
        }
      }
      if (xhr.status === 308) {
        // Incomplete — caller should query offset and resume
        return reject(new Error("Upload incomplete (308)"));
      }
      if (xhr.status === 404) {
        return reject(new SessionExpiredError());
      }
      let msg = `Upload failed (${xhr.status})`;
      try {
        const body = JSON.parse(xhr.responseText) as { error?: { message?: string } };
        if (body.error?.message) msg = body.error.message;
      } catch { /* ignore */ }
      reject(new Error(msg));
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));

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
 * @param options    - Optional progress callback and abort signal.
 * @returns          - The created Drive file { id, name }.
 * @throws           - SessionExpiredError if the session expires and cannot be resumed.
 *                     The caller should create a new session and retry.
 */
export async function uploadFileDirect(
  file: File,
  sessionUri: string,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const { onProgress } = options;

  const reportProgress = (loadedBytes: number) => {
    if (onProgress) {
      const pct = Math.round((loadedBytes / file.size) * 100);
      onProgress(Math.min(pct, 99)); // hold at 99 until Drive confirms
    }
  };

  let attempt = 0;
  let offset = 0;

  while (attempt < UPLOAD_MAX_RETRIES) {
    try {
      const result = await uploadSlice(sessionUri, file, offset, reportProgress);
      if (onProgress) onProgress(100);
      return result;
    } catch (err) {
      attempt++;

      if (err instanceof SessionExpiredError) {
        // Session cannot be resumed — bubble up so caller can create new session
        throw err;
      }

      if (attempt >= UPLOAD_MAX_RETRIES) {
        throw err;
      }

      // Query how many bytes Drive received so far, then resume from that offset
      try {
        offset = await queryUploadOffset(sessionUri, file.size);
      } catch (queryErr) {
        if (queryErr instanceof SessionExpiredError) {
          throw queryErr;
        }
        // If query fails too, retry from last known offset
      }
    }
  }

  throw new Error("Upload failed after maximum retries");
}
