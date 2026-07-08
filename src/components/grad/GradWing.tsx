// src/components/grad/GradWing.tsx
// Shell of the Graduation Wing (/grad/d/…): grants the device pass, runs the
// one-time cinematic, then renders the reading room — typeset like a printed
// course reader. Fraunces masthead, a red intake stamp, a numbered index,
// and a register of files. Red appears only where it means something.

import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  ButtonBase,
  Container,
  IconButton,
  Skeleton,
  Tooltip,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import LightModeRounded from "@mui/icons-material/LightModeRounded";
import DarkModeRounded from "@mui/icons-material/DarkModeRounded";
import { ColorModeContext } from "../../pages/_app";
import ExpressiveShape from "./ExpressiveShape";
import { SHAPES, SHAPE_VIEWBOX } from "./expressiveShapes";
import WingRail, { FolderProgress } from "./WingRail";
import WingFiles from "./WingFiles";
import WingIntro from "./WingIntro";
import { createWingTheme, wingAccent, WingAccent, WING_DISPLAY, WING_MARK } from "./gradTheme";
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
  /** Routes of sibling sections not open yet — surfaced as redacted index entries */
  teaserPaths?: string[];
}

/** A folder "level": use children if any exist, otherwise the node itself. */
function levelOf(node: GradFolder | null): GradFolder[] {
  if (!node) return [];
  return node.folders.length > 0 ? node.folders : [node];
}

function collectFileIds(node: GradFolder, into: string[] = []): string[] {
  node.files.forEach((f) => into.push(f.id));
  node.folders.forEach((f) => collectFileIds(f, into));
  return into;
}

/**
 * The living seal: "iTi" in chunky rounded letterforms, riding a scallop
 * that spins and morphs beneath the (stationary) letters while the whole
 * stamp floats and sways. Hover excites it; a click pops a little burst
 * of shape confetti. Pure transform/opacity — cheap on any machine.
 */
function WingStamp({ accent, isMobile, ink }: { accent: WingAccent; isMobile: boolean; ink: string }) {
  const [burst, setBurst] = useState(0);
  const reduced = useReducedMotion();

  const confetti = useMemo(() => {
    const shapeNames = ["scallop", "burst", "flower", "clover"] as const;
    return Array.from({ length: 10 }, (_, i) => {
      const angle = (i / 10) * Math.PI * 2 + 0.6;
      const dist = 54 + (i % 3) * 24;
      return {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        size: 9 + (i % 3) * 5,
        rotate: (i * 137) % 360,
        color: [accent.main, "#F6CE6B", ink][i % 3],
        d: SHAPES[shapeNames[i % 4]],
        delay: (i % 5) * 0.025,
      };
    });
  }, [accent, ink]);

  return (
    <motion.div
      animate={reduced ? undefined : { rotate: [-5, 6, -5], y: [0, -7, 0] }}
      transition={{
        rotate: { duration: 5.2, repeat: Infinity, ease: "easeInOut" },
        y: { duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 0.3 },
      }}
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.82 }}
      onClick={() => setBurst((b) => b + 1)}
      style={{ position: "relative", display: "inline-flex", cursor: "pointer" }}
    >
      <ExpressiveShape
        shape={["scallop", "burst", "flower", "clover"]}
        morphDuration={9}
        rotateDuration={reduced ? 0 : 26}
        size={isMobile ? 70 : 94}
        fill={accent.main}
      >
        <Typography
          sx={{
            fontFamily: WING_MARK,
            fontWeight: 800,
            fontSize: isMobile ? 21 : 28,
            letterSpacing: "0.01em",
            color: accent.onMain,
            lineHeight: 1,
            mt: "-0.05em",
          }}
        >
          iTi
        </Typography>
      </ExpressiveShape>

      {burst > 0 && (
        <Box
          key={burst}
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          {confetti.map((c, i) => (
            <motion.svg
              key={i}
              viewBox={SHAPE_VIEWBOX}
              initial={{ x: 0, y: 0, scale: 0, rotate: 0, opacity: 1 }}
              animate={{ x: c.x, y: c.y, scale: [0, 1, 0.7], rotate: c.rotate, opacity: [1, 1, 0] }}
              transition={{ delay: c.delay, duration: 0.9, ease: [0.16, 0.84, 0.3, 1] }}
              style={{ position: "absolute", width: c.size * 2, height: c.size * 2 }}
            >
              <path d={c.d} fill={c.color} />
            </motion.svg>
          ))}
        </Box>
      )}
    </motion.div>
  );
}

