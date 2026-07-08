// src/components/grad/GradSeal.tsx
// The graduation gift: a golden Material-3-Expressive seal that appears
// (forever, on this device) once its owner has visited their secret wing.
// It lives bottom-left — the Study FAB owns bottom-right — quietly
// shape-morphing like a wax seal that never quite sits still.

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Box, ButtonBase, useTheme } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import ExpressiveShape from "./ExpressiveShape";
import { getGradPass, hasSeenSeal, markSealSeen } from "../../utils/gradStore";
import type { GradPass } from "../../utils/gradTypes";

const SchoolRounded = dynamic(() => import("@mui/icons-material/SchoolRounded"), {
  ssr: false,
});

export const GRAD_PASS_EVENT = "grad-pass-granted";

const GOLD: [string, string] = ["#F6CE6B", "#DB9A2D"];
const INK = "#151a2c";

export default function GradSeal() {
  const router = useRouter();
  const theme = useTheme();
  const [pass, setPass] = useState<GradPass | null>(null);
  const [labelOpen, setLabelOpen] = useState(false);
  const [firstReveal, setFirstReveal] = useState(false);

  const refresh = useCallback(() => setPass(getGradPass()), []);

  useEffect(() => {
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener(GRAD_PASS_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(GRAD_PASS_EVENT, refresh);
    };
  }, [refresh]);

  // One-time ceremony: the first time the seal ever shows up outside the
  // wing, it bounces in and introduces itself.
  const onWing = router.pathname.startsWith("/grad");
  useEffect(() => {
    if (pass && !onWing && !hasSeenSeal()) {
      setFirstReveal(true);
      setLabelOpen(true);
      markSealSeen();
      const t = setTimeout(() => {
        setLabelOpen(false);
        setFirstReveal(false);
      }, 4500);
      return () => clearTimeout(t);
    }
  }, [pass, onWing]);

  if (!pass || onWing) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: { xs: 20, md: 28 },
        left: { xs: 14, md: 24 },
        zIndex: 1250,
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        pointerEvents: "none",
      }}
    >
      <motion.div
        initial={firstReveal ? { scale: 0, rotate: -120 } : { scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={
          firstReveal
            ? { type: "spring", stiffness: 260, damping: 14, delay: 0.4 }
            : { type: "spring", stiffness: 300, damping: 22 }
        }
        style={{ pointerEvents: "auto" }}
      >
        <ButtonBase
          aria-label="Open your Graduation Wing"
          onClick={() => router.push(pass.path)}
          onMouseEnter={() => setLabelOpen(true)}
          onMouseLeave={() => !firstReveal && setLabelOpen(false)}
          onFocus={() => setLabelOpen(true)}
          onBlur={() => !firstReveal && setLabelOpen(false)}
          sx={{
            borderRadius: "50%",
            filter: "drop-shadow(0 4px 14px rgba(219, 154, 45, 0.45))",
            transition: "transform 180ms cubic-bezier(0.34, 1.56, 0.64, 1)",
            "&:hover": { transform: "scale(1.07)" },
            "&:active": { transform: "scale(0.93)" },
          }}
        >
          <ExpressiveShape
            shape={["scallop", "flower", "burst"]}
            size={62}
            gradient={GOLD}
            morphDuration={16}
            rotateDuration={70}
          >
            <SchoolRounded sx={{ color: INK, fontSize: 28 }} />
          </ExpressiveShape>
        </ButtonBase>
      </motion.div>

      <AnimatePresence>
        {labelOpen && (
          <motion.div
            initial={{ opacity: 0, x: -12, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -8, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            style={{ pointerEvents: "none" }}
          >
            <Box
              sx={{
                px: 2,
                py: 1,
                borderRadius: 999,
                bgcolor: theme.palette.mode === "dark" ? "rgba(21,26,44,0.92)" : "rgba(21,26,44,0.88)",
                border: "1px solid rgba(246, 206, 107, 0.4)",
                backdropFilter: "blur(8px)",
                color: "#F6CE6B",
                fontSize: 13.5,
                fontWeight: 700,
                letterSpacing: 0.3,
                whiteSpace: "nowrap",
              }}
            >
              {firstReveal ? "Your wing is open — always." : pass.title}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
