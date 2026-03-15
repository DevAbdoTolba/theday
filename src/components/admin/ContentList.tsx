import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  Skeleton,
  Snackbar,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import LinkIcon from "@mui/icons-material/Link";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import VideoFileIcon from "@mui/icons-material/VideoFile";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import DescriptionIcon from "@mui/icons-material/Description";
import TableChartIcon from "@mui/icons-material/TableChart";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useAuth } from "../../hooks/useAuth";
import { useSlowFeedback } from "../../hooks/useSlowFeedback";
import {
  cacheGet,
  cacheSet,
  cacheInvalidate,
} from "../../lib/session-cache";
import { parseGoogleFile, getYoutubeId } from "../../utils/helpers";

interface DriveFile {
  id: string;
  name: string;
  size?: string;
  mimeType?: string;
}

interface MongoItem {
  _id: string;
  type: "link" | "easter_egg";
  title?: string;
  url?: string;
  name?: string;
  category: string;
  createdAt: string;
}

type ContentEntry =
  | ({ source: "drive" } & DriveFile)
  | ({ source: "mongo" } & MongoItem);

interface ContentListProps {
  classId: string;
  category: string;
  subject: string;
  refreshTrigger: number;
  onUploadFirst?: () => void;
  onContentDeleted?: () => void;
}

// ── Helpers ──────────────────────────────────────────────────

