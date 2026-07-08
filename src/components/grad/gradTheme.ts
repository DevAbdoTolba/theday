// src/components/grad/gradTheme.ts
// The Graduation Wing's own identity: a Material-3-Expressive tonal system
// built on deep crimson (a nod to where the graduates are heading) with
// graduation gold — deliberately warmer and louder than TheDay's indigo,
// while keeping the same structural design language.

import { createTheme, Theme } from "@mui/material/styles";
import type { ShapeName } from "./expressiveShapes";

export interface WingAccent {
  name: string;
  shape: ShapeName;
  main: string;
  container: string;
  onContainer: string;
}

const DARK_ACCENTS: WingAccent[] = [
  { name: "crimson", shape: "scallop", main: "#FF8A96", container: "#5C1423", onContainer: "#FFD9DC" },
  { name: "gold", shape: "burst", main: "#F6CE6B", container: "#4E3B00", onContainer: "#FFE8B8" },
  { name: "teal", shape: "flower", main: "#86D2CE", container: "#0F3D3B", onContainer: "#C2FFF9" },
  { name: "plum", shape: "clover", main: "#D9B3E4", container: "#452152", onContainer: "#F4D9FF" },
];

const LIGHT_ACCENTS: WingAccent[] = [
  { name: "crimson", shape: "scallop", main: "#A4243B", container: "#FFD9DC", onContainer: "#40000D" },
  { name: "gold", shape: "burst", main: "#7A5900", container: "#FFDEA1", onContainer: "#261900" },
  { name: "teal", shape: "flower", main: "#016964", container: "#C2FFF9", onContainer: "#002020" },
  { name: "plum", shape: "clover", main: "#7A4E8C", container: "#F4D9FF", onContainer: "#2E0A3C" },
];

export function wingAccents(mode: "light" | "dark"): WingAccent[] {
  return mode === "dark" ? DARK_ACCENTS : LIGHT_ACCENTS;
}

export function accentFor(mode: "light" | "dark", index: number): WingAccent {
  const list = wingAccents(mode);
  return list[index % list.length];
}

export function createWingTheme(mode: "light" | "dark"): Theme {
  const dark = mode === "dark";
  return createTheme({
    palette: {
      mode,
      primary: { main: dark ? "#FF8A96" : "#A4243B", contrastText: dark ? "#40000D" : "#FFFFFF" },
      secondary: { main: dark ? "#F6CE6B" : "#7A5900" },
      background: dark
        ? { default: "#181114", paper: "#221519" }
        : { default: "#FFF8F7", paper: "#FFFFFF" },
      text: dark
        ? { primary: "#F3DEDF", secondary: "#C9A9AD" }
        : { primary: "#2B1518", secondary: "#71585B" },
      divider: dark ? "rgba(243, 222, 223, 0.09)" : "rgba(43, 21, 24, 0.1)",
    },
    shape: { borderRadius: 20 },
    typography: {
      h2: { fontWeight: 800, letterSpacing: "-0.02em" },
      h6: { fontWeight: 700 },
      button: { textTransform: "none", fontWeight: 700 },
    },
    transitions: { duration: { shortest: 150 } },
  });
}
