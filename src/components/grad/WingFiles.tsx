// src/components/grad/WingFiles.tsx
// The register: files typeset as an index — numeral, title, dotted leader,
// small-caps meta — with the same fast keyboard model throughout:
//   /          focus search (searches across ALL folders at once)
//   ↑ / ↓      move through entries
//   Enter      open the highlighted entry
//   Space      mark it studied / unstudied
// Red is reserved for studied numerals, the focus rule, and search focus.
// Register and sheet views share row derivation, headers, and actions —
// only the layout differs.

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  ButtonBase,
  IconButton,
  InputBase,
  Snackbar,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import SearchRounded from "@mui/icons-material/SearchRounded";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import RadioButtonUncheckedRounded from "@mui/icons-material/RadioButtonUncheckedRounded";
import ContentCopyRounded from "@mui/icons-material/ContentCopyRounded";
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded";
import FileTypeIcon, { FILE_TYPE_LABEL } from "../FileTypeIcon";
import { wingAccent } from "./gradTheme";
import { parseGoogleFile } from "../../utils/helpers";
import type { ParsedFile } from "../../utils/types";
import type { GradFile, GradFolder } from "../../utils/gradTypes";

interface FlatRow {
  file: GradFile;
  parsed: ParsedFile;
  folderId: string;
  folderName: string;
  section: string | null;
}

interface Props {
  sectionKey: string;
  folders: GradFolder[];
  selectedFolderId: string | null;
  studied: Record<string, number>;
  onToggleStudied: (fileId: string) => void;
  onOpen: (row: { file: GradFile; parsed: ParsedFile; folderId: string }) => void;
  highlightId: string | null;
  onHighlightConsumed: () => void;
}

/**
 * Thumbnail source: YouTube stills load straight from img.youtube.com;
 * Drive previews go through our own /api/grad/thumb proxy so the browser's
 * Google cookies, sharing settings, and burst rate limits can't break them.
 */
const thumbFor = (sectionKey: string, row: FlatRow, size: 220 | 400 | 800): string | null => {
  if (row.parsed.type === "youtube") return row.parsed.thumbnailUrl ?? null;
  if (row.parsed.thumbnailUrl) {
    return `/api/grad/thumb/${encodeURIComponent(sectionKey)}?id=${encodeURIComponent(row.file.id)}&sz=${size}`;
  }
  return null;
};

type ViewMode = "register" | "sheet";
const VIEW_KEY = "gradViewMode";

/** Section header shared by both views ("— SUBFOLDER"). */
function SectionHeader({ label, first, grid = false }: { label: string; first: boolean; grid?: boolean }) {
  const theme = useTheme();
  const accent = wingAccent(theme.palette.mode);
  return (
    <Typography
      sx={{
        ...(grid
          ? { gridColumn: "1 / -1", mt: first ? 0.5 : 1.5, mb: -1 }
          : { mt: first ? 1.5 : 3, mb: 0.25 }),
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "text.primary",
      }}
    >
      <Box component="span" sx={{ color: accent.main, mr: 1 }}>
        —
      </Box>
      {label}
    </Typography>
  );
}

/** Copy / open (hover-revealed) + the studied toggle — shared by both views. */
function RowActions({
  isDone,
  actionSize,
  toggleSize,
  onCopy,
  onOpenRow,
  onToggle,
}: {
  isDone: boolean;
  actionSize: number;
  toggleSize: number;
  onCopy: () => void;
  /** when provided, an explicit open-in-new-tab button is shown */
  onOpenRow?: () => void;
  onToggle: () => void;
}) {
  const theme = useTheme();
  const accent = wingAccent(theme.palette.mode);
  return (
    <>
      <Box
        className="wing-row-actions"
        sx={{
          display: "flex",
          alignItems: "center",
          opacity: { xs: 1, md: 0 },
          transition: "opacity 140ms ease",
        }}
      >
        <Tooltip title="Copy link">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onCopy();
            }}
            sx={{ color: "text.secondary" }}
          >
            <ContentCopyRounded sx={{ fontSize: actionSize }} />
          </IconButton>
        </Tooltip>
        {onOpenRow && (
          <Tooltip title="Open in new tab">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onOpenRow();
              }}
              sx={{ color: "text.secondary" }}
            >
              <OpenInNewRounded sx={{ fontSize: actionSize }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <Tooltip title={isDone ? "Studied — click to undo" : "Mark as studied"}>
        <IconButton
          size="small"
          aria-label={isDone ? "Mark as not studied" : "Mark as studied"}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          sx={{ color: isDone ? accent.main : alpha(theme.palette.text.secondary, 0.45) }}
        >
          {isDone ? (
            <CheckCircleRounded sx={{ fontSize: toggleSize }} />
          ) : (
            <RadioButtonUncheckedRounded sx={{ fontSize: toggleSize }} />
          )}
        </IconButton>
      </Tooltip>
    </>
  );
}

