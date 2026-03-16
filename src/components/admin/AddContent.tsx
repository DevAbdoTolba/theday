import React, { useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  Snackbar,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import VideoLibraryOutlinedIcon from "@mui/icons-material/VideoLibraryOutlined";
import { useAuth } from "../../hooks/useAuth";
import { useSlowFeedback } from "../../hooks/useSlowFeedback";
import { cacheGet, cacheSet } from "../../lib/session-cache";
import {
  UPLOAD_SOFT_LIMIT,
  UPLOAD_HARD_LIMIT,
  VIDEO_MIME_TYPES,
} from "../../lib/constants";
import { uploadFileDirect, SessionExpiredError, UploadAbortedError } from "../../utils/upload";
import { getYoutubeId } from "../../utils/helpers";
import { UploadProgress as UploadProgressInfo } from "../../utils/types";

interface AddContentProps {
  classId: string;
  folderId: string;
  category: string;
  subject: string;
  onContentAdded: () => void;
}

type Mode = "file" | "link" | "video-youtube" | "video-upload";

/** Strip file extension: "lecture.mp4" → "lecture" */
function stripExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot <= 0) return filename;
  return filename.slice(0, lastDot);
}

/** Format bytes/sec as human-readable speed */
function formatSpeed(bps: number): string {
  if (bps < 1024) return `${bps} B/s`;
  if (bps < 1024 * 1024) return `${(bps / 1024).toFixed(0)} KB/s`;
  return `${(bps / (1024 * 1024)).toFixed(1)} MB/s`;
}

