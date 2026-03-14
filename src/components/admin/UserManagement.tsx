import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  CircularProgress,
  Paper,
  Switch,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import { useAuth } from "../../hooks/useAuth";

const SUPER_ADMIN_EMAIL = "mtolba2004@gmail.com";

interface UserRow {
  _id: string;
  firebaseUid: string;
  email: string;
  displayName: string;
  isAdmin: boolean;
  assignedClassId?: string | null;
  createdAt: string;
}

interface ClassRow {
  _id: string;
  class: string;
}

export default function UserManagement() {
  const { getIdToken } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const fetchUsersAndClasses = useCallback(async () => {
    const token = await getIdToken();
    try {
      const [uRes, cRes] = await Promise.all([
        fetch("/api/sudo/users", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/sudo/classes", { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (uRes.ok && cRes.ok) {
        const uData = (await uRes.json()) as { users: UserRow[] };
        const cData = (await cRes.json()) as { classes: ClassRow[] };
        setUsers(uData.users);
        setClasses(cData.classes);
        setFetchError(null);
      } else {
        setFetchError("Failed to load user management data");
      }
    } catch (err) {
      setFetchError("An error occurred while fetching data");
    }
    setLoading(false);
  }, [getIdToken]);

  useEffect(() => {
    void fetchUsersAndClasses();
  }, [fetchUsersAndClasses]);

  const handleToggle = async (firebaseUid: string, newIsAdmin: boolean) => {
    const token = await getIdToken();
    const res = await fetch("/api/sudo/users", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ firebaseUid, isAdmin: newIsAdmin }),
    });

    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) =>
          u.firebaseUid === firebaseUid ? { ...u, isAdmin: newIsAdmin } : u
        )
      );
      setSnackbar({
        open: true,
        message: `Admin access ${newIsAdmin ? "granted" : "revoked"}`,
        severity: "success",
      });
    } else {
      const data = (await res.json()) as { error: string };
      setSnackbar({
        open: true,
        message: data.error ?? "Failed to update user",
        severity: "error",
      });
    }
  };

  const handleClassChange = async (firebaseUid: string, classId: string | null) => {
    const token = await getIdToken();
    const res = await fetch("/api/sudo/users", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ firebaseUid, assignedClassId: classId }),
    });

    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) =>
          u.firebaseUid === firebaseUid ? { ...u, assignedClassId: classId || undefined } : u
        )
      );
      setSnackbar({
        open: true,
        message: "Assigned class updated",
        severity: "success",
      });
    } else {
      const data = (await res.json()) as { error: string };
      setSnackbar({
        open: true,
        message: data.error ?? "Failed to update class assignment",
        severity: "error",
      });
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
      <Typography variant="h6" gutterBottom>
        User Management
      </Typography>
      {fetchError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {fetchError}
        </Alert>
      )}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Admin</TableCell>
              <TableCell>Assigned Class</TableCell>
              <TableCell>Joined</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.displayName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Switch
                    checked={user.isAdmin}
                    disabled={user.email === SUPER_ADMIN_EMAIL}
                    onChange={(e) =>
                      void handleToggle(user.firebaseUid, e.target.checked)
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {user.isAdmin && (
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={user.assignedClassId || "none"}
                        onChange={(e) => void handleClassChange(user.firebaseUid, e.target.value === "none" ? null : e.target.value)}
                        disabled={user.email === SUPER_ADMIN_EMAIL}
                        sx={{ fontSize: '0.8rem' }}
                      >
                        <MenuItem value="none"><em>None</em></MenuItem>
                        {classes.map((c) => (
                          <MenuItem key={c._id} value={c._id}>{c.class}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No users registered yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
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
