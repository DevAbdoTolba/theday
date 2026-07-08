// src/components/grad/GradWing.tsx
// Shell of the Graduation Wing (/grad/d/…): grants the device pass, runs the
// one-time cinematic, then renders the professional study desk — its own
// crimson Material-3-Expressive theme, folder rail, keyboard-first file list,
// and progress that survives on-device.

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  ButtonBase,
  Chip,
  CircularProgress,
  Container,
  Skeleton,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { AnimatePresence, motion } from "framer-motion";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import PlayArrowRounded from "@mui/icons-material/PlayArrowRounded";
import ExpressiveShape from "./ExpressiveShape";
import WingRail, { FolderProgress } from "./WingRail";
import WingFiles from "./WingFiles";
import WingIntro from "./WingIntro";
import { createWingTheme } from "./gradTheme";
import { GRAD_PASS_EVENT } from "./GradSeal";
import {
  getCachedTree,
  setCachedTree,
  getStudied,
  toggleStudied,
  getLastOpened,
  setLastOpened,
  grantGradPass,
  hasSeenIntro,
  GradLastOpened,
} from "../../utils/gradStore";
import { trackGradWingVisit } from "../../utils/clarity";
import type { GradFile, GradFolder, GradTree } from "../../utils/gradTypes";
import type { ParsedFile } from "../../utils/types";

interface Props {
  gradKey: string;
  title: string;
  tagline: string;
}

/** A folder "level": use children if any exist, otherwise the node itself. */
function levelOf(node: GradFolder | null): GradFolder[] {
  if (!node) return [];
  return node.folders.length > 0 ? node.folders : [node];
}

function countFiles(node: GradFolder): number {
  return node.files.length + node.folders.reduce((acc, f) => acc + countFiles(f), 0);
}

function collectFileIds(node: GradFolder, into: string[] = []): string[] {
  node.files.forEach((f) => into.push(f.id));
  node.folders.forEach((f) => collectFileIds(f, into));
  return into;
}

