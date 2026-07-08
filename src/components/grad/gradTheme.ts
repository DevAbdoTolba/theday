// src/components/grad/gradTheme.ts
// The Graduation Wing's identity: a printed course-reader. Warm paper (or
// warm ink in dark mode), near-black typography, and ITI's red used with
// commitment — the stamp, the index marker, progress, nothing else.
// Typography carries the design: Fraunces for the masthead (via
// --wing-display), Space Grotesk for the registry (via --wing-sans).

import { createTheme, Theme } from "@mui/material/styles";
import type { ShapeName } from "./expressiveShapes";

export const WING_DISPLAY = "var(--wing-display), Georgia, serif";
export const WING_SANS = "var(--wing-sans), Roboto, sans-serif";

export interface WingAccent {
  /** the red */
  main: string;
  /** what sits on top of `main` (the stamp's numerals) */
  onMain: string;
}

const RED_LIGHT: WingAccent = { main: "#BE0F2C", onMain: "#FFF6F0" };
const RED_DARK: WingAccent = { main: "#FF4D5E", onMain: "#2A0509" };

export function wingAccent(mode: "light" | "dark"): WingAccent {
  return mode === "dark" ? RED_DARK : RED_LIGHT;
}

// Kept for the masthead stamp and the ceremony.
export const WING_SHAPES: ShapeName[] = ["scallop", "burst", "flower", "clover"];

export function shapeFor(index: number): ShapeName {
  return WING_SHAPES[index % WING_SHAPES.length];
}

export function createWingTheme(mode: "light" | "dark"): Theme {
  const dark = mode === "dark";
  const accent = wingAccent(mode);
  return createTheme({
    palette: {
      mode,
      primary: { main: accent.main, contrastText: accent.onMain },
      secondary: { main: dark ? "#9A948A" : "#6E675D" },
      background: dark
        ? { default: "#171519", paper: "#1E1C21" }
        : { default: "#F7F4EE", paper: "#FDFBF7" },
      text: dark
        ? { primary: "#F0EDE6", secondary: "#9A948A" }
        : { primary: "#1C1917", secondary: "#6E675D" },
      divider: dark ? "rgba(240, 237, 230, 0.12)" : "rgba(28, 25, 23, 0.14)",
    },
    shape: { borderRadius: 4 },
    typography: {
      fontFamily: WING_SANS,
      button: { textTransform: "none", fontWeight: 600 },
    },
    transitions: { duration: { shortest: 150 } },
  });
}
