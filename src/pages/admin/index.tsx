import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  IconButton,
  LinearProgress,
  Skeleton,
  Snackbar,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import { AnimatePresence, motion } from "framer-motion";
import AdminGuard from "../../components/admin/AdminGuard";
import SubjectGrid from "../../components/admin/SubjectGrid";
import CategoryTabs from "../../components/admin/CategoryTabs";
import ContentPanel from "../../components/admin/ContentPanel";
import { useAuth } from "../../hooks/useAuth";
import { useSubjectChanges } from "../../hooks/useSubjectChanges";
import { useSlowFeedback } from "../../hooks/useSlowFeedback";
import { cacheGet, cacheSet, cacheInvalidate } from "../../lib/session-cache";

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
    refetch: refetchSubjects,
  } = useSubjectChanges(classId);

  const [selectedSubject, setSelectedSubject] = useState<ActiveSubject | null>(
    null
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoryBusy, setCategoryBusy] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "success" });

  const [publishing, setPublishing] = useState(false);
  const [publishingAll, setPublishingAll] = useState(false);

  const scrollPositionRef = useRef(0);

  const catLoadSlowMsg = useSlowFeedback(categoriesLoading);
  const catBusySlowMsg = useSlowFeedback(categoryBusy);

  const revalidateSubject = useCallback(
    async (abbreviation: string) => {
      try {
        await fetch(`/api/revalidate/${encodeURIComponent(abbreviation)}`);
      } catch {
        // Silent — revalidation is best-effort
      }
    },
    []
  );

  const handlePublish = async () => {
    if (!selectedSubject) return;
    setPublishing(true);
    try {
      const res = await fetch(
        `/api/revalidate/${encodeURIComponent(selectedSubject.abbreviation)}`
      );
      if (res.ok) {
        showSnackbar(
          `Published! Students will see the latest ${selectedSubject.name} content`,
          "success"
        );
      } else {
        showSnackbar("Failed to publish — try again", "error");
      }
    } catch {
      showSnackbar("Failed to publish — try again", "error");
    } finally {
      setPublishing(false);
    }
  };

  const handlePublishAll = async () => {
    if (subjects.length === 0) return;
    setPublishingAll(true);
    try {
      const results = await Promise.allSettled(
        subjects.map((s) =>
          fetch(`/api/revalidate/${encodeURIComponent(s.abbreviation)}`)
        )
      );
      const succeeded = results.filter((r) => r.status === "fulfilled").length;
      showSnackbar(
        `Published ${succeeded}/${subjects.length} subjects to students`,
        succeeded === subjects.length ? "success" : "info"
      );
    } catch {
      showSnackbar("Failed to publish — try again", "error");
    } finally {
      setPublishingAll(false);
    }
  };

  const handleSubjectMutated = useCallback(() => {
    if (selectedSubject) {
      void revalidateSubject(selectedSubject.abbreviation);
    }
  }, [selectedSubject, revalidateSubject]);

  useEffect(() => {
    if (selectedSubject && subjects.length > 0) {
      const stillExists = subjects.some(
        (s) => s.name === selectedSubject.name
      );
      if (!stillExists) {
        handleBackToGrid();
        showSnackbar("Subject no longer available", "error");
      }
    }
  }, [subjects, selectedSubject]);

  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "info" = "success"
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const catCacheKey = (subjectAbbr: string) =>
    `cat:${classId}:${subjectAbbr}`;

  const fetchCategories = useCallback(
    async (subject: ActiveSubject, force = false) => {
      if (!classId) return;

      // Check session cache first
      if (!force) {
        const cached = cacheGet<Category[]>(catCacheKey(subject.abbreviation));
        if (cached) {
          setCategories(cached);
          if (cached.length > 0) {
            setActiveCategory(cached[0].folderId);
          }
          return;
        }
      }

      setCategoriesLoading(true);
      try {
        const token = await getIdToken();
        const params = new URLSearchParams({
          classId,
          subject: subject.abbreviation,
        });
        const res = await fetch(
          `/api/admin/categories?${params.toString()}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const data = (await res.json()) as { categories: Category[] };
          setCategories(data.categories);
          cacheSet(catCacheKey(subject.abbreviation), data.categories);
          if (data.categories.length > 0) {
            setActiveCategory(data.categories[0].folderId);
          }
        } else {
          showSnackbar("Failed to load categories", "error");
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
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollPositionRef.current);
    });
  };

  const handleRefreshSubjects = () => {
    void refetchSubjects();
  };

  const handleRefreshCategories = () => {
    if (!selectedSubject) return;
    cacheInvalidate(catCacheKey(selectedSubject.abbreviation));
    void fetchCategories(selectedSubject, true);
  };

  const handleAddCategory = async (name: string) => {
    if (!classId || !selectedSubject) return;
    setCategoryBusy(true);
    try {
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
        setCategories((prev) => {
          const updated = [...prev, created];
          cacheSet(catCacheKey(selectedSubject.abbreviation), updated);
          return updated;
        });
        setActiveCategory(created.folderId);
        showSnackbar("Category created");
        void revalidateSubject(selectedSubject.abbreviation);
      } else {
        showSnackbar("Failed to create category", "error");
      }
    } catch {
      showSnackbar("Failed to create category", "error");
    } finally {
      setCategoryBusy(false);
    }
  };

  const handleRenameCategory = async (folderId: string, newName: string) => {
    setCategoryBusy(true);
    try {
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
        setCategories((prev) => {
          const next = prev.map((c) =>
            c.folderId === folderId ? updated : c
          );
          if (selectedSubject)
            cacheSet(catCacheKey(selectedSubject.abbreviation), next);
          return next;
        });
        showSnackbar("Category renamed");
        if (selectedSubject)
          void revalidateSubject(selectedSubject.abbreviation);
      } else {
        showSnackbar("Failed to rename category", "error");
      }
    } catch {
      showSnackbar("Failed to rename category", "error");
    } finally {
      setCategoryBusy(false);
    }
  };

  const handleDeleteCategory = async (folderId: string) => {
    setCategoryBusy(true);
    try {
      const token = await getIdToken();
      const res = await fetch(
        `/api/admin/categories?folderId=${encodeURIComponent(folderId)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        setCategories((prev) => {
          const next = prev.filter((c) => c.folderId !== folderId);
          if (selectedSubject)
            cacheSet(catCacheKey(selectedSubject.abbreviation), next);
          if (activeCategory === folderId) {
            setActiveCategory(
              next.length > 0 ? next[0].folderId : null
            );
          }
          return next;
        });
        // Also invalidate content cache for this folder
        cacheInvalidate(`content:${folderId}`);
        showSnackbar("Category deleted");
        if (selectedSubject)
          void revalidateSubject(selectedSubject.abbreviation);
      } else {
        showSnackbar("Failed to delete category", "error");
      }
    } catch {
      showSnackbar("Failed to delete category", "error");
    } finally {
      setCategoryBusy(false);
    }
  };

  if (!classId) {
    return (
      <Box
        sx={{ maxWidth: 900, mx: "auto", p: 3, textAlign: "center", mt: 8 }}
      >
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
      {/* Dashboard header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold">
            {className || "Admin Dashboard"}
          </Typography>
          {className && !selectedSubject && (
            <Typography variant="body1" color="text.secondary">
              Manage subjects for your class
            </Typography>
          )}
        </Box>
        {!selectedSubject && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RocketLaunchOutlinedIcon />}
              onClick={() => void handlePublishAll()}
              disabled={publishingAll || loading || subjects.length === 0}
              sx={{ textTransform: "none" }}
            >
              {publishingAll ? "Publishing..." : "Publish All"}
            </Button>
            <Tooltip title="Refresh subjects">
              <IconButton
                onClick={handleRefreshSubjects}
                disabled={loading}
                aria-label="Refresh subjects"
              >
                <RefreshOutlinedIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ overflow: "hidden" }}>
        <AnimatePresence mode="wait">
          {!selectedSubject ? (
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

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    mb: 3,
                  }}
                >
                  <Box>
                    <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
                      {selectedSubject.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedSubject.abbreviation} — Semester{" "}
                      {selectedSubject.semesterIndex}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<RocketLaunchOutlinedIcon />}
                      onClick={() => void handlePublish()}
                      disabled={publishing}
                      sx={{ textTransform: "none" }}
                    >
                      {publishing ? "Publishing..." : "Publish to Students"}
                    </Button>
                    <Tooltip title="Refresh categories">
                      <IconButton
                        onClick={handleRefreshCategories}
                        disabled={categoriesLoading}
                        aria-label="Refresh categories"
                      >
                        <RefreshOutlinedIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {categoriesLoading ? (
                  <Box sx={{ py: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Loading categories...
                      </Typography>
                      {catLoadSlowMsg && (
                        <Typography variant="caption" color="warning.main">
                          {catLoadSlowMsg}
                        </Typography>
                      )}
                    </Box>
                    <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />
                    <Box sx={{ display: "flex", gap: 1 }}>
                      {[1, 2, 3].map((i) => (
                        <Skeleton
                          key={i}
                          variant="rounded"
                          width={90}
                          height={36}
                        />
                      ))}
                    </Box>
                  </Box>
                ) : (
                  <>
                    {categoryBusy && (
                      <Box sx={{ mb: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            mb: 0.5,
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            Updating...
                          </Typography>
                          {catBusySlowMsg && (
                            <Typography
                              variant="caption"
                              color="warning.main"
                            >
                              {catBusySlowMsg}
                            </Typography>
                          )}
                        </Box>
                        <LinearProgress sx={{ borderRadius: 1 }} />
                      </Box>
                    )}

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
                        onSubjectMutated={handleSubjectMutated}
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
