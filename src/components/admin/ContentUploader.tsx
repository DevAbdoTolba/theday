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
  Snackbar,
  Typography,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useAuth } from "../../hooks/useAuth";

const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

interface ContentUploaderProps {
  folderId: string;
  category: string;
  subject: string;
  onUploadComplete: () => void;
}

export default function ContentUploader({
  folderId,
  category,
  subject,
  onUploadComplete,
}: ContentUploaderProps) {
  const { getIdToken } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  // Duplicate / replace detection
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [duplicateDialog, setDuplicateDialog] = useState(false);
  const [duplicateFileId, setDuplicateFileId] = useState<string | null>(null);

  const uploadFile = async (file: File, replaceFileId?: string) => {
    if (file.size > MAX_SIZE_BYTES) {
      setSnackbar({
        open: true,
        message: "File exceeds 50 MB limit",
        severity: "error",
      });
      return;
    }

    try {
      // Check for duplicates before uploading (T033)
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

      // If replacing, delete old file first (T030)
      if (replaceFileId) {
        const delToken = await getIdToken();
        await fetch("/api/admin/drive-file", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${delToken}`,
          },
          body: JSON.stringify({ fileId: replaceFileId }),
        });
      }

      // Get upload session
      const token = await getIdToken();
      const sessionRes = await fetch("/api/admin/upload-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          folderId,
        }),
      });

      if (!sessionRes.ok) {
        const data = (await sessionRes.json()) as { error: string };
        // Revoked admin handling (T032)
        if (sessionRes.status === 403) {
          setSnackbar({
            open: true,
            message: "Access revoked. Redirecting...",
            severity: "error",
          });
          setTimeout(() => {
            window.location.href = "/";
          }, 2000);
          return;
        }
        setSnackbar({
          open: true,
          message: data.error ?? "Failed to start upload",
          severity: "error",
        });
        return;
      }

      const { sessionUri } = (await sessionRes.json()) as { sessionUri: string };

      // Upload directly to Drive via XHR for progress tracking
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error("Upload network error"));

        xhr.open("PUT", sessionUri);
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
        xhr.send(file);
      });

      setProgress(null);
      setSnackbar({
        open: true,
        message: `${file.name} uploaded successfully`,
        severity: "success",
      });
      onUploadComplete();
    } catch (err) {
      setProgress(null);
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
    // Reset input so re-selecting the same file triggers onChange (I-7)
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Upload File
      </Typography>

      {/* Drop zone */}
      <Box
        sx={{
          border: "2px dashed",
          borderColor: dragging ? "primary.main" : "divider",
          borderRadius: 2,
          p: 3,
          textAlign: "center",
          cursor: "pointer",
          bgcolor: dragging ? "action.hover" : "background.paper",
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
        <UploadFileIcon sx={{ fontSize: 40, color: "text.secondary", mb: 1 }} />
        <Typography variant="body2" color="text.secondary">
          Drag & drop a file here, or click to select
        </Typography>
        <Typography variant="caption" color="text.secondary">
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
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption">{progress}%</Typography>
          <LinearProgress variant="determinate" value={progress} />
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
            A file named &quot;{pendingFile?.name}&quot; already exists in this category. Do you
            want to replace it?
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
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