/**
 * Sheet-view still: a large framed image with the type glyph fallback,
 * sized by the grid cell (16:10 like a printed contact sheet).
 */
function SheetStill({
  parsed,
  src,
  dimmed,
  active,
}: {
  parsed: ParsedFile;
  src: string | null;
  dimmed: boolean;
  active: boolean;
}) {
  const theme = useTheme();
  const accent = wingAccent(theme.palette.mode);
  const [failed, setFailed] = useState(false);

  const frame = {
    width: "100%",
    aspectRatio: "16 / 10",
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: "3px",
    boxShadow: active ? `0 0 0 2px ${accent.main}` : "none",
    opacity: dimmed ? 0.55 : 1,
    transition: "opacity 120ms ease, box-shadow 120ms ease",
    bgcolor: "background.paper",
  };

  if (!src || failed) {
    return (
      <Box sx={{ ...frame, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <FileTypeIcon
          type={parsed.type}
          external={parsed.isExternalLink}
          sx={{ fontSize: 28, color: "text.secondary" }}
        />
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={src}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      sx={{ ...frame, objectFit: "cover", display: "block" }}
    />
  );
}

/**
 * Contact-sheet thumbnail: a small bordered still for visual memory.
 * Falls back to the type glyph on a paper card when Drive has no preview
 * (or the image fails to load).
 */
function RowThumb({
  parsed,
  src,
  previewSrc,
  dimmed,
}: {
  parsed: ParsedFile;
  src: string | null;
  previewSrc: string | null;
  dimmed: boolean;
}) {
  const theme = useTheme();
  const [failed, setFailed] = useState(false);

  const frame = {
    width: 58,
    height: 38,
    flexShrink: 0,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: "3px",
    opacity: dimmed ? 0.55 : 1,
    transition: "opacity 120ms ease",
  };

  if (!src || failed) {
    return (
      <Box
        sx={{
          ...frame,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.paper",
        }}
      >
        <FileTypeIcon
          type={parsed.type}
          external={parsed.isExternalLink}
          sx={{ fontSize: 16, color: "text.secondary" }}
        />
      </Box>
    );
  }

  return (
    <Tooltip
      enterDelay={250}
      placement="right"
      title={
        <Box
          component="img"
          src={previewSrc ?? src}
          alt=""
          sx={{ display: "block", width: 260, maxHeight: 200, objectFit: "cover" }}
        />
      }
      slotProps={{
        tooltip: {
          sx: {
            p: 0.5,
            bgcolor: "background.paper",
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: "4px",
            boxShadow: theme.shadows[4],
            maxWidth: "none",
          },
        },
      }}
    >
      <Box
        component="img"
        src={src}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        sx={{ ...frame, objectFit: "cover", display: "block", bgcolor: "background.paper" }}
      />
    </Tooltip>
  );
}

function humanSize(bytes?: number): string | null {
  if (!bytes || bytes <= 0) return null;
  const units = ["B", "KB", "MB", "GB"];
  let v = bytes;
  let u = 0;
  while (v >= 1024 && u < units.length - 1) {
    v /= 1024;
    u++;
  }
  return `${v >= 10 || u === 0 ? Math.round(v) : v.toFixed(1)} ${units[u]}`;
}

function flattenFolder(folder: GradFolder): FlatRow[] {
  const rows: FlatRow[] = [];
  const push = (file: GradFile, section: string | null) =>
    rows.push({
      file,
      parsed: parseGoogleFile({ ...file, parents: [] }),
      folderId: folder.id,
      folderName: folder.name,
      section,
    });
  folder.files.forEach((f) => push(f, null));
  const walk = (node: GradFolder, path: string[]) => {
    node.files.forEach((f) => push(f, path.join(" / ")));
    node.folders.forEach((sub) => walk(sub, [...path, sub.name]));
  };
  folder.folders.forEach((sub) => walk(sub, [sub.name]));
  return rows;
}

export default function WingFiles({
  sectionKey,
  folders,
  selectedFolderId,
  studied,
  onToggleStudied,
  onOpen,
  highlightId,
  onHighlightConsumed,
}: Props) {
  const theme = useTheme();
  const accent = wingAccent(theme.palette.mode);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(-1);
  const [toast, setToast] = useState("");
  const [view, setView] = useState<ViewMode>(() => {
    if (typeof window === "undefined") return "register";
    return localStorage.getItem(VIEW_KEY) === "sheet" ? "sheet" : "register";
  });

  const switchView = (v: ViewMode) => {
    setView(v);
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {
      // private mode — the toggle still works for this visit
    }
  };
  const searchRef = useRef<HTMLInputElement>(null);
  const rowRefs = useRef<(HTMLElement | null)[]>([]);
  // Which highlight we already scrolled to — so parent re-renders during the
  // highlight window don't re-fire the smooth scroll and fight the user.
  const scrolledHighlight = useRef<string | null>(null);

  const allRows = useMemo(() => folders.map((f) => flattenFolder(f)), [folders]);

  const searching = query.trim().length > 0;

  // Visible rows: either the selected folder, or search hits across all folders
  const visible: FlatRow[] = useMemo(() => {
    if (searching) {
      const q = query.trim().toLowerCase();
      return allRows.flat().filter((r) => r.parsed.name.toLowerCase().includes(q)).slice(0, 120);
    }
    const idx = folders.findIndex((f) => f.id === selectedFolderId);
    return idx >= 0 ? allRows[idx] : [];
  }, [allRows, folders, selectedFolderId, query, searching]);

  useEffect(() => {
    setActiveIdx(-1);
    rowRefs.current = [];
  }, [selectedFolderId, query]);

  // "Continue where you left off" — jump to and highlight a specific file
  useEffect(() => {
    if (!highlightId) {
      scrolledHighlight.current = null;
      return;
    }
    const idx = visible.findIndex((r) => r.file.id === highlightId);
    if (idx >= 0) {
      setActiveIdx(idx);
      if (scrolledHighlight.current !== highlightId) {
        scrolledHighlight.current = highlightId;
        requestAnimationFrame(() =>
          rowRefs.current[idx]?.scrollIntoView({ block: "center", behavior: "smooth" })
        );
      }
      const t = setTimeout(onHighlightConsumed, 2200);
      return () => clearTimeout(t);
    }
    onHighlightConsumed();
  }, [highlightId, visible, onHighlightConsumed]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const inInput = ["INPUT", "TEXTAREA"].includes(target?.tagName);

      if (e.key === "/" && !inInput) {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (e.key === "Escape" && inInput) {
        setQuery("");
        (target as HTMLInputElement).blur();
        return;
      }
      if (inInput && !["ArrowDown", "ArrowUp", "Enter"].includes(e.key)) return;
      if (visible.length === 0) return;

      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((prev) => {
          const next =
            e.key === "ArrowDown"
              ? Math.min(prev + 1, visible.length - 1)
              : Math.max(prev - 1, 0);
          rowRefs.current[next]?.scrollIntoView({ block: "nearest" });
          return next;
        });
      } else if (e.key === "Enter" && activeIdx >= 0 && activeIdx < visible.length) {
        e.preventDefault();
        const r = visible[activeIdx];
        onOpen({ file: r.file, parsed: r.parsed, folderId: r.folderId });
      } else if (e.key === " " && !inInput && activeIdx >= 0 && activeIdx < visible.length) {
        e.preventDefault();
        onToggleStudied(visible[activeIdx].file.id);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [visible, activeIdx, onOpen, onToggleStudied]);

  const copyLink = async (row: FlatRow) => {
    try {
      await navigator.clipboard.writeText(row.parsed.url);
      setToast("Link copied");
    } catch {
      setToast("Couldn't copy — open the file instead");
    }
  };

  const openRow = (row: FlatRow) =>
    onOpen({ file: row.file, parsed: row.parsed, folderId: row.folderId });

  // Per-row derivations shared by both views
  const rowState = (row: FlatRow, i: number) => ({
    isDone: Boolean(studied[row.file.id]),
    isActive: i === activeIdx,
    meta: [FILE_TYPE_LABEL[row.parsed.type], humanSize(row.file.size)].filter(Boolean).join(" · "),
  });

  const doneCount = visible.filter((r) => studied[r.file.id]).length;

  // Group consecutive rows by section (subfolders inside a material folder)
  let lastSection: string | null | undefined;
  const sectionOf = (row: FlatRow) => (searching ? row.folderName : row.section);

  return (
    <Box sx={{ minWidth: 0 }}>
      {/* search — an underlined register line, not a rounded field */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          pb: 0.9,
          borderBottom: `1px solid ${theme.palette.divider}`,
          transition: "border-color 150ms ease",
          "&:focus-within": { borderColor: accent.main },
        }}
      >
        <SearchRounded sx={{ fontSize: 18, color: "text.secondary" }} />
        <InputBase
          inputRef={searchRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the register…"
          fullWidth
          autoComplete="off"
          sx={{ fontSize: 14.5, "& input::placeholder": { color: theme.palette.text.secondary, opacity: 0.8 } }}
        />
        <Typography
          component="kbd"
          sx={{
            display: { xs: "none", md: "block" },
            fontSize: 11,
            px: 0.75,
            color: "text.secondary",
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 0.5,
            fontFamily: "inherit",
          }}
        >
          /
        </Typography>
      </Box>

      <Box sx={{ mt: 1.25, mb: 0.5, display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 2 }}>
        <Typography
          sx={{
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "text.secondary",
          }}
        >
          {searching
            ? `${visible.length} result${visible.length === 1 ? "" : "s"} · all folders`
            : `${visible.length} file${visible.length === 1 ? "" : "s"}${doneCount > 0 ? ` · ${doneCount} studied` : ""}`}
        </Typography>
        <Box sx={{ display: "flex", gap: 1.75, flexShrink: 0 }}>
          {(["register", "sheet"] as const).map((v) => (
            <ButtonBase key={v} onClick={() => switchView(v)}>
              <Typography
                sx={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: view === v ? accent.main : "text.secondary",
                  borderBottom: "1px solid",
                  borderBottomColor: view === v ? accent.main : "transparent",
                  pb: 0.1,
                }}
              >
                {v}
              </Typography>
            </ButtonBase>
          ))}
        </Box>
      </Box>

      {view === "register" && (
        <Box>
          {visible.map((row, i) => {
            const { isDone, isActive, meta } = rowState(row, i);
            const sectionLabel = sectionOf(row);
            const showHeader = sectionLabel !== lastSection;
            lastSection = sectionLabel;

            return (
              <React.Fragment key={`${row.folderId}-${row.file.id}`}>
                {showHeader && sectionLabel && <SectionHeader label={sectionLabel} first={i === 0} />}
                <Box
                  ref={(el: HTMLElement | null) => {
                    rowRefs.current[i] = el;
                  }}
                  onClick={() => openRow(row)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                    minHeight: 52,
                    py: 0.75,
                    px: 0.75,
                    cursor: "pointer",
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    bgcolor: isActive ? theme.palette.action.hover : "transparent",
                    boxShadow: isActive ? `inset 2px 0 0 ${accent.main}` : "none",
                    transition: "background-color 120ms ease",
                    "&:hover": { bgcolor: theme.palette.action.hover },
                    "&:hover .wing-row-actions": { opacity: 1 },
                  }}
                >
                  <Typography
                    sx={{
                      width: 24,
                      flexShrink: 0,
                      fontSize: 12,
                      fontWeight: 600,
                      fontVariantNumeric: "tabular-nums",
                      color: isDone ? accent.main : "text.secondary",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </Typography>

                  <RowThumb
                    parsed={row.parsed}
                    src={thumbFor(sectionKey, row, 220)}
                    previewSrc={thumbFor(sectionKey, row, 800)}
                    dimmed={isDone}
                  />

                  <Box sx={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0, gap: 0.9 }}>
                    <FileTypeIcon
                      type={row.parsed.type}
                      external={row.parsed.isExternalLink}
                      sx={{
                        fontSize: 15,
                        flexShrink: 0,
                        color: alpha(theme.palette.text.secondary, isDone ? 0.5 : 0.9),
                      }}
                    />
                    <Typography
                      noWrap
                      sx={{
                        fontSize: 14.5,
                        fontWeight: 500,
                        minWidth: 0,
                        flexShrink: 1,
                        color: isDone ? "text.secondary" : "text.primary",
                        textDecoration: isDone ? "line-through" : "none",
                        textDecorationColor: alpha(theme.palette.text.secondary, 0.5),
                      }}
                    >
                      {row.parsed.name}
                    </Typography>
                    <Box
                      aria-hidden
                      sx={{
                        flex: 1,
                        mx: 1,
                        borderBottom: `1px dotted ${alpha(theme.palette.text.secondary, 0.4)}`,
                        transform: "translateY(4px)",
                        display: { xs: "none", sm: "block" },
                        minWidth: 16,
                      }}
                    />
                    <Typography
                      noWrap
                      sx={{
                        flexShrink: 0,
                        fontSize: 10.5,
                        fontWeight: 600,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "text.secondary",
                        display: { xs: "none", sm: "block" },
                      }}
                    >
                      {searching && row.section ? `${row.section} · ${meta}` : meta}
                    </Typography>
                  </Box>

                  <RowActions
                    isDone={isDone}
                    actionSize={15}
                    toggleSize={19}
                    onCopy={() => copyLink(row)}
                    onOpenRow={() => openRow(row)}
                    onToggle={() => onToggleStudied(row.file.id)}
                  />
                </Box>
              </React.Fragment>
            );
          })}
        </Box>
      )}

      {view === "sheet" && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
            columnGap: 2.5,
            rowGap: 3,
            mt: 1.5,
          }}
        >
          {visible.map((row, i) => {
            const { isDone, isActive, meta } = rowState(row, i);
            const sectionLabel = sectionOf(row);
            const showHeader = sectionLabel !== lastSection;
            lastSection = sectionLabel;

            return (
              <React.Fragment key={`${row.folderId}-${row.file.id}`}>
                {showHeader && sectionLabel && (
                  <SectionHeader label={sectionLabel} first={i === 0} grid />
                )}
                <Box
                  ref={(el: HTMLElement | null) => {
                    rowRefs.current[i] = el;
                  }}
                  onClick={() => openRow(row)}
                  sx={{
                    cursor: "pointer",
                    minWidth: 0,
                    "&:hover .wing-row-actions": { opacity: 1 },
                  }}
                >
                  <SheetStill
                    parsed={row.parsed}
                    src={thumbFor(sectionKey, row, 400)}
                    dimmed={isDone}
                    active={isActive}
                  />
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.75, mt: 1 }}>
                    <Typography
                      sx={{
                        flexShrink: 0,
                        fontSize: 12,
                        fontWeight: 600,
                        fontVariantNumeric: "tabular-nums",
                        lineHeight: "19px",
                        color: isDone ? accent.main : "text.secondary",
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </Typography>
                    <FileTypeIcon
                      type={row.parsed.type}
                      external={row.parsed.isExternalLink}
                      sx={{
                        fontSize: 14,
                        mt: "2.5px",
                        flexShrink: 0,
                        color: alpha(theme.palette.text.secondary, isDone ? 0.5 : 0.9),
                      }}
                    />
                    <Typography
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        fontSize: 13.5,
                        fontWeight: 500,
                        lineHeight: 1.4,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        color: isDone ? "text.secondary" : "text.primary",
                        textDecoration: isDone ? "line-through" : "none",
                        textDecorationColor: alpha(theme.palette.text.secondary, 0.5),
                      }}
                    >
                      {row.parsed.name}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pl: "26px" }}>
                    <Typography
                      noWrap
                      sx={{
                        fontSize: 10.5,
                        fontWeight: 600,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "text.secondary",
                        minWidth: 0,
                      }}
                    >
                      {meta}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                      <RowActions
                        isDone={isDone}
                        actionSize={14}
                        toggleSize={17}
                        onCopy={() => copyLink(row)}
                        onToggle={() => onToggleStudied(row.file.id)}
                      />
                    </Box>
                  </Box>
                </Box>
              </React.Fragment>
            );
          })}
        </Box>
      )}

      {visible.length === 0 && (
        <Box sx={{ py: 7 }}>
          <Typography sx={{ fontSize: 14.5, color: "text.secondary" }}>
            <Box component="span" sx={{ color: accent.main, mr: 1 }}>
              —
            </Box>
            {searching ? `Nothing matches “${query.trim()}”.` : "Nothing filed here yet."}
          </Typography>
        </Box>
      )}

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={2200}
        onClose={() => setToast("")}
        message={toast}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
}
