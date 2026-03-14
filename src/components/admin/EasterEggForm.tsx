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

interface EasterEggFormProps {
  classId: string;
  category: string;
  onSuccess: () => void;
}

export default function EasterEggForm({ classId, category, onSuccess }: EasterEggFormProps) {
  const { getIdToken } = useAuth();
  const [name, setName] = useState("");
  const [triggerDescription, setTriggerDescription] = useState("");
  const [payload, setPayload] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !triggerDescription.trim() || !payload.trim()) return;

    setSubmitting(true);
    try {
      const token = await getIdToken();
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: "easter_egg",
          classId,
          category,
          name: name.trim(),
          triggerDescription: triggerDescription.trim(),
          payload: payload.trim(),
        }),
      });

      if (res.ok) {
        setName("");
        setTriggerDescription("");
        setPayload("");
        setSnackbar({ open: true, message: "Easter egg added successfully", severity: "success" });
        onSuccess();
      } else {
        const data = (await res.json()) as { error: string };
        setSnackbar({ open: true, message: data.error ?? "Failed to add easter egg", severity: "error" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={(e) => void handleSubmit(e)}>
      <Typography variant="subtitle2" gutterBottom>
        Add Easter Egg
      </Typography>
      <TextField
        label="Name"
        fullWidth
        size="small"
        value={name}
        onChange={(e) => setName(e.target.value)}
        sx={{ mb: 1 }}
        required
      />
      <TextField
        label="How to trigger"
        fullWidth
        size="small"
        value={triggerDescription}
        onChange={(e) => setTriggerDescription(e.target.value)}
        sx={{ mb: 1 }}
        placeholder="e.g. Click the logo 5 times"
        required
      />
      <TextField
        label="Payload / Content"
        fullWidth
        size="small"
        multiline
        rows={3}
        value={payload}
        onChange={(e) => setPayload(e.target.value)}
        sx={{ mb: 1 }}
        required
      />
      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={submitting || !name.trim() || !triggerDescription.trim() || !payload.trim()}
      >
        {submitting ? "Adding..." : "Add Easter Egg"}
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
