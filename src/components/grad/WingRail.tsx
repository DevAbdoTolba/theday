// src/components/grad/WingRail.tsx
// Folder navigation for the Graduation Wing. Desktop: a vertical rail with a
// sliding tonal active indicator (shared-layout) whose shape container
// gently morphs — Material 3 Expressive in silhouette, ITI-disciplined in
// color: red for the active folder, quiet neutrals for the rest.
// Mobile: a bottom bar with the same language.

import React from "react";
import { Box, ButtonBase, LinearProgress, Typography, alpha, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import ExpressiveShape from "./ExpressiveShape";
import { wingAccent, shapeFor } from "./gradTheme";
import type { GradFolder } from "../../utils/gradTypes";

export interface FolderProgress {
  done: number;
  total: number;
}

interface Props {
  folders: GradFolder[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  progress: Record<string, FolderProgress>;
  variant: "rail" | "bar";
}

const spring = { type: "spring" as const, stiffness: 420, damping: 34 };

export default function WingRail({ folders, selectedId, onSelect, progress, variant }: Props) {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const accent = wingAccent(mode);

  if (variant === "bar") {
    return (
      <Box
        component="nav"
        aria-label="Material folders"
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
          display: "flex",
          justifyContent: "space-around",
          alignItems: "stretch",
          px: 1,
          pt: 1,
          pb: "calc(10px + env(safe-area-inset-bottom))",
          bgcolor: "background.paper",
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        {folders.map((f, i) => {
          const selected = f.id === selectedId;
          return (
            <ButtonBase
              key={f.id}
              onClick={() => onSelect(f.id)}
              sx={{
                flexDirection: "column",
                gap: 0.5,
                flex: 1,
                py: 0.5,
                borderRadius: 3,
                minWidth: 0,
              }}
            >
              <Box sx={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 60, height: 36 }}>
                {selected && (
                  <motion.div
                    layoutId="wing-bar-pill"
                    transition={spring}
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 18,
                      background: accent.container,
                    }}
                  />
                )}
                <ExpressiveShape
                  shape={selected ? [shapeFor(i), "squircle"] : "squircle"}
                  morphDuration={7}
                  size={26}
                  fill={selected ? accent.main : alpha(theme.palette.text.secondary, 0.16)}
                >
                  <Typography sx={{ fontSize: 12, fontWeight: 800, color: selected ? accent.onMain : theme.palette.text.secondary, lineHeight: 1 }}>
                    {f.name.charAt(0).toUpperCase()}
                  </Typography>
                </ExpressiveShape>
              </Box>
              <Typography
                noWrap
                sx={{
                  fontSize: 11,
                  fontWeight: selected ? 800 : 600,
                  color: selected ? accent.main : theme.palette.text.secondary,
                  maxWidth: "100%",
                  px: 0.5,
                }}
              >
                {f.name}
              </Typography>
            </ButtonBase>
          );
        })}
      </Box>
    );
  }

  return (
    <Box component="nav" aria-label="Material folders" sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
      {folders.map((f, i) => {
        const selected = f.id === selectedId;
        const p = progress[f.id] ?? { done: 0, total: 0 };
        return (
          <ButtonBase
            key={f.id}
            onClick={() => onSelect(f.id)}
            sx={{
              position: "relative",
              justifyContent: "flex-start",
              textAlign: "left",
              gap: 1.5,
              px: 1.5,
              py: 1.25,
              borderRadius: "14px",
              width: "100%",
            }}
          >
            {selected && (
              <motion.div
                layoutId="wing-rail-pill"
                transition={spring}
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 14,
                  background: accent.container,
                }}
              />
            )}
            <Box sx={{ position: "relative", display: "flex", alignItems: "center", gap: 1.5, width: "100%", minWidth: 0 }}>
              <ExpressiveShape
                shape={selected ? [shapeFor(i), "blob", shapeFor(i)] : "squircle"}
                morphDuration={9}
                rotateDuration={selected ? 90 : 0}
                size={40}
                fill={selected ? accent.main : alpha(theme.palette.text.secondary, 0.1)}
              >
                <Typography sx={{ fontWeight: 800, fontSize: 16, color: selected ? accent.onMain : "text.secondary", lineHeight: 1 }}>
                  {f.name.charAt(0).toUpperCase()}
                </Typography>
              </ExpressiveShape>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  noWrap
                  sx={{
                    fontSize: 14.5,
                    fontWeight: selected ? 800 : 600,
                    color: selected ? accent.onContainer : "text.primary",
                  }}
                >
                  {f.name}
                </Typography>
                <Typography
                  noWrap
                  sx={{
                    fontSize: 12,
                    color: selected ? alpha(accent.onContainer, 0.72) : "text.secondary",
                    mb: p.total > 0 ? 0.5 : 0,
                  }}
                >
                  {p.total} {p.total === 1 ? "item" : "items"}
                  {p.done > 0 ? ` · ${p.done} done` : ""}
                </Typography>
                {p.total > 0 && (
                  <LinearProgress
                    variant="determinate"
                    value={(p.done / p.total) * 100}
                    sx={{
                      height: 3,
                      borderRadius: 2,
                      bgcolor: selected
                        ? alpha(accent.main, 0.22)
                        : alpha(theme.palette.text.secondary, 0.12),
                      "& .MuiLinearProgress-bar": { bgcolor: accent.main, borderRadius: 2 },
                    }}
                  />
                )}
              </Box>
            </Box>
          </ButtonBase>
        );
      })}
    </Box>
  );
}
