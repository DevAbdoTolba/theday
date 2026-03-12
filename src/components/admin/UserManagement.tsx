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
} from "@mui/material";
import { useAuth } from "../../hooks/useAuth";

const SUPER_ADMIN_EMAIL = "mtolba2004@gmail.com";

interface UserRow {
  _id: string;
  firebaseUid: string;
  email: string;
  displayName: string;
  isAdmin: boolean;
  createdAt: string;
}

export default function UserManagement() {
  const { getIdToken } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const fetchUsers = useCallback(async () => {
    const token = await getIdToken();
    const res = await fetch("/api/sudo/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = (await res.json()) as { users: UserRow[] };
      setUsers(data.users);
      setFetchError(null);
    } else {
      setFetchError("Failed to load users");
    }
    setLoading(false);
  }, [getIdToken]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

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
