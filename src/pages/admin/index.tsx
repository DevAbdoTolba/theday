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
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
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
  const [publishHover, setPublishHover] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [showPublishMsg, setShowPublishMsg] = useState(false);
  const [tipDismissed, setTipDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    const ts = localStorage.getItem("publish-tip-dismissed");
    const count = Number(localStorage.getItem("publish-tip-count") || "0");
    if (!ts) return false;
    // Progressive: 3d → 5d → 7d → 9d → 14d (then stays at 14d)
    const schedule = [3, 5, 7, 9, 14];
    const days = schedule[Math.min(count - 1, schedule.length - 1)] ?? 3;
    return Date.now() - Number(ts) < days * 24 * 60 * 60 * 1000;
  });

  const scrollPositionRef = useRef(0);

  const catLoadSlowMsg = useSlowFeedback(categoriesLoading);
  const catBusySlowMsg = useSlowFeedback(categoryBusy);

  const publishMsg =
    "changes go live automatically in ~2\u201310 min (づ￣ ³￣)づ only hit Publish if u literally can\u2019t wait lol ┗(^o^ )┓";

  useEffect(() => {
    if (!publishing) return;
    setShowPublishMsg(true);
    setTypedText("");
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTypedText(publishMsg.slice(0, i));
      if (i >= publishMsg.length) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, [publishing]);

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
      const count = Number(localStorage.getItem("publish-tip-count") || "0") + 1;
      localStorage.setItem("publish-tip-dismissed", String(Date.now()));
      localStorage.setItem("publish-tip-count", String(count));
      setTipDismissed(true);
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
          <Tooltip title="Refresh subjects">
            <IconButton
              onClick={handleRefreshSubjects}
              disabled={loading}
              aria-label="Refresh subjects"
            >
              <RefreshOutlinedIcon />
            </IconButton>
          </Tooltip>
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
                      onClick={() => void handlePublish()}
                      disabled={publishing}
                      onMouseEnter={() => setPublishHover(true)}
                      onMouseLeave={() => setPublishHover(false)}
                      aria-label="Publish to students"
                      sx={{
                        textTransform: "none",
                        minWidth: 0,
                        px: publishHover || publishing ? 1.5 : 1,
                        transition: "all 0.25s ease",
                        overflow: "hidden",
                      }}
                    >
                      <RocketLaunchOutlinedIcon
                        fontSize="small"
                        sx={{ flexShrink: 0 }}
                      />
                      <Box
                        component="span"
                        sx={{
                          maxWidth: publishHover || publishing ? 120 : 0,
                          opacity: publishHover || publishing ? 1 : 0,
                          ml: publishHover || publishing ? 0.75 : 0,
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          transition: "all 0.25s ease",
                        }}
                      >
                        {publishing ? "Publishing..." : "Publish"}
                      </Box>
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

                {showPublishMsg && (
                  <Box
                    sx={{
                      mb: 2,
                      px: 1.5,
                      py: 0.75,
                      borderRadius: 1,
                      bgcolor: "action.hover",
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 1,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontFamily: "monospace", flex: 1 }}
                    >
                      {typedText}
                      {publishing && (
                        <Box
                          component="span"
                          sx={{
                            display: "inline-block",
                            width: "2px",
                            height: "1em",
                            bgcolor: "text.secondary",
                            ml: 0.25,
                            verticalAlign: "text-bottom",
                            animation: "blink 0.7s step-end infinite",
                            "@keyframes blink": {
                              "50%": { opacity: 0 },
                            },
                          }}
                        />
                      )}
                    </Typography>
                    {!publishing && (
                      <IconButton
                        size="small"
                        onClick={() => setShowPublishMsg(false)}
                        aria-label="Dismiss message"
                        sx={{ p: 0.25, mt: -0.25, flexShrink: 0 }}
                      >
                        <CloseOutlinedIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    )}
                  </Box>
                )}

                {!showPublishMsg && !tipDismissed && (
                  <Alert
                    severity="info"
                    variant="outlined"
                    sx={{
                      mb: 2,
                      py: 0,
                      borderStyle: "dashed",
                      "& .MuiAlert-message": { py: 0.75 },
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {publishMsg}
                    </Typography>
                  </Alert>
                )}

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
