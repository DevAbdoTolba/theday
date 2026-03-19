import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Autocomplete,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Snackbar,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import SuperAdminGuard from "../../components/admin/SuperAdminGuard";
import ApprovalList from "../../components/admin/ApprovalList";
import ClassGrid from "../../components/admin/ClassGrid";
import { useAuth } from "../../hooks/useAuth";
import { useApprovals } from "../../hooks/useApprovals";
import { SUPER_ADMIN_EMAIL } from "../../lib/constants";

interface ClassData {
  _id: string;
  class: string;
  data: Array<{
    index: number;
    subjects: Array<{ name: string; abbreviation: string }>;
  }>;
}

interface UserRow {
  _id: string;
  firebaseUid: string;
  email: string;
  displayName: string;
  isAdmin: boolean;
  assignedClassId?: string | null;
  createdAt: string;
}

export default function SudoPage() {
  return (
    <SuperAdminGuard>
      <SudoContent />
    </SuperAdminGuard>
  );
}

function SudoContent() {
  const { getIdToken } = useAuth();
  const {
    pending,
    count: approvalCount,
    loading: approvalsLoading,
    error: approvalsError,
    approveChange,
    rejectChange,
  } = useApprovals();

  const [tab, setTab] = useState(0);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Class form state
  const [addingClass, setAddingClass] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassData | null>(null);
  const [classFormName, setClassFormName] = useState("");
  const [deletingClass, setDeletingClass] = useState<ClassData | null>(null);

  // Admin assignment state
  const [assigningClass, setAssigningClass] = useState<ClassData | null>(null);
  const [assignAdminUid, setAssignAdminUid] = useState<string | null>(null);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const showSnackbar = (message: string, severity: "success" | "error" = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchData = useCallback(async () => {
    const token = await getIdToken();
    try {
      const [cRes, uRes] = await Promise.all([
        fetch("/api/sudo/classes", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/sudo/users", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (cRes.ok) {
        const cData = (await cRes.json()) as { classes: ClassData[] };
        setClasses(cData.classes);
      }
      if (uRes.ok) {
        const uData = (await uRes.json()) as { users: UserRow[] };
        setUsers(uData.users);
      }
    } catch {
      showSnackbar("Failed to load data", "error");
    } finally {
      setDataLoading(false);
    }
  }, [getIdToken]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // --- Class CRUD ---
  const handleAddClass = async () => {
    if (!classFormName.trim()) return;
    const token = await getIdToken();
    const res = await fetch("/api/sudo/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ class: classFormName.trim(), data: [] }),
    });
    if (res.ok) {
      setAddingClass(false);
      setClassFormName("");
      showSnackbar("Class created");
      void fetchData();
    } else {
      const data = (await res.json()) as { error: string };
      showSnackbar(data.error ?? "Failed to create class", "error");
    }
  };

  const handleEditClass = async () => {
    if (!editingClass || !classFormName.trim()) return;
    const token = await getIdToken();
    const res = await fetch("/api/sudo/classes", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        _id: editingClass._id,
        class: classFormName.trim(),
        data: editingClass.data,
      }),
    });
    if (res.ok) {
      setEditingClass(null);
      setClassFormName("");
      showSnackbar("Class updated");
      void fetchData();
    } else {
      const data = (await res.json()) as { error: string };
      showSnackbar(data.error ?? "Failed to update class", "error");
    }
  };

  const handleDeleteClass = async () => {
    if (!deletingClass) return;
    const token = await getIdToken();
    const res = await fetch("/api/sudo/classes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ _id: deletingClass._id }),
    });
    if (res.ok) {
      setDeletingClass(null);
      showSnackbar("Class deleted");
      void fetchData();
    } else {
      const data = (await res.json()) as { error: string };
      showSnackbar(data.error ?? "Failed to delete class", "error");
    }
  };

  // --- Admin assignment ---
  const handleAssignAdmin = async () => {
    if (!assigningClass) return;
    const token = await getIdToken();

    // First unassign any admin currently on this class
    const currentAdmin = users.find((u) => u.assignedClassId === assigningClass._id);
    if (currentAdmin && currentAdmin.firebaseUid !== assignAdminUid) {
      await fetch("/api/sudo/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ firebaseUid: currentAdmin.firebaseUid, assignedClassId: null }),
      });
    }

    // Assign new admin if selected
    if (assignAdminUid) {
      const res = await fetch("/api/sudo/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ firebaseUid: assignAdminUid, assignedClassId: assigningClass._id }),
      });
      if (res.ok) {
        showSnackbar("Admin assigned");
      } else {
        showSnackbar("Failed to assign admin", "error");
      }
    }

    setAssigningClass(null);
    setAssignAdminUid(null);
    void fetchData();
  };

  // --- User admin toggle ---
  const handleToggleAdmin = async (firebaseUid: string, newIsAdmin: boolean) => {
    const token = await getIdToken();
    const res = await fetch("/api/sudo/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ firebaseUid, isAdmin: newIsAdmin }),
    });
    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) =>
          u.firebaseUid === firebaseUid ? { ...u, isAdmin: newIsAdmin } : u
        )
      );
      showSnackbar(`Admin access ${newIsAdmin ? "granted" : "revoked"}`);
    } else {
      const data = (await res.json()) as { error: string };
      showSnackbar(data.error ?? "Failed to update user", "error");
    }
  };

  const admins = users
    .filter((u) => u.isAdmin)
    .map((u) => ({
      firebaseUid: u.firebaseUid,
      displayName: u.displayName,
      email: u.email,
      assignedClassId: u.assignedClassId,
    }));

  const getClassNameById = (classId: string) =>
    classes.find((c) => c._id === classId)?.class ?? "";

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", p: 3 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
        sudo-1337
      </Typography>

      <Tabs value={tab} onChange={(_, v: number) => setTab(v)} sx={{ mb: 3 }} aria-label="Sudo management tabs">
        <Tab
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              Approvals
              {approvalCount > 0 && (
                <Badge badgeContent={approvalCount} color="warning" />
              )}
            </Box>
          }
        />
        <Tab label="Classes" />
        <Tab label="Users" />
      </Tabs>

      <AnimatePresence mode="wait">
      {/* Tab 0: Approvals (T026) */}
      {tab === 0 && (
        <motion.div
          key="tab-approvals"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
        <Box>
          {approvalsError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {approvalsError}
            </Alert>
          )}
          <ApprovalList
            pending={pending}
            count={approvalCount}
            loading={approvalsLoading}
            onApprove={async (id) => {
              await approveChange(id);
              showSnackbar("Change approved");
            }}
            onReject={async (id) => {
              await rejectChange(id);
              showSnackbar("Change rejected");
            }}
          />
        </Box>
        </motion.div>
      )}

      {/* Tab 1: Classes (T029) */}
      {tab === 1 && (
        <motion.div
          key="tab-classes"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
        <Box>
          <ClassGrid
            classes={classes}
            admins={admins}
            loading={dataLoading}
            onAddClass={() => {
              setClassFormName("");
              setAddingClass(true);
            }}
            onEditClass={(cls) => {
              setEditingClass(cls);
              setClassFormName(cls.class);
            }}
            onDeleteClass={(cls) => setDeletingClass(cls)}
            onAssignAdmin={(cls) => {
              const currentAdmin = users.find((u) => u.assignedClassId === cls._id);
              setAssigningClass(cls);
              setAssignAdminUid(currentAdmin?.firebaseUid ?? null);
            }}
          />

          {/* Inline add class form */}
          {addingClass && (
            <Card variant="outlined" sx={{ mt: 2, p: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                Create Class
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  size="small"
                  label="Class Name"
                  value={classFormName}
                  onChange={(e) => setClassFormName(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleAddClass();
                    if (e.key === "Escape") setAddingClass(false);
                  }}
                />
                <Button variant="contained" size="small" onClick={() => void handleAddClass()}>
                  Create
                </Button>
                <Button variant="outlined" size="small" onClick={() => setAddingClass(false)}>
                  Cancel
                </Button>
              </Stack>
            </Card>
          )}

          {/* Inline edit class form */}
          {editingClass && (
            <Card variant="outlined" sx={{ mt: 2, p: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                Edit Class
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  size="small"
                  label="Class Name"
                  value={classFormName}
                  onChange={(e) => setClassFormName(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleEditClass();
                    if (e.key === "Escape") {
                      setEditingClass(null);
                      setClassFormName("");
                    }
                  }}
                />
                <Button variant="contained" size="small" onClick={() => void handleEditClass()}>
                  Save
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setEditingClass(null);
                    setClassFormName("");
                  }}
                >
                  Cancel
                </Button>
              </Stack>
            </Card>
          )}

          {/* Inline delete confirmation */}
          {deletingClass && (
            <Card variant="outlined" sx={{ mt: 2, p: 2, borderColor: "error.main" }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                Delete &quot;{deletingClass.class}&quot;?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                {deletingClass.data.reduce((sum, d) => sum + d.subjects.length, 0)} subjects will be
                affected. This cannot be undone.
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={() => void handleDeleteClass()}
                >
                  Delete
                </Button>
                <Button variant="outlined" size="small" onClick={() => setDeletingClass(null)}>
                  Cancel
                </Button>
              </Stack>
            </Card>
          )}

          {/* Inline admin assignment */}
          {assigningClass && (
            <Card variant="outlined" sx={{ mt: 2, p: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                Assign admin to &quot;{assigningClass.class}&quot;
              </Typography>
              <Stack spacing={1.5}>
                <Autocomplete
                  size="small"
                  options={admins}
                  getOptionLabel={(opt) => `${opt.displayName} (${opt.email})`}
                  value={admins.find((a) => a.firebaseUid === assignAdminUid) ?? null}
                  onChange={(_, value) => setAssignAdminUid(value?.firebaseUid ?? null)}
                  renderInput={(params) => (
                    <TextField {...params} label="Select admin" />
                  )}
                  sx={{ maxWidth: 400 }}
                />
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => void handleAssignAdmin()}
                  >
                    Assign
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setAssigningClass(null);
                      setAssignAdminUid(null);
                    }}
                  >
                    Cancel
                  </Button>
                </Stack>
              </Stack>
            </Card>
          )}
        </Box>
        </motion.div>
      )}

      {/* Tab 2: Users (T030) */}
      {tab === 2 && (
        <motion.div
          key="tab-users"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            User Management
          </Typography>
          {users.length === 0 && !dataLoading ? (
            <Typography color="text.secondary">No users registered yet</Typography>
          ) : (
            <Stack spacing={1.5}>
              {users.map((user) => (
                <Card key={user._id} variant="outlined">
                  <CardContent
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      py: 1.5,
                      "&:last-child": { pb: 1.5 },
                      flexWrap: "wrap",
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 200 }}>
                      <Typography variant="body1" fontWeight={500}>
                        {user.displayName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Admin
                      </Typography>
                      <Switch
                        checked={user.isAdmin}
                        disabled={user.email === SUPER_ADMIN_EMAIL}
                        onChange={(e) =>
                          void handleToggleAdmin(user.firebaseUid, e.target.checked)
                        }
                        size="small"
                        inputProps={{ "aria-label": `Toggle admin access for ${user.displayName}` }}
                      />
                    </Box>

                    {user.isAdmin && user.assignedClassId && (
                      <Chip
                        label={getClassNameById(user.assignedClassId) || "Assigned"}
                        size="small"
                        variant="outlined"
                      />
                    )}

                    {user.isAdmin && !user.assignedClassId && (
                      <Chip label="No class" size="small" color="warning" variant="outlined" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </Box>
        </motion.div>
      )}
      </AnimatePresence>

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
