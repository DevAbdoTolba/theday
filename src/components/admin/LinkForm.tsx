import React, { useState } from "react";
import {
  Box,
  Button,
  Snackbar,
  Alert,
  TextField,
  Typography,
} from "@mui/material";
import { useAuth } from "../../hooks/useAuth";

interface LinkFormProps {
  classId: string;
  category: string;
  onSuccess: () => void;
}

export default function LinkForm({ classId, category, onSuccess }: LinkFormProps) {
  const { getIdToken } = useAuth();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    try {
      new URL(url);
    } catch {
      setSnackbar({ open: true, message: "Please enter a valid URL", severity: "error" });
      return;
    }

    setSubmitting(true);
    try {
      const token = await getIdToken();
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type: "link", classId, category, title: title.trim(), url: url.trim() }),
      });

      if (res.ok) {
        setTitle("");
        setUrl("");
        setSnackbar({ open: true, message: "Link added successfully", severity: "success" });
        onSuccess();
      } else {
        const data = (await res.json()) as { error: string };
        setSnackbar({ open: true, message: data.error ?? "Failed to add link", severity: "error" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={(e) => void handleSubmit(e)}>
      <Typography variant="subtitle2" gutterBottom>
        Add Link
      </Typography>
      <TextField
        label="Title"
        fullWidth
        size="small"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        sx={{ mb: 1 }}
        required
      />
      <TextField
        label="URL"
        fullWidth
        size="small"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        sx={{ mb: 1 }}
        placeholder="https://"
        required
      />
      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={submitting || !title.trim() || !url.trim()}
      >
        {submitting ? "Adding..." : "Add Link"}
      </Button>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