export default function GradWing({ gradKey, title, tagline }: Props) {
  const router = useRouter();
  const outerTheme = useTheme();
  const mode = outerTheme.palette.mode;
  const theme = useMemo(() => createWingTheme(mode), [mode]);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [tree, setTree] = useState<GradTree | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [studied, setStudied] = useState<Record<string, number>>({});
  const [lastOpened, setLastOpenedState] = useState<GradLastOpened | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [intro, setIntro] = useState<"unknown" | "show" | "done">("unknown");
  const [intakeId, setIntakeId] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [folderId, setFolderId] = useState<string | null>(null);

  // --- unlock the seal + decide on the ceremony (client-only) ---------------
  useEffect(() => {
    grantGradPass(`/grad/d/${gradKey}`, "Grad Wing");
    window.dispatchEvent(new Event(GRAD_PASS_EVENT));
    setIntro(hasSeenIntro(gradKey) ? "done" : "show");
    setStudied(getStudied(gradKey));
    setLastOpenedState(getLastOpened(gradKey));
    trackGradWingVisit(gradKey);
  }, [gradKey]);

  // --- load tree: cached instantly, fresh in the background -----------------
  useEffect(() => {
    let cancelled = false;
    const cached = getCachedTree(gradKey);
    if (cached) setTree(cached);
    setRefreshing(true);
    fetch(`/api/grad/${encodeURIComponent(gradKey)}`)
      .then((r) => {
        if (!r.ok) throw new Error(`status ${r.status}`);
        return r.json();
      })
      .then(({ tree: fresh }: { tree: GradTree }) => {
        if (cancelled) return;
        setTree(fresh);
        setCachedTree(fresh);
        setError(null);
      })
      .catch(() => {
        if (!cancelled && !cached) setError("Couldn't load the wing. Check your connection and retry.");
      })
      .finally(() => !cancelled && setRefreshing(false));
    return () => {
      cancelled = true;
    };
  }, [gradKey]);

  // --- levels: intake → course → material folders ----------------------------
  const intakes = useMemo(() => levelOf(tree?.root ?? null), [tree]);
  const intake = intakes.find((f) => f.id === intakeId) ?? intakes[0] ?? null;
  const courses = useMemo(() => levelOf(intake), [intake]);
  const course = courses.find((f) => f.id === courseId) ?? courses[0] ?? null;

  const materials: GradFolder[] = useMemo(() => {
    if (!course) return [];
    const list = [...course.folders];
    if (course.files.length > 0) {
      list.unshift({ id: `${course.id}-general`, name: "General", folders: [], files: course.files });
    }
    return list.length > 0 ? list : [course];
  }, [course]);

  const selectedFolderId = materials.some((f) => f.id === folderId)
    ? folderId
    : materials[0]?.id ?? null;

  const progress: Record<string, FolderProgress> = useMemo(() => {
    const out: Record<string, FolderProgress> = {};
    materials.forEach((f) => {
      const ids = collectFileIds(f);
      out[f.id] = { total: ids.length, done: ids.filter((id) => studied[id]).length };
    });
    return out;
  }, [materials, studied]);

  const overall = useMemo(() => {
    const totals = Object.values(progress);
    const total = totals.reduce((a, p) => a + p.total, 0);
    const done = totals.reduce((a, p) => a + p.done, 0);
    return { total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  }, [progress]);

  // --- actions ----------------------------------------------------------------
  const handleToggleStudied = useCallback(
    (fileId: string) => setStudied(toggleStudied(gradKey, fileId)),
    [gradKey]
  );

  const handleOpen = useCallback(
    ({ file, parsed, folderId: fid }: { file: GradFile; parsed: ParsedFile; folderId: string }) => {
      window.open(parsed.url, "_blank", "noopener");
      const last: GradLastOpened = { fileId: file.id, fileName: parsed.name, folderId: fid, at: Date.now() };
      setLastOpened(gradKey, last);
      setLastOpenedState(last);
    },
    [gradKey]
  );

  const handleContinue = useCallback(() => {
    if (!lastOpened) return;
    const owner = materials.find(
      (f) => f.id === lastOpened.folderId || collectFileIds(f).includes(lastOpened.fileId)
    );
    if (owner) setFolderId(owner.id);
    setHighlightId(lastOpened.fileId);
  }, [lastOpened, materials]);

  const loading = !tree && !error;

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default", color: "text.primary" }}>
        <Container maxWidth="lg" sx={{ pt: { xs: 2.5, md: 4 }, pb: { xs: 14, md: 8 } }}>
          {/* ---------------------------------------------------- header */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: { xs: 3, md: 4 } }}>
            <ButtonBase
              onClick={() => router.push("/")}
              sx={{ display: "flex", gap: 1, alignItems: "center", px: 1.5, py: 1, borderRadius: 999, color: "text.secondary" }}
            >
              <ArrowBackRounded sx={{ fontSize: 18 }} />
              <Typography sx={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.14em" }}>THEDAY</Typography>
            </ButtonBase>

            {overall.total > 0 && (
              <Box sx={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <CircularProgress
                  variant="determinate"
                  value={100}
                  size={52}
                  thickness={3.5}
                  sx={{ color: alpha(theme.palette.primary.main, 0.15), position: "absolute" }}
                />
                <CircularProgress variant="determinate" value={overall.pct} size={52} thickness={3.5} color="primary" />
                <Typography
                  sx={{ position: "absolute", fontSize: 12, fontWeight: 800 }}
                  aria-label={`${overall.done} of ${overall.total} studied`}
                >
                  {overall.pct}%
                </Typography>
              </Box>
            )}
          </Box>

          <Box sx={{ mb: { xs: 3, md: 4.5 } }}>
            <Typography sx={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.28em", color: "secondary.main", mb: 1 }}>
              GRADUATE WING
            </Typography>
            <Typography variant="h2" sx={{ fontSize: { xs: "2rem", md: "3rem" }, lineHeight: 1.05 }}>
              {title}
            </Typography>
            <Typography sx={{ mt: 1, color: "text.secondary", fontSize: 15 }}>{tagline}</Typography>

            {/* breadcrumb pickers: intake ▸ course */}
            <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1, mt: 2.5 }}>
              {intakes.map((it) => (
                <Chip
                  key={it.id}
                  label={it.name}
                  size="small"
                  onClick={intakes.length > 1 ? () => setIntakeId(it.id) : undefined}
                  sx={{
                    fontWeight: 700,
                    bgcolor: it.id === intake?.id ? alpha(theme.palette.primary.main, 0.18) : "transparent",
                    color: it.id === intake?.id ? "primary.main" : "text.secondary",
                    border: `1px solid ${alpha(theme.palette.primary.main, it.id === intake?.id ? 0.35 : 0.12)}`,
                  }}
                />
              ))}
              {courses.length > 0 && courses[0] !== intake && (
                <>
                  <Typography sx={{ color: "text.secondary", fontSize: 13 }}>›</Typography>
                  {courses.map((c) => (
                    <Chip
                      key={c.id}
                      label={c.name}
                      size="small"
                      onClick={courses.length > 1 ? () => setCourseId(c.id) : undefined}
                      sx={{
                        fontWeight: 700,
                        bgcolor: c.id === course?.id ? alpha(theme.palette.secondary.main, 0.16) : "transparent",
                        color: c.id === course?.id ? "secondary.main" : "text.secondary",
                        border: `1px solid ${alpha(theme.palette.secondary.main, c.id === course?.id ? 0.4 : 0.12)}`,
                      }}
                    />
                  ))}
                </>
              )}
              {refreshing && tree && (
                <CircularProgress size={14} thickness={5} sx={{ ml: 0.5, color: "text.secondary" }} />
              )}
              {lastOpened && (
                <Chip
                  size="small"
                  icon={<PlayArrowRounded sx={{ fontSize: 16 }} />}
                  label={`Continue · ${lastOpened.fileName.length > 34 ? lastOpened.fileName.slice(0, 34) + "…" : lastOpened.fileName}`}
                  onClick={handleContinue}
                  sx={{
                    ml: { md: "auto" },
                    fontWeight: 700,
                    bgcolor: alpha(theme.palette.secondary.main, 0.14),
                    color: "secondary.main",
                    maxWidth: { xs: "100%", md: 380 },
                  }}
                />
              )}
            </Box>
          </Box>

          {/* ---------------------------------------------------- body */}
          {error && !tree ? (
            <Box sx={{ py: 10, textAlign: "center" }}>
              <Typography sx={{ color: "text.secondary", mb: 2 }}>{error}</Typography>
              <Chip label="Retry" color="primary" onClick={() => router.reload()} sx={{ fontWeight: 700 }} />
            </Box>
          ) : loading ? (
            <Box sx={{ display: "flex", gap: 4 }}>
              {!isMobile && (
                <Box sx={{ width: 264, flexShrink: 0, display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {[0, 1, 2, 3].map((i) => (
                    <Skeleton key={i} variant="rounded" height={72} sx={{ borderRadius: "18px" }} />
                  ))}
                </Box>
              )}
              <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1 }}>
                <Skeleton variant="rounded" height={40} sx={{ borderRadius: 999, mb: 1 }} />
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} variant="rounded" height={56} sx={{ borderRadius: "14px" }} />
                ))}
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: "flex", gap: 4, alignItems: "flex-start" }}>
              {!isMobile && (
                <Box sx={{ width: 264, flexShrink: 0, position: "sticky", top: 24 }}>
                  <WingRail
                    folders={materials}
                    selectedId={selectedFolderId}
                    onSelect={setFolderId}
                    progress={progress}
                    variant="rail"
                  />
                </Box>
              )}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <WingFiles
                  folders={materials}
                  selectedFolderId={selectedFolderId}
                  studied={studied}
                  onToggleStudied={handleToggleStudied}
                  onOpen={handleOpen}
                  highlightId={highlightId}
                  onHighlightConsumed={() => setHighlightId(null)}
                />
              </Box>
            </Box>
          )}
        </Container>

        {isMobile && !loading && !error && (
          <WingRail
            folders={materials}
            selectedId={selectedFolderId}
            onSelect={setFolderId}
            progress={progress}
            variant="bar"
          />
        )}

        {/* subtle expressive backdrop accent, pure decoration */}
        <Box
          aria-hidden
          sx={{
            position: "fixed",
            top: -140,
            right: -140,
            width: 380,
            height: 380,
            opacity: mode === "dark" ? 0.07 : 0.06,
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          <ExpressiveShape shape={["scallop", "flower", "burst"]} size="100%" fill={theme.palette.primary.main} morphDuration={26} rotateDuration={160} />
        </Box>

        {/* the one-time ceremony */}
        <AnimatePresence>
          {intro === "show" && (
            <WingIntro
              sectionKey={gradKey}
              title={title}
              tagline={tagline}
              onFinished={() => setIntro("done")}
            />
          )}
        </AnimatePresence>
        {intro === "unknown" && (
          <motion.div style={{ position: "fixed", inset: 0, zIndex: 2999, background: mode === "dark" ? "#181114" : "#FFF8F7" }} />
        )}
      </Box>
    </ThemeProvider>
  );
}
