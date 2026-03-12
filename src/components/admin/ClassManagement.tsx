import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { useAuth } from "../../hooks/useAuth";

interface ClassRow {
  _id: string;
  class: string;
  data: unknown[];
}

export default function ClassManagement() {
  const { getIdToken } = useAuth();
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassRow | null>(null);
  const [formName, setFormName] = useState("");
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const fetchClasses = useCallback(async () => {
    const token = await getIdToken();
    const res = await fetch("/api/sudo/classes", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = (await res.json()) as { classes: ClassRow[] };
      setClasses(data.classes);
      setFetchError(null);
    } else {
      setFetchError("Failed to load classes");
    }
    setLoading(false);
  }, [getIdToken]);

  useEffect(() => {
    void fetchClasses();
  }, [fetchClasses]);

  const handleAdd = async () => {
    if (!formName.trim()) return;
    const token = await getIdToken();
    const res = await fetch("/api/sudo/classes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ class: formName.trim(), data: [] }),
    });
    if (res.ok) {
      setAddOpen(false);
      setFormName("");
      setSnackbar({ open: true, message: "Class created", severity: "success" });
      void fetchClasses();
    } else {
      const data = (await res.json()) as { error: string };
      setSnackbar({ open: true, message: data.error ?? "Failed to create class", severity: "error" });
    }
  };

  const handleEdit = async () => {
    if (!selectedClass || !formName.trim()) return;
    const token = await getIdToken();
    const res = await fetch("/api/sudo/classes", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        _id: selectedClass._id,
        class: formName.trim(),
        data: selectedClass.data,
      }),
    });
    if (res.ok) {
      setEditOpen(false);
      setSelectedClass(null);
      setFormName("");
      setSnackbar({ open: true, message: "Class updated", severity: "success" });
      void fetchClasses();
    } else {
      const data = (await res.json()) as { error: string };
      setSnackbar({ open: true, message: data.error ?? "Failed to update class", severity: "error" });
    }
  };

  const handleDelete = async () => {
    if (!selectedClass) return;
    const token = await getIdToken();
    const res = await fetch("/api/sudo/classes", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ _id: selectedClass._id }),
    });
    if (res.ok) {
      setDeleteOpen(false);
      setSelectedClass(null);
      setSnackbar({ open: true, message: "Class deleted", severity: "success" });
      void fetchClasses();
    } else {
      const data = (await res.json()) as { error: string };
      setSnackbar({ open: true, message: data.error ?? "Failed to delete class", severity: "error" });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {fetchError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {fetchError}
        </Alert>
      )}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Class Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setFormName("");
            setAddOpen(true);
          }}
        >
          Add Class
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Class Name</TableCell>
              <TableCell>Semesters</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {classes.map((cls) => (
              <TableRow key={cls._id}>
                <TableCell>{cls.class}</TableCell>
                <TableCell>{Array.isArray(cls.data) ? cls.data.length : 0}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelectedClass(cls);
                      setFormName(cls.class);
                      setEditOpen(true);
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => {
                      setSelectedClass(cls);
                      setDeleteOpen(true);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {classes.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No classes yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Class</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Class Name"
            fullWidth
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => void handleAdd()}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Edit Class</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Class Name"
            fullWidth
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => void handleEdit()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Class</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete &quot;{selectedClass?.class}&quot;? This cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={() => void handleDelete()}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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
