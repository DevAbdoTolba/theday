import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  LinearProgress,
  Skeleton,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import LinkIcon from "@mui/icons-material/Link";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useAuth } from "../../hooks/useAuth";
import { useSlowFeedback } from "../../hooks/useSlowFeedback";

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
}

function ContentSkeleton() {
  return (
    <Box display="flex" flexDirection="column" gap={1}>
      {[1, 2, 3].map((i) => (
        <Card key={i} variant="outlined">
          <CardContent
            sx={{ display: "flex", alignItems: "center", gap: 1, py: 1, "&:last-child": { pb: 1 } }}
          >
            <Skeleton variant="circular" width={24} height={24} />
            <Box flex={1}>
              <Skeleton variant="text" width="60%" height={20} />
              <Skeleton variant="text" width="30%" height={14} />
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}

export default function ContentList({
  classId,
  category,
  subject,
  refreshTrigger,
  onUploadFirst,
}: ContentListProps) {
  const { getIdToken } = useAuth();
  const [items, setItems] = useState<ContentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<ContentEntry | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const loadSlowMsg = useSlowFeedback(loading);
  const deleteSlowMsg = useSlowFeedback(deleting);

  const fetchItems = useCallback(async () => {
    setLoading(true);
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
    setLoading(false);
  }, [getIdToken, classId, category, subject]);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems, refreshTrigger]);

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
        body: JSON.stringify({ fileId: item.id }),
      });
    } else {
      res = await fetch("/api/admin/content", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ _id: item._id }),
      });
    }

    setDeleteTarget(null);
    setDeleting(false);

    if (res.ok) {
      setSnackbar({ open: true, message: "Deleted successfully", severity: "success" });
      void fetchItems();
    } else {
      const data = (await res.json()) as { error: string };
      setSnackbar({
        open: true,
        message: data.error ?? "Failed to delete",
        severity: "error",
      });
    }
  };

  const getItemLabel = (item: ContentEntry): string => {
    if (item.source === "drive") return item.name;
    if (item.type === "link") return item.title ?? "Link";
    return item.name ?? "Content";
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
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        p={4}
        sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}
      >
        <UploadFileIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
        <Typography variant="body2" color="text.secondary" gutterBottom>
          No content in this category yet
        </Typography>
        {onUploadFirst && (
          <Button variant="outlined" size="small" onClick={onUploadFirst}>
            Upload your first file
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Content ({items.length})
      </Typography>
      <Box display="flex" flexDirection="column" gap={1}>
        {items.map((item, idx) => (
          <Card key={item.source === "drive" ? item.id : item._id ?? idx} variant="outlined">
            <CardContent
              sx={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                py: 1,
                "&:last-child": { pb: 1 },
              }}
            >
              <Box display="flex" alignItems="flex-start" gap={1} flex={1} minWidth={0}>
                {item.source === "drive" && (
                  <InsertDriveFileIcon fontSize="small" color="primary" sx={{ mt: 0.2 }} />
                )}
                {item.source === "mongo" && item.type === "link" && (
                  <LinkIcon fontSize="small" color="secondary" sx={{ mt: 0.2 }} />
                )}
                {item.source === "mongo" && item.type !== "link" && (
                  <InsertDriveFileIcon fontSize="small" color="action" sx={{ mt: 0.2 }} />
                )}
                <Box minWidth={0}>
                  <Typography variant="body2" noWrap>
                    {getItemLabel(item)}
                  </Typography>
                  {item.source === "drive" && item.size && (
                    <Typography variant="caption" color="text.secondary">
                      {(parseInt(item.size) / 1024).toFixed(1)} KB
                    </Typography>
                  )}
                  {item.source === "mongo" && item.type === "link" && item.url && (
                    <Typography variant="caption" color="text.secondary" noWrap display="block">
                      {item.url}
                    </Typography>
                  )}
                </Box>
              </Box>
              <IconButton
                size="small"
                color="error"
                aria-label={`Delete ${getItemLabel(item)}`}
                onClick={() => setDeleteTarget(item)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Inline delete confirmation */}
      {deleteTarget && (
        <Card variant="outlined" sx={{ mt: 2, p: 2, borderColor: "error.main" }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5 }}>
            Delete &quot;{getItemLabel(deleteTarget)}&quot;?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            {deleteTarget.source === "drive"
              ? "This will remove the file from Google Drive. This cannot be undone."
              : "This cannot be undone."}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="contained"
              color="error"
              size="small"
              disabled={deleting}
              onClick={() => void handleDelete(deleteTarget)}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
            <Button
              variant="outlined"
              size="small"
              disabled={deleting}
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            {deleteSlowMsg && (
              <Typography variant="caption" color="warning.main">
                {deleteSlowMsg}
              </Typography>
            )}
          </Stack>
          {deleting && <LinearProgress sx={{ mt: 1, borderRadius: 1 }} />}
        </Card>
      )}

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
