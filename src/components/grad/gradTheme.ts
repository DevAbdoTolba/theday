// src/components/grad/gradTheme.ts
// The Graduation Wing's identity, disciplined: ITI's language is one strong
// red on white and charcoal — nothing else. Color is reserved for the active
// state and progress; everything else is neutral surface and typography.
// The Material 3 Expressive character survives in shape, not in color.

import { createTheme, Theme } from "@mui/material/styles";
import type { ShapeName } from "./expressiveShapes";

export interface WingAccent {
  /** the red */
  main: string;
  /** what sits on top of `main` (letters inside filled shapes) */
  onMain: string;
  /** tonal container behind active items */
  container: string;
  /** text on the tonal container */
  onContainer: string;
}

const RED_LIGHT: WingAccent = {
  main: "#C8102E",
  onMain: "#FFFFFF",
  container: "#FCE9EC",
  onContainer: "#59091A",
};

const RED_DARK: WingAccent = {
  main: "#FF5A68",
  onMain: "#3A060E",
  container: "#43121B",
  onContainer: "#FFD9DD",
};

export function wingAccent(mode: "light" | "dark"): WingAccent {
  return mode === "dark" ? RED_DARK : RED_LIGHT;
}

// Folders keep individual silhouettes — identity through shape, not color.
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
      secondary: { main: dark ? "#9C9CA4" : "#64646B" },
      background: dark
        ? { default: "#131316", paper: "#1C1C20" }
        : { default: "#FAFAFA", paper: "#FFFFFF" },
      text: dark
        ? { primary: "#EDEDF0", secondary: "#9C9CA4" }
        : { primary: "#18181B", secondary: "#64646B" },
      divider: dark ? "rgba(237, 237, 240, 0.08)" : "rgba(24, 24, 27, 0.09)",
    },
    shape: { borderRadius: 14 },
    typography: {
      h2: { fontWeight: 800, letterSpacing: "-0.02em" },
      h6: { fontWeight: 700 },
      button: { textTransform: "none", fontWeight: 700 },
    },
    transitions: { duration: { shortest: 150 } },
  });
}
