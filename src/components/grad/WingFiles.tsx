// src/components/grad/WingFiles.tsx
// The wing's study surface: a fast, keyboard-first file list.
//   /          focus search (searches across ALL folders at once)
//   ↑ / ↓      move through files
//   Enter      open the highlighted file
//   Space      mark it studied / unstudied
// Every file row: type-coded expressive icon, size, studied toggle,
// copy-link on hover. No cards, no noise — graduates get an instrument.

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  ButtonBase,
  IconButton,
  InputAdornment,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import SearchRounded from "@mui/icons-material/SearchRounded";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import RadioButtonUncheckedRounded from "@mui/icons-material/RadioButtonUncheckedRounded";
import LinkRounded from "@mui/icons-material/LinkRounded";
import PictureAsPdfRounded from "@mui/icons-material/PictureAsPdfRounded";
import OndemandVideoRounded from "@mui/icons-material/OndemandVideoRounded";
import ImageRounded from "@mui/icons-material/ImageRounded";
import DescriptionRounded from "@mui/icons-material/DescriptionRounded";
import TableChartRounded from "@mui/icons-material/TableChartRounded";
import SlideshowRounded from "@mui/icons-material/SlideshowRounded";
import InsertDriveFileRounded from "@mui/icons-material/InsertDriveFileRounded";
import ContentCopyRounded from "@mui/icons-material/ContentCopyRounded";
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded";
import ExpressiveShape from "./ExpressiveShape";
import { wingAccent } from "./gradTheme";
import { parseGoogleFile } from "../../utils/helpers";
import type { ParsedFile } from "../../utils/types";
import type { GradFile, GradFolder } from "../../utils/gradTypes";

interface FlatRow {
  file: GradFile;
  parsed: ParsedFile;
  folderId: string;
  folderName: string;
  folderIndex: number;
  section: string | null;
}

interface Props {
  folders: GradFolder[];
  selectedFolderId: string | null;
  studied: Record<string, number>;
  onToggleStudied: (fileId: string) => void;
  onOpen: (row: { file: GradFile; parsed: ParsedFile; folderId: string }) => void;
  highlightId: string | null;
  onHighlightConsumed: () => void;
}

const TYPE_META: Record<ParsedFile["type"], { label: string; Icon: typeof LinkRounded }> = {
  pdf: { label: "PDF", Icon: PictureAsPdfRounded },
  video: { label: "Video", Icon: OndemandVideoRounded },
  youtube: { label: "Video", Icon: OndemandVideoRounded },
  doc: { label: "Doc", Icon: DescriptionRounded },
  sheet: { label: "Sheet", Icon: TableChartRounded },
  slide: { label: "Slides", Icon: SlideshowRounded },
  image: { label: "Image", Icon: ImageRounded },
  folder: { label: "Folder", Icon: InsertDriveFileRounded },
  unknown: { label: "Link", Icon: LinkRounded },
};

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