export default function GradWing({ gradKey, title, tagline, teaserPaths = [] }: Props) {
  const router = useRouter();
  const outerTheme = useTheme();
  const mode = outerTheme.palette.mode;
  const colorMode = useContext(ColorModeContext);
  const theme = useMemo(() => createWingTheme(mode), [mode]);
  const accent = wingAccent(mode);
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
  const contextLine = [intake?.name, course && course !== intake ? course.name : null]
    .filter(Boolean)
    .join(" — ");

  const microLabel = {
    fontSize: 10.5,
    fontWeight: 600,
    letterSpacing: "0.22em",
    textTransform: "uppercase" as const,
    color: "text.secondary",
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default", color: "text.primary" }}>
        <Container maxWidth="md" sx={{ pt: { xs: 2, md: 3.5 }, pb: 10 }}>
          {/* ------------------------------------------------ micro bar */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              pb: 1.25,
              borderBottom: `1px solid ${theme.palette.text.primary}`,
            }}
          >
            <ButtonBase onClick={() => router.push("/")} sx={{ py: 0.5 }}>
              <Typography sx={{ ...microLabel, "&:hover": { color: "text.primary" } }}>
                ← TheDay
              </Typography>
            </ButtonBase>
            <Typography sx={{ ...microLabel, display: { xs: "none", sm: "block" } }}>
              Graduate Wing
            </Typography>
            <Tooltip title={mode === "dark" ? "Switch to light" : "Switch to dark"}>
              <IconButton onClick={colorMode.toggleColorMode} size="small" sx={{ color: "text.secondary" }}>
                {mode === "dark" ? (
                  <LightModeRounded sx={{ fontSize: 17 }} />
                ) : (
                  <DarkModeRounded sx={{ fontSize: 17 }} />
                )}
              </IconButton>
            </Tooltip>
          </Box>

          {/* ------------------------------------------------ masthead */}
          <Box sx={{ position: "relative", pt: { xs: 3.5, md: 5 }, mb: { xs: 3, md: 4 } }}>
            <Typography
              component="h1"
              sx={{
                fontFamily: WING_DISPLAY,
                fontWeight: 700,
                fontSize: { xs: "2.4rem", md: "3.4rem" },
                lineHeight: 1.02,
                letterSpacing: "-0.015em",
                pr: { xs: 9, md: 13 },
              }}
            >
              {title}
              <Box component="span" sx={{ color: accent.main }}>
                .
              </Box>
            </Typography>
            <Typography
              sx={{
                mt: 1.5,
                fontFamily: WING_DISPLAY,
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: { xs: 15.5, md: 17 },
                color: "text.secondary",
              }}
            >
              {tagline}
            </Typography>

            {/* the seal — the page's one expressive object, and a small toy */}
            <Box
              aria-hidden
              sx={{
                position: "absolute",
                top: { xs: 8, md: 16 },
                right: 0,
                transform: "rotate(-7deg)",
              }}
            >
              <WingStamp accent={accent} isMobile={isMobile} ink={theme.palette.text.primary} />
            </Box>
          </Box>

          {/* ------------------------------------------------ context + stats */}
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 2, flexWrap: "wrap", mb: 1 }}>
            {contextLine && <Typography sx={microLabel}>{contextLine}</Typography>}
            {intakes.length > 1 &&
              intakes.map((it) => (
                <ButtonBase key={it.id} onClick={() => setIntakeId(it.id)}>
                  <Typography
                    sx={{
                      ...microLabel,
                      color: it.id === intake?.id ? accent.main : "text.secondary",
                      borderBottom: it.id === intake?.id ? `1px solid ${accent.main}` : "1px solid transparent",
                    }}
                  >
                    {it.name}
                  </Typography>
                </ButtonBase>
              ))}
            {courses.length > 1 &&
              courses.map((c) => (
                <ButtonBase key={c.id} onClick={() => setCourseId(c.id)}>
                  <Typography
                    sx={{
                      ...microLabel,
                      color: c.id === course?.id ? accent.main : "text.secondary",
                      borderBottom: c.id === course?.id ? `1px solid ${accent.main}` : "1px solid transparent",
                    }}
                  >
                    {c.name}
                  </Typography>
                </ButtonBase>
              ))}
            <Typography sx={{ ...microLabel, ml: "auto", fontVariantNumeric: "tabular-nums" }}>
              {overall.total > 0
                ? `${overall.done} / ${overall.total} studied`
                : loading
                ? "opening…"
                : ""}
              {refreshing && tree ? " · syncing" : ""}
            </Typography>
          </Box>

          {/* progress hairline */}
          <Box sx={{ position: "relative", height: 2, bgcolor: alpha(theme.palette.text.primary, 0.1), mb: lastOpened ? 2 : { xs: 3, md: 4.5 } }}>
            <motion.div
              animate={{ width: `${overall.pct}%` }}
              transition={{ type: "spring", stiffness: 80, damping: 24 }}
              style={{ position: "absolute", left: 0, top: 0, bottom: 0, background: accent.main }}
            />
          </Box>

          {lastOpened && (
            <Box sx={{ mb: { xs: 3, md: 4.5 } }}>
              <ButtonBase onClick={handleContinue}>
                <Typography
                  sx={{
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: accent.main,
                    borderBottom: `1px solid ${alpha(accent.main, 0.5)}`,
                    "&:hover": { borderBottomColor: accent.main },
                  }}
                >
                  Continue where you left off →{" "}
                  {lastOpened.fileName.length > 40
                    ? lastOpened.fileName.slice(0, 40) + "…"
                    : lastOpened.fileName}
                </Typography>
              </ButtonBase>
            </Box>
          )}

          {/* ------------------------------------------------ body */}
          {error && !tree ? (
            <Box sx={{ py: 8 }}>
              <Typography sx={{ color: "text.secondary", mb: 2, fontSize: 14.5 }}>{error}</Typography>
              <ButtonBase onClick={() => router.reload()}>
                <Typography
                  sx={{
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: accent.main,
                    borderBottom: `1px solid ${accent.main}`,
                  }}
                >
                  Try again
                </Typography>
              </ButtonBase>
            </Box>
          ) : loading ? (
            <Box sx={{ display: "flex", gap: 5 }}>
              {!isMobile && (
                <Box sx={{ width: 224, flexShrink: 0 }}>
                  {[0, 1, 2, 3].map((i) => (
                    <Skeleton key={i} variant="text" height={38} sx={{ my: 0.5 }} />
                  ))}
                </Box>
              )}
              <Box sx={{ flex: 1 }}>
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <Skeleton key={i} variant="text" height={40} sx={{ my: 0.25 }} />
                ))}
              </Box>
            </Box>
          ) : (
            <>
              {isMobile && (
                <Box
                  sx={{
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                    bgcolor: "background.default",
                    mx: -2,
                    px: 2,
                    mb: 2,
                  }}
                >
                  <WingRail
                    folders={materials}
                    selectedId={selectedFolderId}
                    onSelect={setFolderId}
                    progress={progress}
                    variant="tabs"
                  />
                </Box>
              )}
              <Box sx={{ display: "flex", gap: 5, alignItems: "flex-start" }}>
                {!isMobile && (
                  <Box sx={{ width: 224, flexShrink: 0, position: "sticky", top: 24 }}>
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
                    sectionKey={gradKey}
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

              {/* a footnote most people will never notice — exactly as intended */}
              {teaserPaths.length > 0 && (
                <Box sx={{ mt: { xs: 12, md: 18 }, display: "flex", justifyContent: "center" }}>
                  {teaserPaths.map((href) => (
                    <Tooltip key={href} title="Something new is being typeset…">
                      <ButtonBase
                        onClick={() => router.push(href)}
                        aria-label="A door not yet open"
                        sx={{
                          px: 2.5,
                          py: 1.5,
                          borderRadius: 2,
                          opacity: 0.22,
                          transition: "opacity 400ms ease",
                          "&:hover": { opacity: 0.95 },
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Box sx={{ width: 26, height: 7, borderRadius: "2px", bgcolor: "text.secondary" }} />
                        <Box sx={{ width: 12, height: 7, borderRadius: "2px", bgcolor: "text.secondary" }} />
                        <Typography
                          sx={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.3em", color: "primary.main", ml: 0.5 }}
                        >
                          SOON
                        </Typography>
                      </ButtonBase>
                    </Tooltip>
                  ))}
                </Box>
              )}
            </>
          )}
        </Container>

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
          <motion.div style={{ position: "fixed", inset: 0, zIndex: 2999, background: mode === "dark" ? "#171519" : "#F7F4EE" }} />
        )}
      </Box>
    </ThemeProvider>
  );
}
