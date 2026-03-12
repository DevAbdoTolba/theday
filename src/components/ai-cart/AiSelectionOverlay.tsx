import React from "react";
import { Box, useTheme, alpha } from "@mui/material";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";

const CheckCircle = dynamic(
  () => import("@mui/icons-material/CheckCircle"),
  { ssr: false }
);

interface AiSelectionOverlayProps {
  isSelectable: boolean;
  isSelected: boolean;
}

export default function AiSelectionOverlay({
  isSelectable,
  isSelected,
}: AiSelectionOverlayProps) {
  const theme = useTheme();
  const prefersReducedMotion = useReducedMotion();

  if (!isSelectable && !isSelected) return null;

  const showPulse = isSelectable && !isSelected && !prefersReducedMotion;

  return (
    <Box
      className={showPulse ? "ai-selectable-pulse" : undefined}
      sx={{
        position: "absolute",
        inset: 0,
        zIndex: 10,
        pointerEvents: "none",
        borderRadius: "inherit",
        transition: "border-color 0.25s ease, box-shadow 0.25s ease, background-color 0.25s ease",
        border: isSelected
          ? `2px solid ${theme.palette.primary.main}`
          : `2px solid transparent`,
        boxShadow: isSelected
          ? `0 0 12px ${alpha(theme.palette.primary.main, 0.4)}`
          : "none",
        bgcolor: isSelected
          ? alpha(theme.palette.primary.main, 0.08)
          : "transparent",
      }}
    >
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={prefersReducedMotion ? false : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { scale: 0, opacity: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 25, duration: 0.35 }}
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              width: 28,
              height: 28,
              borderRadius: "50%",
              backgroundColor: theme.palette.primary.main,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              boxShadow: theme.shadows[4],
            }}
          >
            <CheckCircle sx={{ fontSize: 20 }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selection flash overlay */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0.6, scale: 1.05 }}
            animate={{ opacity: 0, scale: 1 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.35, ease: "easeOut" }}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "inherit",
              backgroundColor: alpha(theme.palette.primary.main, 0.15),
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>
    </Box>
  );
}
