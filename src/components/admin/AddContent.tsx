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
  Snackbar,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import { useAuth } from "../../hooks/useAuth";
import { useSlowFeedback } from "../../hooks/useSlowFeedback";
import { cacheGet, cacheSet } from "../../lib/session-cache";

const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

interface AddContentProps {
  classId: string;
  folderId: string;
  category: string;
  subject: string;
  onContentAdded: () => void;
}

type Mode = "file" | "link";

export default function AddContent({
  classId,
  folderId,
  category,
  subject,
  onContentAdded,
}: AddContentProps) {
  const { getIdToken } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<Mode>("file");

  // File upload state
  const [progress, setProgress] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [duplicateDialog, setDuplicateDialog] = useState(false);
  const [duplicateFileId, setDuplicateFileId] = useState<string | null>(null);

  // Link state
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkSubmitting, setLinkSubmitting] = useState(false);

  // Shared
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "success" });

  const isUploading = progress !== null;
  const slowMsg = useSlowFeedback(processing || linkSubmitting);

  // ── File upload ──────────────────────────────────────────────

  const uploadFile = async (file: File, replaceFileId?: string) => {
    if (file.size > MAX_SIZE_BYTES) {
      setSnackbar({ open: true, message: "File exceeds 50 MB limit", severity: "error" });
      return;
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

      const token = await getIdToken();
      const params = new URLSearchParams({
        fileName: file.name,
        folderId,
        classId,
        mimeType: file.type || "application/octet-stream",
      });

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            setProgress(pct);
            if (pct >= 100) setProcessing(true);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else {
            let msg = `Upload failed (${xhr.status})`;
            try {
              const body = JSON.parse(xhr.responseText) as { error?: string };
              if (body.error) msg = body.error;
            } catch { /* ignore */ }
            reject(new Error(msg));
          }
        };

        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.open("POST", `/api/admin/upload?${params.toString()}`);
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
        xhr.send(file);
      });

      // Optimistic: add to cache so ContentList picks it up without re-fetching
      const cacheKey = `content:${subject}:${category}`;
      const cached = cacheGet<unknown[]>(cacheKey) ?? [];
      cacheSet(cacheKey, [
        ...cached,
        {
          source: "drive",
          id: `temp-${Date.now()}`,
          name: file.name,
          size: String(file.size),
          mimeType: file.type,
        },
      ]);

      setProgress(null);
      setProcessing(false);
      setSnackbar({ open: true, message: `"${file.name}" uploaded`, severity: "success" });
      onContentAdded();
    } catch (err) {
      setProgress(null);
      setProcessing(false);
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : "Upload failed",
        severity: "error",
      });
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    void uploadFile(files[0]);
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
      setSnackbar({ open: true, message: "Please enter a valid URL", severity: "error" });
      return;
    }

    setLinkSubmitting(true);
    try {
      const token = await getIdToken();
      // Create a Drive file named "{url} {title}" so the student-facing
      // parser picks it up as a clickable link.
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

        // Optimistic: add as a Drive entry so ContentList shows it instantly
        const cacheKey = `content:${subject}:${category}`;
        const cached = cacheGet<unknown[]>(cacheKey) ?? [];
        cacheSet(cacheKey, [
          ...cached,
          {
            source: "drive",
            id: created.id,
            name: created.name,
            mimeType: "text/plain",
          },
        ]);

        setLinkTitle("");
        setLinkUrl("");
        setSnackbar({ open: true, message: "Link added", severity: "success" });
        onContentAdded();
      } else {
        const data = (await res.json()) as { error?: string };
        setSnackbar({
          open: true,
          message: data.error ?? "Failed to add link",
          severity: "error",
        });
      }
    } finally {
      setLinkSubmitting(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────

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
          value={mode}
          exclusive
          onChange={(_, v: Mode | null) => {
            if (v) setMode(v);
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
        </ToggleButtonGroup>
      </Box>

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
              Max 50 MB
            </Typography>
          </Box>

          <input
            ref={inputRef}
            type="file"
            style={{ display: "none" }}
            onChange={(e) => handleFiles(e.target.files)}
          />

          {progress !== null && (
            <Box sx={{ mt: 1.5 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 0.5,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  {processing
                    ? "Saving to Google Drive..."
                    : `Uploading ${progress}%`}
                </Typography>
                {slowMsg && (
                  <Typography variant="caption" color="warning.main">
                    {slowMsg}
                  </Typography>
                )}
              </Box>
              <LinearProgress
                variant={processing ? "indeterminate" : "determinate"}
                value={processing ? undefined : progress}
              />
            </Box>
          )}
        </Box>
      )}

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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
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