function flattenFolder(folder: GradFolder, folderIndex: number): FlatRow[] {
  const rows: FlatRow[] = [];
  const push = (file: GradFile, section: string | null) =>
    rows.push({
      file,
      parsed: parseGoogleFile({ ...file, parents: [] }),
      folderId: folder.id,
      folderName: folder.name,
      folderIndex,
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
  folders,
  selectedFolderId,
  studied,
  onToggleStudied,
  onOpen,
  highlightId,
  onHighlightConsumed,
}: Props) {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(-1);
  const [toast, setToast] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const rowRefs = useRef<(HTMLElement | null)[]>([]);

  const allRows = useMemo(
    () => folders.map((f, i) => flattenFolder(f, i)),
    [folders]
  );

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
    if (!highlightId) return;
    const idx = visible.findIndex((r) => r.file.id === highlightId);
    if (idx >= 0) {
      setActiveIdx(idx);
      requestAnimationFrame(() =>
        rowRefs.current[idx]?.scrollIntoView({ block: "center", behavior: "smooth" })
      );
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

  const doneCount = visible.filter((r) => studied[r.file.id]).length;

  // Group consecutive rows by section (subfolders inside a material folder)
  let lastSection: string | null | undefined;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
      <TextField
        inputRef={searchRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search everything…"
        size="small"
        fullWidth
        autoComplete="off"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchRounded fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <Box
                sx={{
                  display: { xs: "none", md: "block" },
                  px: 0.9,
                  py: 0.1,
                  borderRadius: 1.5,
                  border: `1px solid ${theme.palette.divider}`,
                  color: "text.secondary",
                  fontSize: 12,
                  fontFamily: "monospace",
                }}
              >
                /
              </Box>
            </InputAdornment>
          ),
          sx: { borderRadius: 999, bgcolor: "background.paper" },
        }}
      />

      <Typography sx={{ fontSize: 12.5, color: "text.secondary", px: 1 }}>
        {searching
          ? `${visible.length} result${visible.length === 1 ? "" : "s"} across all folders`
          : `${visible.length} file${visible.length === 1 ? "" : "s"}${doneCount > 0 ? ` · ${doneCount} studied` : ""}`}
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
        {visible.map((row, i) => {
          const meta = TYPE_META[row.parsed.type];
          const accent = wingAccent(mode);
          const isDone = Boolean(studied[row.file.id]);
          const isActive = i === activeIdx;
          const Icon = meta.Icon;

          const sectionLabel = searching ? row.folderName : row.section;
          const showHeader = sectionLabel !== lastSection;
          lastSection = sectionLabel;

          return (
            <React.Fragment key={`${row.folderId}-${row.file.id}`}>
              {showHeader && sectionLabel && (
                <Typography
                  sx={{
                    mt: i === 0 ? 0.5 : 2,
                    mb: 0.5,
                    px: 1,
                    fontSize: 11.5,
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "text.secondary",
                  }}
                >
                  {sectionLabel}
                </Typography>
              )}
              <Box
                ref={(el: HTMLElement | null) => {
                  rowRefs.current[i] = el;
                }}
                onClick={() => onOpen({ file: row.file, parsed: row.parsed, folderId: row.folderId })}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 1.25,
                  py: 0.9,
                  borderRadius: "14px",
                  cursor: "pointer",
                  outline: isActive ? `2px solid ${accent.main}` : "2px solid transparent",
                  outlineOffset: -2,
                  transition: "background-color 120ms ease, outline-color 120ms ease",
                  "&:hover": { bgcolor: theme.palette.action.hover },
                  "&:hover .wing-row-actions": { opacity: 1 },
                }}
              >
                <ExpressiveShape
                  shape="squircle"
                  size={38}
                  fill={alpha(theme.palette.text.primary, isDone ? 0.04 : 0.07)}
                >
                  <Icon
                    sx={{
                      fontSize: 19,
                      color: alpha(theme.palette.text.secondary, isDone ? 0.5 : 0.95),
                    }}
                  />
                </ExpressiveShape>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    noWrap
                    sx={{
                      fontSize: 14.5,
                      fontWeight: 600,
                      color: isDone ? "text.secondary" : "text.primary",
                      opacity: isDone ? 0.72 : 1,
                    }}
                  >
                    {row.parsed.name}
                  </Typography>
                  <Typography noWrap sx={{ fontSize: 12, color: "text.secondary" }}>
                    {meta.label}
                    {humanSize(row.file.size) ? ` · ${humanSize(row.file.size)}` : ""}
                    {searching && row.section ? ` · ${row.section}` : ""}
                  </Typography>
                </Box>

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
                        copyLink(row);
                      }}
                    >
                      <ContentCopyRounded sx={{ fontSize: 17 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Open in new tab">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpen({ file: row.file, parsed: row.parsed, folderId: row.folderId });
                      }}
                    >
                      <OpenInNewRounded sx={{ fontSize: 17 }} />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Tooltip title={isDone ? "Studied — click to undo" : "Mark as studied"}>
                  <IconButton
                    size="small"
                    aria-label={isDone ? "Mark as not studied" : "Mark as studied"}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStudied(row.file.id);
                    }}
                    sx={{ color: isDone ? accent.main : alpha(theme.palette.text.secondary, 0.5) }}
                  >
                    {isDone ? (
                      <CheckCircleRounded sx={{ fontSize: 22 }} />
                    ) : (
                      <RadioButtonUncheckedRounded sx={{ fontSize: 22 }} />
                    )}
                  </IconButton>
                </Tooltip>
              </Box>
            </React.Fragment>
          );
        })}

        {visible.length === 0 && (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <ExpressiveShape
              shape={["flower", "clover"]}
              morphDuration={10}
              size={64}
              fill={alpha(theme.palette.primary.main, 0.14)}
            >
              <SearchRounded sx={{ color: "primary.main", opacity: 0.7 }} />
            </ExpressiveShape>
            <Typography sx={{ mt: 2, color: "text.secondary", fontSize: 14.5 }}>
              {searching ? `Nothing matches “${query.trim()}”` : "This folder is empty for now."}
            </Typography>
          </Box>
        )}
      </Box>

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
