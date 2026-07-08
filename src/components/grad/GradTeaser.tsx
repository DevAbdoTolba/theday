// src/components/grad/GradTeaser.tsx
// A door that isn't open yet. Renders for registry sections marked
// `teaser`: the wing's editorial language — seal, serif, hairline — but
// nothing behind it except a promise. No pass is granted here, no data
// is served; it exists purely to make graduates lean closer. 👀

import React, { useMemo } from "react";
import { useRouter } from "next/router";
import { Box, ButtonBase, Container, Typography, alpha, useTheme } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { motion, useReducedMotion } from "framer-motion";
import ExpressiveShape from "./ExpressiveShape";
import { createWingTheme, wingAccent, WING_DISPLAY, WING_MARK } from "./gradTheme";

interface Props {
  gradKey: string;
  title: string;
  tagline: string;
}

export default function GradTeaser({ gradKey, title, tagline }: Props) {
  const outerTheme = useTheme();
  const mode = outerTheme.palette.mode;
  const theme = useMemo(() => createWingTheme(mode), [mode]);
  const accent = wingAccent(mode);
  const router = useRouter();
  const reduced = useReducedMotion();

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
            py: 8,
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
              size={96}
              fill={accent.main}
            >
              <Typography
                sx={{
                  fontFamily: WING_MARK,
                  fontWeight: 800,
                  fontSize: 26,
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
              mt: 5,
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

          {/* something is being typeset… */}
          <Box
            sx={{
              mt: 4.5,
              width: 180,
              height: 2,
              position: "relative",
              overflow: "hidden",
              bgcolor: alpha(theme.palette.text.primary, 0.1),
              borderRadius: 1,
            }}
          >
            <motion.div
              animate={{ x: [-72, 180] }}
              transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.4 }}
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                width: 72,
                background: accent.main,
                borderRadius: 2,
              }}
            />
          </Box>

          <Typography
            sx={{
              mt: 2,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.34em",
              color: accent.main,
            }}
          >
            SOON
          </Typography>
        </Container>

        <Box sx={{ display: "flex", justifyContent: "center", pb: 5 }}>
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
              ← THEDAY
            </Typography>
          </ButtonBase>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