function formatFileSize(sizeStr: string | undefined): string | null {
  if (!sizeStr) return null;
  const bytes = parseInt(sizeStr, 10);
  if (isNaN(bytes)) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function getDomain(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

type FileType = "pdf" | "image" | "video" | "youtube" | "slide" | "doc" | "sheet" | "link" | "unknown";

function detectFileType(item: ContentEntry): FileType {
  if (item.source === "mongo") {
    if (item.type === "link" && item.url) {
      const ytId = getYoutubeId(item.url);
      if (ytId) return "youtube";
      return "link";
    }
    return "unknown";
  }

  // Drive file — use parseGoogleFile for accurate detection
  const parsed = parseGoogleFile({
    id: item.id,
    name: item.name,
    mimeType: item.mimeType ?? "application/octet-stream",
    parents: [],
  });
  if (parsed.type === "youtube") return "youtube";
  if (parsed.type === "pdf") return "pdf";
  if (parsed.type === "image") return "image";
  if (parsed.type === "video") return "video";
  if (parsed.type === "slide") return "slide";
  if (parsed.type === "doc") return "doc";
  if (parsed.type === "sheet") return "sheet";
  return "unknown";
}

function getFileTypeIcon(type: FileType) {
  const sx = { fontSize: 20 };
  switch (type) {
    case "pdf":      return <PictureAsPdfIcon sx={sx} color="error" />;
    case "image":    return <ImageIcon sx={sx} color="success" />;
    case "video":    return <VideoFileIcon sx={sx} color="warning" />;
    case "youtube":  return <PlayCircleOutlineIcon sx={{ ...sx, color: "#FF0000" }} />;
    case "slide":    return <SlideshowIcon sx={sx} color="warning" />;
    case "doc":      return <DescriptionIcon sx={sx} color="primary" />;
    case "sheet":    return <TableChartIcon sx={sx} color="success" />;
    case "link":     return <LinkIcon sx={sx} color="secondary" />;
    default:         return <InsertDriveFileIcon sx={sx} color="action" />;
  }
}

function getFileTypeLabel(type: FileType): { label: string; color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" } {
  switch (type) {
    case "pdf":      return { label: "PDF", color: "error" };
    case "image":    return { label: "Image", color: "success" };
    case "video":    return { label: "Video", color: "warning" };
    case "youtube":  return { label: "YouTube", color: "error" };
    case "slide":    return { label: "Slides", color: "warning" };
    case "doc":      return { label: "Doc", color: "primary" };
    case "sheet":    return { label: "Sheet", color: "success" };
    case "link":     return { label: "Link", color: "secondary" };
    default:         return { label: "File", color: "default" };
  }
}

function getItemUrl(item: ContentEntry, fileType: FileType): string | null {
  if (item.source === "mongo" && item.url) return item.url;
  if (item.source === "drive") {
    const parsed = parseGoogleFile({
      id: item.id,
      name: item.name,
      mimeType: item.mimeType ?? "application/octet-stream",
      parents: [],
    });
    return parsed.url;
  }
  return null;
}

function getDisplayName(item: ContentEntry, fileType: FileType): string {
  if (item.source === "mongo") {
    if (item.type === "link") return item.title ?? "Link";
    return item.name ?? "Content";
  }

  // Drive file — use parseGoogleFile for clean display name
  const parsed = parseGoogleFile({
    id: item.id,
    name: item.name,
    mimeType: item.mimeType ?? "application/octet-stream",
    parents: [],
  });
  return parsed.name;
}

// ── Skeleton ─────────────────────────────────────────────────

function ContentSkeleton() {
  return (
    <Box display="flex" flexDirection="column" gap={1}>
      {[1, 2, 3].map((i) => (
        <Box
          key={i}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 1.5,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <Skeleton variant="circular" width={28} height={28} />
          <Box flex={1}>
            <Skeleton variant="text" width="60%" height={20} />
            <Skeleton variant="text" width="30%" height={14} />
          </Box>
          <Skeleton variant="rounded" width={48} height={22} />
        </Box>
      ))}
    </Box>
  );
}

// ── Main component ───────────────────────────────────────────

export default function ContentList({
  classId,
  category,
  subject,
  refreshTrigger,
  onUploadFirst,
  onContentDeleted,
}: ContentListProps) {
  const { getIdToken } = useAuth();

  const contentCacheKey = `content:${subject}:${category}`;

  // Initialize from cache synchronously — no loading flash on revisit
  const initialCacheRef = useRef(
    cacheGet<ContentEntry[]>(contentCacheKey)
  );
  const [items, setItems] = useState<ContentEntry[]>(
    initialCacheRef.current ?? []
  );
  const [loading, setLoading] = useState(!initialCacheRef.current);
  const [deleteTarget, setDeleteTarget] = useState<ContentEntry | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const loadSlowMsg = useSlowFeedback(loading);
  const deleteSlowMsg = useSlowFeedback(deleting);

  const fetchFromApi = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getIdToken();

      const [driveRes, mongoRes] = await Promise.all([
        fetch(`/api/subjects/files/${encodeURIComponent(subject)}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(
          `/api/admin/content?classId=${encodeURIComponent(classId)}&category=${encodeURIComponent(category)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
      ]);

      const merged: ContentEntry[] = [];

      if (driveRes.ok) {
        const driveData = (await driveRes.json()) as {
          filesData?: Record<string, DriveFile[]>;
        };
        const categoryFiles = driveData.filesData?.[category] ?? [];
        for (const f of categoryFiles) {
          merged.push({ source: "drive", ...f });
        }
      }

      if (mongoRes.ok) {
        const mongoData = (await mongoRes.json()) as { items: MongoItem[] };
        for (const item of mongoData.items) {
          merged.push({ source: "mongo", ...item });
        }
      }

      setItems(merged);
      cacheSet(contentCacheKey, merged);
    } finally {
      setLoading(false);
    }
  }, [getIdToken, classId, category, subject, contentCacheKey]);

  // Fetch from API only on mount when there was no cache hit
  useEffect(() => {
    if (initialCacheRef.current) return;
    void fetchFromApi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When content is added, AddContent updates the cache directly.
  // refreshTrigger signals us to re-read from cache (not API).
  useEffect(() => {
    if (refreshTrigger > 0) {
      const cached = cacheGet<ContentEntry[]>(contentCacheKey);
      if (cached) setItems(cached);
    }
  }, [refreshTrigger, contentCacheKey]);

  const handleRefresh = () => {
    cacheInvalidate(contentCacheKey);
    void fetchFromApi();
  };

  const handleDelete = async (item: ContentEntry) => {
    setDeleting(true);
    const token = await getIdToken();
    let res: Response;

    if (item.source === "drive") {
      res = await fetch("/api/admin/drive-file", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fileId: item.id, classId }),
      });
    } else {
      res = await fetch("/api/admin/content", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ _id: item._id, classId }),
      });
    }

    setDeleteTarget(null);
    setDeleting(false);

    if (res.ok) {
      // Optimistic remove — no API re-fetch
      setItems((prev) => {
        const next = prev.filter((i) => {
          if (i.source === "drive" && item.source === "drive")
            return i.id !== item.id;
          if (i.source === "mongo" && item.source === "mongo")
            return i._id !== item._id;
          return true;
        });
        cacheSet(contentCacheKey, next);
        return next;
      });
      setSnackbar({
        open: true,
        message: "Deleted successfully",
        severity: "success",
      });
      onContentDeleted?.();
    } else {
      const data = (await res.json()) as { error: string };
      setSnackbar({
        open: true,
        message: data.error ?? "Failed to delete",
        severity: "error",
      });
    }
  };

  if (loading) {
    return (
      <Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Typography variant="subtitle2" color="text.secondary">
            Loading content...
          </Typography>
          {loadSlowMsg && (
            <Typography variant="caption" color="warning.main">
              {loadSlowMsg}
            </Typography>
          )}
        </Box>
        <LinearProgress sx={{ mb: 1.5, borderRadius: 1 }} />
        <ContentSkeleton />
      </Box>
    );
  }

  if (items.length === 0) {
    return (
      <Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            mb: 1,
          }}
        >
          <Tooltip title="Refresh content">
            <IconButton
              size="small"
              onClick={handleRefresh}
              aria-label="Refresh content"
            >
              <RefreshOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          p={4}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <UploadFileIcon
            sx={{ fontSize: 48, color: "text.disabled", mb: 1 }}
          />
          <Typography variant="body2" color="text.secondary" gutterBottom>
            No content in this category yet
          </Typography>
          {onUploadFirst && (
            <Button variant="outlined" size="small" onClick={onUploadFirst}>
              Upload your first file
            </Button>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <Typography variant="subtitle2">
          Content ({items.length})
        </Typography>
        <Tooltip title="Refresh content">
          <IconButton
            size="small"
            onClick={handleRefresh}
            aria-label="Refresh content"
          >
            <RefreshOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <Box display="flex" flexDirection="column" gap={1}>
        {items.map((item, idx) => {
          const fileType = detectFileType(item);
          const typeLabel = getFileTypeLabel(fileType);
          const url = getItemUrl(item, fileType);
          const displayName = getDisplayName(item, fileType);

          return (
            <Box
              key={item.source === "drive" ? item.id : item._id ?? idx}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 1.5,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                transition: "background-color 0.15s, border-color 0.15s",
                "&:hover": {
                  bgcolor: "action.hover",
                  borderColor: "primary.light",
                },
              }}
            >
              {/* Type icon */}
              <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                {getFileTypeIcon(fileType)}
              </Box>

              {/* Name + meta */}
              <Box flex={1} minWidth={0}>
                <Typography
                  variant="body2"
                  fontWeight={500}
                  noWrap
                  title={displayName}
                >
                  {displayName}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.25 }}>
                  {item.source === "drive" && item.size && (
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(item.size)}
                    </Typography>
                  )}
                  {item.source === "mongo" && item.type === "link" && item.url && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      noWrap
                      title={item.url}
                    >
                      {getDomain(item.url)}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Type chip */}
              <Chip
                label={typeLabel.label}
                color={typeLabel.color}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 500, fontSize: "0.7rem", height: 22, flexShrink: 0 }}
              />

              {/* Open button */}
              {url && (
                <Tooltip title="Open">
                  <IconButton
                    size="small"
                    component="a"
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${displayName}`}
                    sx={{ color: "primary.main" }}
                  >
                    <OpenInNewIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              {/* Delete button */}
              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  color="error"
                  aria-label={`Delete ${displayName}`}
                  onClick={() => setDeleteTarget(item)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          );
        })}
      </Box>

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete content</DialogTitle>
        <DialogContent>
          <Typography>
            Delete &quot;{deleteTarget ? getDisplayName(deleteTarget, detectFileType(deleteTarget)) : ""}&quot;?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {deleteTarget?.source === "drive"
              ? "This will remove the file from Google Drive. This cannot be undone."
              : "This cannot be undone."}
          </Typography>
          {deleting && <LinearProgress sx={{ mt: 2, borderRadius: 1 }} />}
          {deleteSlowMsg && (
            <Typography variant="caption" color="warning.main" sx={{ mt: 1 }}>
              {deleteSlowMsg}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button disabled={deleting} onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={deleting}
            onClick={() => deleteTarget && void handleDelete(deleteTarget)}
          >
            {deleting ? "Deleting..." : "Delete"}
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
    </Box>
  );
}
