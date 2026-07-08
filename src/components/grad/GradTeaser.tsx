// src/components/grad/GradTeaser.tsx
// A door that isn't open yet. Renders for registry sections marked
// `teaser`: the wing's editorial language — seal, serif, hairline — but
// nothing behind it except a promise. The hint is a small one-page
// document writing itself (a name, a red line, then redactions and a
// blinking caret): unmistakably about *your* page, revealing nothing.
// No pass is granted here and no data is served. 👀

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Box, ButtonBase, Container, Typography, alpha, useTheme } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { motion, useReducedMotion } from "framer-motion";
import ExpressiveShape from "./ExpressiveShape";
import { createWingTheme, wingAccent, WING_DISPLAY, WING_MARK } from "./gradTheme";
import { getGradPass } from "../../utils/gradStore";

interface Props {
  gradKey: string;
  title: string;
  tagline: string;
}

/** One line of the little document: written text or a redaction bar. */
interface DocLine {
  width: string;
  height: number;
  kind: "name" | "accent" | "text" | "redacted";
  gapBefore?: boolean;
}

const DOC_LINES: DocLine[] = [
  { width: "52%", height: 8, kind: "name" },
  { width: "34%", height: 5, kind: "accent" },
  { width: "82%", height: 4, kind: "text", gapBefore: true },
  { width: "90%", height: 4, kind: "text" },
  { width: "58%", height: 4, kind: "text" },
  { width: "42%", height: 5, kind: "redacted", gapBefore: true },
  { width: "86%", height: 4, kind: "redacted" },
  { width: "68%", height: 4, kind: "redacted" },
];

export default function GradTeaser({ gradKey, title, tagline }: Props) {
  const outerTheme = useTheme();
  const mode = outerTheme.palette.mode;
  const theme = useMemo(() => createWingTheme(mode), [mode]);
  const accent = wingAccent(mode);
  const router = useRouter();
  const reduced = useReducedMotion();

  // The way back: the visitor's own device pass (never rendered server-side,
  // so this page's HTML reveals nothing about its siblings).
  const [backPath, setBackPath] = useState<string | null>(null);
  useEffect(() => {
    setBackPath(getGradPass()?.path ?? null);
  }, []);

  const lineColor = (kind: DocLine["kind"]) => {
    switch (kind) {
      case "name":
        return alpha(theme.palette.text.primary, 0.8);
      case "accent":
        return alpha(accent.main, 0.85);
      case "text":
        return alpha(theme.palette.text.secondary, 0.4);
      case "redacted":
        return alpha(theme.palette.text.primary, 0.6);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          color: "text.primary",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Container
          maxWidth="sm"
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            py: 7,
          }}
        >
          {/* the seal already knows what's coming */}
          <motion.div
            animate={reduced ? undefined : { rotate: [-6, 5, -6], y: [0, -7, 0] }}
            transition={{
              rotate: { duration: 5.4, repeat: Infinity, ease: "easeInOut" },
              y: { duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 },
            }}
            style={{ display: "inline-flex", transform: "rotate(-7deg)" }}
          >
            <ExpressiveShape
              shape={["scallop", "burst", "flower", "clover"]}
              morphDuration={9}
              rotateDuration={reduced ? 0 : 26}
              size={88}
              fill={accent.main}
            >
              <Typography
                sx={{
                  fontFamily: WING_MARK,
                  fontWeight: 800,
                  fontSize: 24,
                  letterSpacing: "0.01em",
                  color: accent.onMain,
                  lineHeight: 1,
                  mt: "-0.05em",
                }}
              >
                {gradKey}
              </Typography>
            </ExpressiveShape>
          </motion.div>

          <Typography
            sx={{
              mt: 4.5,
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "text.secondary",
            }}
          >
            Graduate Wing · The Next Door
          </Typography>

          <Typography
            component="h1"
            sx={{
              mt: 1.5,
              fontFamily: WING_DISPLAY,
              fontWeight: 700,
              fontSize: "clamp(2.1rem, 6.5vw, 3rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.015em",
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
              fontSize: 16.5,
              color: "text.secondary",
            }}
          >
            {tagline}
          </Typography>

          {/* a single page, writing itself — parts of it not for your eyes yet */}
          <Box
            sx={{
              mt: 5,
              width: 158,
              p: 2,
              pb: 2.5,
              borderRadius: "6px",
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: "background.paper",
              boxShadow: `0 10px 30px ${alpha("#000", mode === "dark" ? 0.4 : 0.1)}`,
              transform: "rotate(2deg)",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 0.9,
            }}
          >
            {DOC_LINES.map((line, i) => (
              <Box
                key={i}
                sx={{ width: "100%", mt: line.gapBefore ? 1.1 : 0, display: "flex", alignItems: "center" }}
              >
                <motion.div
                  initial={reduced ? false : { width: 0, opacity: 0 }}
                  animate={{ width: line.width, opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.28, duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
                  style={{
                    height: line.height,
                    borderRadius: 2,
                    background: lineColor(line.kind),
                  }}
                />
                {i === DOC_LINES.length - 1 && (
                  <motion.div
                    animate={{ opacity: [1, 1, 0, 0] }}
                    transition={{ duration: 1.05, repeat: Infinity, times: [0, 0.5, 0.5, 1], delay: 0.5 + i * 0.28 }}
                    style={{
                      width: 5,
                      height: 9,
                      marginLeft: 4,
                      borderRadius: 1,
                      background: accent.main,
                    }}
                  />
                )}
              </Box>
            ))}
          </Box>

          {/* not loading — arriving */}
          <Typography
            sx={{
              mt: 4,
              fontFamily: WING_DISPLAY,
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: "0.02em",
              color: accent.main,
            }}
          >
            Soon
            <Box component="span" sx={{ color: "text.primary" }}>
              .
            </Box>
          </Typography>
        </Container>

        <Box sx={{ display: "flex", justifyContent: "center", gap: 3, pb: 5 }}>
          {backPath && (
            <ButtonBase onClick={() => router.push(backPath)} sx={{ px: 2, py: 1 }}>
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.22em",
                  color: accent.main,
                }}
              >
                ← BACK TO THE WING
              </Typography>
            </ButtonBase>
          )}
          <ButtonBase onClick={() => router.push("/")} sx={{ px: 2, py: 1 }}>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.22em",
                color: "text.secondary",
                "&:hover": { color: "text.primary" },
              }}
            >
              THEDAY
            </Typography>
          </ButtonBase>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
