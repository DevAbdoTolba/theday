// src/components/grad/WingRail.tsx
// The wing's index — folders typeset like a table of contents. A 2px red
// marker slides between entries (shared layout); numbers are tabular,
// names are letterspaced caps, counts sit flush right. Desktop renders a
// vertical index, mobile a sticky strip of editorial tabs.

import React from "react";
import { useRouter } from "next/router";
import { Box, ButtonBase, Tooltip, Typography, alpha, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { wingAccent } from "./gradTheme";
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
  variant: "rail" | "tabs";
  /** Routes of sibling sections that aren't open yet — shown as redacted entries */
  teasers?: string[];
}

const spring = { type: "spring" as const, stiffness: 480, damping: 40 };

const num = (i: number) => String(i + 1).padStart(2, "0");

/** A censored bar where a name should be. */
function Redaction({ width, height = 10 }: { width: number; height?: number }) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        width,
        height,
        borderRadius: "2px",
        bgcolor: alpha(theme.palette.text.primary, 0.22),
        animation: "wing-redact 2.6s ease-in-out infinite",
        "@keyframes wing-redact": {
          "0%, 100%": { opacity: 0.55 },
          "50%": { opacity: 1 },
        },
      }}
    />
  );
}

export default function WingRail({ folders, selectedId, onSelect, progress, variant, teasers = [] }: Props) {
  const theme = useTheme();
  const accent = wingAccent(theme.palette.mode);
  const router = useRouter();

  if (variant === "tabs") {
    return (
      <Box
        component="nav"
        aria-label="Material folders"
        sx={{
          display: "flex",
          gap: 0.5,
          overflowX: "auto",
          borderBottom: `1px solid ${theme.palette.divider}`,
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {folders.map((f, i) => {
          const selected = f.id === selectedId;
          return (
            <ButtonBase
              key={f.id}
              onClick={() => onSelect(f.id)}
              sx={{ position: "relative", px: 1.5, py: 1.25, flexShrink: 0 }}
            >
              <Typography
                component="span"
                sx={{
                  fontSize: 12,
                  fontWeight: selected ? 700 : 500,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: selected ? "text.primary" : "text.secondary",
                  whiteSpace: "nowrap",
                }}
              >
                <Box component="span" sx={{ color: selected ? accent.main : "inherit", mr: 0.75, fontVariantNumeric: "tabular-nums" }}>
                  {num(i)}
                </Box>
                {f.name}
              </Typography>
              {selected && (
                <motion.div
                  layoutId="wing-tab-marker"
                  transition={spring}
                  style={{
                    position: "absolute",
                    left: 8,
                    right: 8,
                    bottom: -1,
                    height: 2,
                    background: accent.main,
                  }}
                />
              )}
            </ButtonBase>
          );
        })}
        {teasers.map((href, t) => (
          <Tooltip key={href} title="Something new is being typeset…">
            <ButtonBase
              onClick={() => router.push(href)}
              sx={{
                position: "relative",
                px: 1.5,
                py: 1.25,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                opacity: 0.85,
              }}
            >
              <Typography
                component="span"
                sx={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "text.secondary",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {num(folders.length + t)}
              </Typography>
              <Redaction width={34} height={9} />
              <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: accent.main, flexShrink: 0 }} />
            </ButtonBase>
          </Tooltip>
        ))}
      </Box>
    );
  }

  return (
    <Box component="nav" aria-label="Material folders">
      <Typography
        sx={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.28em",
          color: "text.secondary",
          pb: 1,
          mb: 0.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        INDEX
      </Typography>
      {folders.map((f, i) => {
        const selected = f.id === selectedId;
        const p = progress[f.id] ?? { done: 0, total: 0 };
        const complete = p.total > 0 && p.done === p.total;
        return (
          <ButtonBase
            key={f.id}
            onClick={() => onSelect(f.id)}
            sx={{
              position: "relative",
              width: "100%",
              justifyContent: "space-between",
              gap: 1.5,
              px: 1.25,
              py: 1.2,
              textAlign: "left",
              "&:hover": { bgcolor: theme.palette.action.hover },
            }}
          >
            {selected && (
              <motion.div
                layoutId="wing-index-marker"
                transition={spring}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 7,
                  bottom: 7,
                  width: 2,
                  background: accent.main,
                }}
              />
            )}
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.25, minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 600,
                  fontVariantNumeric: "tabular-nums",
                  color: selected ? accent.main : "text.secondary",
                }}
              >
                {num(i)}
              </Typography>
              <Typography
                noWrap
                sx={{
                  fontSize: 13,
                  fontWeight: selected ? 700 : 500,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: selected ? "text.primary" : "text.secondary",
                }}
              >
                {f.name}
              </Typography>
            </Box>
            <Typography
              sx={{
                fontSize: 12,
                fontVariantNumeric: "tabular-nums",
                color: complete ? accent.main : "text.secondary",
                fontWeight: complete ? 700 : 400,
                flexShrink: 0,
              }}
            >
              {p.done > 0 ? `${p.done}/${p.total}` : p.total}
            </Typography>
          </ButtonBase>
        );
      })}
      {teasers.map((href, t) => (
        <Tooltip key={href} title="Something new is being typeset…" placement="right">
          <ButtonBase
            onClick={() => router.push(href)}
            sx={{
              position: "relative",
              width: "100%",
              justifyContent: "space-between",
              gap: 1.5,
              px: 1.25,
              py: 1.2,
              textAlign: "left",
              "&:hover": { bgcolor: theme.palette.action.hover },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 600,
                  fontVariantNumeric: "tabular-nums",
                  color: "text.secondary",
                }}
              >
                {num(folders.length + t)}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <Redaction width={58} />
                <Redaction width={24} />
              </Box>
            </Box>
            <Typography
              sx={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.24em",
                color: accent.main,
                flexShrink: 0,
              }}
            >
              SOON
            </Typography>
          </ButtonBase>
        </Tooltip>
      ))}
    </Box>
  );
}