export default function AddContent({
  classId,
  folderId,
  category,
  subject,
  onContentAdded,
}: AddContentProps) {
  const { getIdToken } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<Mode>("file");
  const [videoSubMode, setVideoSubMode] = useState<"video-youtube" | "video-upload">("video-youtube");

  // File upload state
  const [progress, setProgress] = useState<number | null>(null);
  const [uploadSpeed, setUploadSpeed] = useState<number>(0);
  const [processing, setProcessing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [duplicateDialog, setDuplicateDialog] = useState(false);
  const [duplicateFileId, setDuplicateFileId] = useState<string | null>(null);

  // Size confirmation dialog (2 GB soft limit)
  const [sizeConfirmDialog, setSizeConfirmDialog] = useState(false);
  const [pendingLargeFile, setPendingLargeFile] = useState<File | null>(null);
  const [pendingLargeReplaceId, setPendingLargeReplaceId] = useState<string | null>(null);
  const [pendingLargeFolderId, setPendingLargeFolderId] = useState<string | null>(null);

  // Link state
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkSubmitting, setLinkSubmitting] = useState(false);

  // Video YouTube state
  const [ytUrl, setYtUrl] = useState("");
  const [ytTitle, setYtTitle] = useState("");
  const [ytSubmitting, setYtSubmitting] = useState(false);

  // Video upload state — file selected first, upload starts on user click
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDragging, setVideoDragging] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const progressRef = useRef(0);

  // Shared
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const isUploading = progress !== null;
  const slowMsg = useSlowFeedback(processing || linkSubmitting || ytSubmitting);

  // ── Helpers ───────────────────────────────────────────────────

  const showError = (message: string) =>
    setSnackbar({ open: true, message, severity: "error" });

  const showSuccess = (message: string) =>
    setSnackbar({ open: true, message, severity: "success" });

  const addToCache = (entry: { id: string; name: string; size?: number; mimeType?: string }) => {
    const cacheKey = `content:${subject}:${category}`;
    const cached = cacheGet<unknown[]>(cacheKey) ?? [];
    cacheSet(cacheKey, [
      ...cached,
      {
        source: "drive",
        id: entry.id,
        name: entry.name,
        size: entry.size != null ? String(entry.size) : undefined,
        mimeType: entry.mimeType ?? "application/octet-stream",
      },
    ]);
  };

  const handleProgress = (p: UploadProgressInfo) => {
    progressRef.current = p.percent;
    setProgress(p.percent);
    setUploadSpeed(p.speedBps);
    if (p.percent >= 99) setProcessing(true);
  };

  // ── Direct upload via resumable session ───────────────────────

  const directUpload = async (
    file: File,
    targetFolderId: string,
    fileName: string,
    signal?: AbortSignal
  ): Promise<{ id: string; name: string }> => {
    const createSession = async () => {
      const token = await getIdToken();
      const res = await fetch("/api/admin/upload-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fileName,
          mimeType: file.type || "application/octet-stream",
          folderId: targetFolderId,
          classId,
          origin: typeof window !== "undefined" ? window.location.origin : "",
        }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? `Failed to create upload session (${res.status})`);
      }
      const { sessionUri } = (await res.json()) as { sessionUri: string };
      return sessionUri;
    };

    let sessionUri = await createSession();

    try {
      return await uploadFileDirect(file, sessionUri, { onProgress: handleProgress, signal });
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        sessionUri = await createSession();
        return await uploadFileDirect(file, sessionUri, { onProgress: handleProgress, signal });
      }
      throw err;
    }
  };

  // ── Size validation ───────────────────────────────────────────

  const validateSizeAndProceed = (
    file: File,
    targetFolderId: string,
    fileName: string,
    replaceFileId?: string | null
  ): boolean => {
    if (file.size > UPLOAD_HARD_LIMIT) {
      setPendingLargeFile(file);
      setPendingLargeReplaceId(replaceFileId ?? null);
      setPendingLargeFolderId(targetFolderId);
      setSizeConfirmDialog(true);
      return false;
    }
    if (file.size > UPLOAD_SOFT_LIMIT) {
      setPendingLargeFile(file);
      setPendingLargeReplaceId(replaceFileId ?? null);
      setPendingLargeFolderId(targetFolderId);
      setSizeConfirmDialog(true);
      return false;
    }
    return true;
  };

  // ── File upload (File tab) ────────────────────────────────────

  const uploadFile = async (file: File, replaceFileId?: string, skipSizeCheck?: boolean) => {
    if (!skipSizeCheck) {
      const proceed = validateSizeAndProceed(file, folderId, file.name, replaceFileId);
      if (!proceed) return;
    }

    try {
      if (!replaceFileId) {
        const token = await getIdToken();
        const checkRes = await fetch(
          `/api/subjects/files/${encodeURIComponent(subject)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (checkRes.ok) {
          const checkData = (await checkRes.json()) as {
            filesData?: Record<string, { name: string; id: string }[]>;
          };
          const categoryFiles = checkData.filesData?.[category] ?? [];
          const existing = categoryFiles.find((f) => f.name === file.name);
          if (existing) {
            setPendingFile(file);
            setDuplicateFileId(existing.id);
            setDuplicateDialog(true);
            return;
          }
        }
      }

      if (replaceFileId) {
        const delToken = await getIdToken();
        const delRes = await fetch("/api/admin/drive-file", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${delToken}`,
          },
          body: JSON.stringify({ fileId: replaceFileId, classId }),
        });
        if (!delRes.ok) {
          throw new Error("Failed to delete existing file before replacement");
        }
      }

      const created = await directUpload(file, folderId, file.name);

      addToCache({ id: created.id, name: created.name, size: file.size, mimeType: file.type });
      setProgress(null);
      setProcessing(false);
      setUploadSpeed(0);
      showSuccess(`"${file.name}" uploaded`);
      onContentAdded();
    } catch (err) {
      setProgress(null);
      setProcessing(false);
      setUploadSpeed(0);
      showError(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (VIDEO_MIME_TYPES.includes(file.type as typeof VIDEO_MIME_TYPES[number])) {
      showError("Video files must be uploaded using the Video tab");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    void uploadFile(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  // ── Link submit ──────────────────────────────────────────────

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkTitle.trim() || !linkUrl.trim()) return;

    try {
      new URL(linkUrl);
    } catch {
      showError("Please enter a valid URL");
      return;
    }

    setLinkSubmitting(true);
    try {
      const token = await getIdToken();
      const res = await fetch("/api/admin/link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          url: linkUrl.trim(),
          title: linkTitle.trim(),
          folderId,
          classId,
        }),
      });

      if (res.ok) {
        const created = (await res.json()) as { id: string; name: string };
        addToCache({ id: created.id, name: created.name, mimeType: "text/plain" });
        setLinkTitle("");
        setLinkUrl("");
        showSuccess("Link added");
        onContentAdded();
      } else {
        const data = (await res.json()) as { error?: string };
        showError(data.error ?? "Failed to add link");
      }
    } finally {
      setLinkSubmitting(false);
    }
  };

  // ── YouTube link submit ───────────────────────────────────────

  const handleYouTubeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ytUrl.trim() || !ytTitle.trim()) return;

    const videoId = getYoutubeId(ytUrl.trim());
    if (!videoId) {
      showError("Please enter a valid YouTube video URL (youtube.com or youtu.be)");
      return;
    }

    setYtSubmitting(true);
    try {
      const token = await getIdToken();
      const res = await fetch("/api/admin/link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          url: ytUrl.trim(),
          title: ytTitle.trim(),
          folderId,
          classId,
        }),
      });

      if (res.ok) {
        const created = (await res.json()) as { id: string; name: string };
        addToCache({ id: created.id, name: created.name, mimeType: "text/plain" });
        setYtUrl("");
        setYtTitle("");
        showSuccess("YouTube link added");
        onContentAdded();
      } else {
        const data = (await res.json()) as { error?: string };
        showError(data.error ?? "Failed to add YouTube link");
      }
    } finally {
      setYtSubmitting(false);
    }
  };

  // ── Video file upload ────────────────────────────────────────
  // Flow: select file → edit title → click Upload → uploading → done

  const stageVideoFile = (file: File, skipSizeCheck?: boolean) => {
    if (!VIDEO_MIME_TYPES.includes(file.type as typeof VIDEO_MIME_TYPES[number])) {
      showError("Only video files are accepted (MP4, MOV, AVI, MKV, WebM)");
      return;
    }

    if (!skipSizeCheck) {
      const proceed = validateSizeAndProceed(file, folderId, file.name);
      if (!proceed) return;
    }

    setVideoTitle(stripExtension(file.name));
    setVideoFile(file);
  };

  /** User clicks "Upload" — upload directly with the staging name */
  const handleStartVideoUpload = async () => {
    if (!videoFile) return;

    const title = videoTitle.trim() || stripExtension(videoFile.name);
    const stagingName = `${title}__${category}__${subject}`;
    const controller = new AbortController();
    abortRef.current = controller;
    progressRef.current = 0;

    try {
      // Upload directly with the staging name — no rename step needed
      const created = await directUpload(videoFile, folderId, stagingName, controller.signal);
      addToCache({ id: created.id, name: created.name, size: videoFile.size, mimeType: videoFile.type });
      showSuccess(`"${title}" uploaded`);
      onContentAdded();
    } catch (err) {
      if (err instanceof UploadAbortedError) {
        // User cancelled — no error snackbar
      } else if (
        err instanceof Error &&
        err.message.includes("Network error") &&
        progressRef.current >= 98
      ) {
        // All bytes were sent but the response was lost (CORS / network hiccup).
        // The file is on Drive with the correct staging name already.
        showSuccess(`"${title}" uploaded — refresh if not visible`);
        onContentAdded();
      } else {
        showError(err instanceof Error ? err.message : "Upload failed");
      }
    } finally {
      abortRef.current = null;
      setProgress(null);
      setProcessing(false);
      setUploadSpeed(0);
      setVideoFile(null);
      setVideoTitle("");
    }
  };

  const handleCancelVideo = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setProgress(null);
    setProcessing(false);
    setUploadSpeed(0);
    setVideoFile(null);
    setVideoTitle("");
  };

  const handleVideoFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    stageVideoFile(files[0]);
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const handleVideoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setVideoDragging(false);
    handleVideoFiles(e.dataTransfer.files);
  };

  // ── Size confirmation dialog logic ────────────────────────────

  const isHardLimitExceeded = (pendingLargeFile?.size ?? 0) > UPLOAD_HARD_LIMIT;

  const handleSizeConfirm = () => {
    const file = pendingLargeFile;
    const replaceId = pendingLargeReplaceId;
    setSizeConfirmDialog(false);
    setPendingLargeFile(null);
    setPendingLargeReplaceId(null);
    setPendingLargeFolderId(null);
    if (!file || isHardLimitExceeded) return;

    if (mode === "video-upload") {
      stageVideoFile(file, true);
    } else {
      void uploadFile(file, replaceId ?? undefined, true);
    }
  };

  const handleSizeCancel = () => {
    setSizeConfirmDialog(false);
    setPendingLargeFile(null);
    setPendingLargeReplaceId(null);
    setPendingLargeFolderId(null);
  };

  // ── Render ───────────────────────────────────────────────────

  const isVideoMode = mode === "video-youtube" || mode === "video-upload";
  const videoReady = videoFile !== null && !isUploading;
  const videoInProgress = isUploading && videoFile !== null;

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="subtitle2" color="text.secondary">
          Add Content
        </Typography>
        <ToggleButtonGroup
          value={isVideoMode ? "video" : mode}
          exclusive
          onChange={(_, v: "file" | "link" | "video" | null) => {
            if (!v) return;
            if (v === "video") {
              setMode(videoSubMode);
            } else {
              setMode(v as Mode);
            }
          }}
          size="small"
          aria-label="Content type"
        >
          <ToggleButton value="file" aria-label="Upload file">
            <UploadFileOutlinedIcon fontSize="small" sx={{ mr: 0.5 }} />
            File
          </ToggleButton>
          <ToggleButton value="link" aria-label="Add link">
            <LinkOutlinedIcon fontSize="small" sx={{ mr: 0.5 }} />
            Link
          </ToggleButton>
          <ToggleButton value="video" aria-label="Add video">
            <VideoLibraryOutlinedIcon fontSize="small" sx={{ mr: 0.5 }} />
            Video
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* ── File tab ── */}
      {mode === "file" && (
        <Box>
          <Box
            sx={{
              border: "2px dashed",
              borderColor: dragging ? "primary.main" : "divider",
              borderRadius: 2,
              p: 3,
              textAlign: "center",
              cursor: isUploading ? "default" : "pointer",
              bgcolor: dragging ? "action.hover" : "background.paper",
              opacity: isUploading ? 0.6 : 1,
              pointerEvents: isUploading ? "none" : "auto",
              transition: "all 0.2s",
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <UploadFileOutlinedIcon
              sx={{ fontSize: 36, color: "text.secondary", mb: 0.5 }}
            />
            <Typography variant="body2" color="text.secondary">
              Drag & drop or click to select
            </Typography>
            <Typography variant="caption" color="text.disabled">
              Up to 2 GB (5 GB max)
            </Typography>
          </Box>

          <input
            ref={inputRef}
            type="file"
            style={{ display: "none" }}
            onChange={(e) => handleFiles(e.target.files)}
          />

          {progress !== null && !videoFile && (
            <UploadProgressBar progress={progress} speed={uploadSpeed} processing={processing} slowMsg={slowMsg} />
          )}
        </Box>
      )}

      {/* ── Link tab ── */}
      {mode === "link" && (
        <Box
          component="form"
          onSubmit={(e) => void handleLinkSubmit(e)}
          sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
        >
          <TextField
            label="Title"
            fullWidth
            size="small"
            value={linkTitle}
            onChange={(e) => setLinkTitle(e.target.value)}
            required
            disabled={linkSubmitting}
          />
          <TextField
            label="URL"
            fullWidth
            size="small"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://..."
            required
            disabled={linkSubmitting}
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              type="submit"
              variant="contained"
              size="small"
              disabled={linkSubmitting || !linkTitle.trim() || !linkUrl.trim()}
              sx={{ minWidth: 100 }}
            >
              {linkSubmitting ? "Adding..." : "Add Link"}
            </Button>
            {slowMsg && (
              <Typography variant="caption" color="warning.main">
                {slowMsg}
              </Typography>
            )}
          </Box>
        </Box>
      )}

      {/* ── Video tab ── */}
      {isVideoMode && (
        <Box>
          <RadioGroup
            row
            value={videoSubMode}
            onChange={(_, v) => {
              const sub = v as "video-youtube" | "video-upload";
              setVideoSubMode(sub);
              setMode(sub);
            }}
            sx={{ mb: 1.5 }}
          >
            <FormControlLabel value="video-youtube" control={<Radio size="small" />} label="YouTube Link" />
            <FormControlLabel value="video-upload" control={<Radio size="small" />} label="Upload Video File" />
          </RadioGroup>

          {/* YouTube Link sub-option */}
          {mode === "video-youtube" && (
            <Box
              component="form"
              onSubmit={(e) => void handleYouTubeSubmit(e)}
              sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
            >
              <TextField
                label="YouTube URL"
                fullWidth
                size="small"
                value={ytUrl}
                onChange={(e) => setYtUrl(e.target.value)}
                placeholder="https://youtu.be/... or https://www.youtube.com/watch?v=..."
                required
                disabled={ytSubmitting}
              />
              <TextField
                label="Title"
                fullWidth
                size="small"
                value={ytTitle}
                onChange={(e) => setYtTitle(e.target.value)}
                required
                disabled={ytSubmitting}
              />
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="small"
                  disabled={ytSubmitting || !ytUrl.trim() || !ytTitle.trim()}
                  sx={{ minWidth: 120 }}
                >
                  {ytSubmitting ? "Adding..." : "Add YouTube Link"}
                </Button>
                {slowMsg && (
                  <Typography variant="caption" color="warning.main">
                    {slowMsg}
                  </Typography>
                )}
              </Box>
            </Box>
          )}

          {/* Upload Video File sub-option */}
          {mode === "video-upload" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {/* Drop zone — hidden once a file is selected and uploading */}
              {!videoFile && (
                <>
                  <Box
                    sx={{
                      border: "2px dashed",
                      borderColor: videoDragging ? "primary.main" : "divider",
                      borderRadius: 2,
                      p: 3,
                      textAlign: "center",
                      cursor: "pointer",
                      bgcolor: videoDragging ? "action.hover" : "background.paper",
                      transition: "all 0.2s",
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setVideoDragging(true);
                    }}
                    onDragLeave={() => setVideoDragging(false)}
                    onDrop={handleVideoDrop}
                    onClick={() => videoInputRef.current?.click()}
                  >
                    <VideoLibraryOutlinedIcon
                      sx={{ fontSize: 36, color: "text.secondary", mb: 0.5 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Drag & drop or click to select a video
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      MP4, MOV, AVI, MKV, WebM · Up to 2 GB (5 GB max)
                    </Typography>
                  </Box>

                  <input
                    ref={videoInputRef}
                    type="file"
                    accept={VIDEO_MIME_TYPES.join(",")}
                    style={{ display: "none" }}
                    onChange={(e) => handleVideoFiles(e.target.files)}
                  />
                </>
              )}

              {/* Title + Upload/Cancel — shown after file is selected */}
              {videoFile && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {/* Progress bar — shown only during upload */}
                  {videoInProgress && (
                    <UploadProgressBar
                      progress={progress!}
                      speed={uploadSpeed}
                      processing={processing}
                      slowMsg={slowMsg}
                      fileName={videoFile.name}
                    />
                  )}

                  {/* Title field — editable before upload starts */}
                  <TextField
                    label="Video Title"
                    fullWidth
                    size="small"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="e.g. Lecture 5 — Newton's Laws"
                    helperText={videoReady ? `File: ${videoFile.name}` : undefined}
                    disabled={videoInProgress}
                  />

                  {/* Upload + Cancel buttons */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {videoReady && (
                      <Button
                        variant="contained"
                        size="small"
                        disabled={!videoTitle.trim()}
                        onClick={() => void handleStartVideoUpload()}
                        sx={{ minWidth: 100 }}
                      >
                        Upload
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      size="small"
                      color="inherit"
                      onClick={handleCancelVideo}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </Box>
      )}

      {/* Duplicate confirmation dialog */}
      <Dialog
        open={duplicateDialog}
        onClose={() => {
          setDuplicateDialog(false);
          setPendingFile(null);
          setDuplicateFileId(null);
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Duplicate File</DialogTitle>
        <DialogContent>
          <Typography>
            &quot;{pendingFile?.name}&quot; already exists. Replace it?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDuplicateDialog(false);
              setPendingFile(null);
              setDuplicateFileId(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={() => {
              const file = pendingFile;
              const fileId = duplicateFileId;
              setDuplicateDialog(false);
              setPendingFile(null);
              setDuplicateFileId(null);
              if (file) void uploadFile(file, fileId ?? undefined);
            }}
          >
            Replace
          </Button>
        </DialogActions>
      </Dialog>

      {/* Size confirmation / hard limit dialog */}
      <Dialog
        open={sizeConfirmDialog}
        onClose={handleSizeCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {isHardLimitExceeded ? "File Too Large" : "Large File"}
        </DialogTitle>
        <DialogContent>
          {isHardLimitExceeded ? (
            <Box>
              <Typography gutterBottom>
                This file exceeds the 5 GB limit and cannot be uploaded through this interface.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Upload it manually by opening the Drive folder directly:
              </Typography>
              <Button
                component="a"
                href={`https://drive.google.com/drive/folders/${pendingLargeFolderId ?? folderId}`}
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                sx={{ mt: 1 }}
              >
                Open Drive Folder
              </Button>
            </Box>
          ) : (
            <Typography>
              This file is over 2 GB. The upload may take a while depending on your connection. Continue?
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSizeCancel}>
            {isHardLimitExceeded ? "Close" : "Cancel"}
          </Button>
          {!isHardLimitExceeded && (
            <Button variant="contained" onClick={handleSizeConfirm}>
              Continue
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}

// ── Sub-components ────────────────────────────────────────────

function UploadProgressBar({
  progress,
  speed,
  processing,
  slowMsg,
  fileName,
}: {
  progress: number;
  speed: number;
  processing: boolean;
  slowMsg: string | null;
  fileName?: string;
}) {
  return (
    <Box sx={{ mt: 1 }}>
      {fileName && (
        <Typography variant="caption" color="text.secondary" noWrap sx={{ mb: 0.25, display: "block" }}>
          {fileName}
        </Typography>
      )}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 0.5,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {processing ? "Saving to Google Drive..." : `Uploading ${progress}%`}
        </Typography>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          {!processing && speed > 0 && (
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              {formatSpeed(speed)}
            </Typography>
          )}
          {slowMsg && (
            <Typography variant="caption" color="warning.main">
              {slowMsg}
            </Typography>
          )}
        </Box>
      </Box>
      <LinearProgress
        variant={processing ? "indeterminate" : "determinate"}
        value={processing ? undefined : progress}
      />
    </Box>
  );
}
