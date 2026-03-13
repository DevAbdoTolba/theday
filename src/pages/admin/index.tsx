import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Snackbar,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { AnimatePresence, motion } from "framer-motion";
import AdminGuard from "../../components/admin/AdminGuard";
import SubjectGrid from "../../components/admin/SubjectGrid";
import CategoryTabs from "../../components/admin/CategoryTabs";
import ContentPanel from "../../components/admin/ContentPanel";
import { useAuth } from "../../hooks/useAuth";
import { useSubjectChanges } from "../../hooks/useSubjectChanges";

interface ActiveSubject {
  name: string;
  abbreviation: string;
  shared: boolean;
  semesterIndex: number;
}

interface Category {
  name: string;
  folderId: string;
}

export default function AdminDashboard() {
  return (
    <AdminGuard>
      <AdminContent />
    </AdminGuard>
  );
}

function AdminContent() {
  const { user, getIdToken } = useAuth();
  const classId = user?.assignedClassId ?? null;

  const {
    className,
    subjects,
    pendingChanges,
    loading,
    error,
    createChange,
    updateChange,
    cancelChange,
    dismissRejection,
  } = useSubjectChanges(classId);

  // Subject detail view state
  const [selectedSubject, setSelectedSubject] = useState<ActiveSubject | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  // Save scroll position when entering detail view
  const scrollPositionRef = useRef(0);

  // Gracefully transition back to grid if the selected subject disappears
  // (e.g. sudo-1337 approved a deletion while viewing the detail view)
  useEffect(() => {
    if (selectedSubject && subjects.length > 0) {
      const stillExists = subjects.some((s) => s.name === selectedSubject.name);
      if (!stillExists) {
        handleBackToGrid();
        showSnackbar("Subject no longer available", "error");
      }
    }
  }, [subjects, selectedSubject]);

  const showSnackbar = (message: string, severity: "success" | "error" = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchCategories = useCallback(
    async (subject: ActiveSubject) => {
      if (!classId) return;
      setCategoriesLoading(true);
      try {
        const token = await getIdToken();
        const params = new URLSearchParams({
          classId,
          subject: subject.abbreviation,
        });
        const res = await fetch(`/api/admin/categories?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = (await res.json()) as { categories: Category[] };
          setCategories(data.categories);
          if (data.categories.length > 0) {
            setActiveCategory(data.categories[0].folderId);
          }
        }
      } catch {
        showSnackbar("Failed to load categories", "error");
      } finally {
        setCategoriesLoading(false);
      }
    },
    [classId, getIdToken]
  );

  const handleSubjectClick = (subject: ActiveSubject) => {
    scrollPositionRef.current = window.scrollY;
    setSelectedSubject(subject);
    void fetchCategories(subject);
  };

  const handleBackToGrid = () => {
    setSelectedSubject(null);
    setCategories([]);
    setActiveCategory(null);
    // Restore scroll position (FR-022)
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollPositionRef.current);
    });
  };

  const handleAddCategory = async (name: string) => {
    if (!classId || !selectedSubject) return;
    const token = await getIdToken();
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        classId,
        subjectAbbreviation: selectedSubject.abbreviation,
        categoryName: name,
      }),
    });
    if (res.ok) {
      const created = (await res.json()) as Category;
      setCategories((prev) => [...prev, created]);
      setActiveCategory(created.folderId);
      showSnackbar("Category created");
    } else {
      showSnackbar("Failed to create category", "error");
    }
  };

  const handleRenameCategory = async (folderId: string, newName: string) => {
    const token = await getIdToken();
    const res = await fetch("/api/admin/categories", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ folderId, newName }),
    });
    if (res.ok) {
      const updated = (await res.json()) as Category;
      setCategories((prev) =>
        prev.map((c) => (c.folderId === folderId ? updated : c))
      );
      showSnackbar("Category renamed");
    } else {
      showSnackbar("Failed to rename category", "error");
    }
  };

  const handleDeleteCategory = async (folderId: string) => {
    const token = await getIdToken();
    const res = await fetch(`/api/admin/categories?folderId=${encodeURIComponent(folderId)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setCategories((prev) => {
        const updated = prev.filter((c) => c.folderId !== folderId);
        if (activeCategory === folderId) {
          setActiveCategory(updated.length > 0 ? updated[0].folderId : null);
        }
        return updated;
      });
      showSnackbar("Category deleted");
    } else {
      showSnackbar("Failed to delete category", "error");
    }
  };

  // No class assigned — empty state (FR-010)
  if (!classId) {
    return (
      <Box sx={{ maxWidth: 900, mx: "auto", p: 3, textAlign: "center", mt: 8 }}>
        <Typography variant="h5" gutterBottom>
          No Class Assigned
        </Typography>
        <Typography color="text.secondary">
          You haven&apos;t been assigned to a class yet. Please contact the
          sudo-1337 to get assigned.
        </Typography>
      </Box>
    );
  }

  const activeCat = categories.find((c) => c.folderId === activeCategory);

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", p: 3 }}>
      {/* Dashboard header with class name (FR-001) */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          {className || "Admin Dashboard"}
        </Typography>
        {className && !selectedSubject && (
          <Typography variant="body1" color="text.secondary">
            Manage subjects for your class
          </Typography>
        )}
      </Box>

      {/* Error display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ overflow: "hidden" }}>
      <AnimatePresence mode="wait">
        {!selectedSubject ? (
          /* Grid view */
          <motion.div
            key="grid"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <SubjectGrid
              subjects={subjects}
              pendingChanges={pendingChanges}
              loading={loading}
              classId={classId}
              onCreateChange={createChange}
              onUpdateChange={updateChange}
              onCancelChange={cancelChange}
              onDismissRejection={dismissRejection}
              onSubjectClick={handleSubjectClick}
            />
          </motion.div>
        ) : (
          /* Subject detail view */
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <Box>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={handleBackToGrid}
                sx={{ mb: 2 }}
              >
                Back to subjects
              </Button>

              <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                {selectedSubject.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {selectedSubject.abbreviation} — Semester{" "}
                {selectedSubject.semesterIndex}
              </Typography>

              {categoriesLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress size={32} />
                </Box>
              ) : (
                <>
                  <CategoryTabs
                    categories={categories}
                    activeCategory={activeCategory}
                    onChange={setActiveCategory}
                    onAdd={handleAddCategory}
                    onRename={handleRenameCategory}
                    onDelete={handleDeleteCategory}
                  />

                  {activeCat && (
                    <ContentPanel
                      classId={classId}
                      subject={selectedSubject.abbreviation}
                      categoryName={activeCat.name}
                      folderId={activeCat.folderId}
                    />
                  )}

                  {!activeCat && categories.length === 0 && (
                    <Box
                      sx={{
                        textAlign: "center",
                        py: 6,
                        color: "text.secondary",
                      }}
                    >
                      <Typography>
                        No categories yet. Click the + button above to create
                        one.
                      </Typography>
                    </Box>
                  )}
                </>
              )}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
      </Box>

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
