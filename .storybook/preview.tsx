import type { Preview } from "@storybook/react";
import React, { useMemo, useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { DevOptionsProvider } from "../src/context/DevOptionsContext";
import { DataContext } from "../src/context/TranscriptContext";
import { IndexedContext } from "../src/context/IndexedContext";
import { SearchProvider } from "../src/context/SearchContext";
import "../src/styles/globals.css";
import "../src/styles/Material.css";

// ─── Mock: TranscriptContext ────────────────────────────────────────────────
const mockDataContextValue = {
  transcript: {
    semesters: [
      {
        index: 1,
        subjects: [
          { name: "Mathematics", abbreviation: "MATH" },
          { name: "Physics", abbreviation: "PHYS" },
        ],
      },
      {
        index: 2,
        subjects: [
          { name: "Data Structures", abbreviation: "DS" },
          { name: "Algorithms", abbreviation: "ALGO" },
        ],
      },
    ],
  },
  loadingTranscript: false,
  className: "CS-22",
  setLoadingTranscript: () => {},
  error: null,
  setClassName: () => {},
};

// ─── Mock: IndexedContext ────────────────────────────────────────────────────
// Uses the real exported IndexedContext so useIndexedContext() picks this up.
const mockIndexedValue = {
  updatedItems: ["sample-new-item-id"],
  loading: false,
  setLoading: () => {},
  getSubjectByName: async () => null,
  addOrUpdateSubject: async () => ({ msg: "noop", newItems: [] }),
};

// ─── Color Mode Context ──────────────────────────────────────────────────────
// Also exported from .storybook/mocks/pages-app.ts via Vite alias so that
// components importing ColorModeContext from "pages/_app" get this value.
export const ColorModeContext = React.createContext({
  toggleColorMode: () => {},
});

// ─── Offline Context ─────────────────────────────────────────────────────────
// Also exported from .storybook/mocks/pages-app.ts via Vite alias.
export const offlineContext = React.createContext<[boolean, any]>([false, () => {}]);

// ─── Global Story Decorator ──────────────────────────────────────────────────
function TheDayDecorator({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<"light" | "dark">("dark");

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => setMode((prev) => (prev === "light" ? "dark" : "light")),
    }),
    []
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "light"
            ? {
                background: { default: "#f4f6fb", paper: "#f4f6fb" },
                text: { primary: "#151a2c" },
              }
            : {
                background: { default: "#151a2c", paper: "#151a2c" },
                text: { primary: "#fff" },
              }),
        },
        shape: { borderRadius: 12 },
        transitions: { duration: { shortest: 150 } },
      }),
    [mode]
  );

  return (
    <DevOptionsProvider>
      <IndexedContext.Provider value={mockIndexedValue}>
        {/* @ts-ignore – static mock satisfies the shape for stories */}
        <DataContext.Provider value={mockDataContextValue}>
          <ColorModeContext.Provider value={colorMode}>
            <offlineContext.Provider value={[false, () => {}]}>
              <SearchProvider>
                <ThemeProvider theme={theme}>
                  <CssBaseline />
                  {children}
                </ThemeProvider>
              </SearchProvider>
            </offlineContext.Provider>
          </ColorModeContext.Provider>
        </DataContext.Provider>
      </IndexedContext.Provider>
    </DevOptionsProvider>
  );
}

const preview: Preview = {
  decorators: [
    (Story) => (
      <TheDayDecorator>
        <Story />
      </TheDayDecorator>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: "centered",
    backgrounds: {
      default: "dark",
      values: [
        { name: "dark", value: "#151a2c" },
        { name: "light", value: "#f4f6fb" },
        { name: "white", value: "#ffffff" },
      ],
    },
    viewport: {
      viewports: {
        mobile: { name: "Mobile (375px)", styles: { width: "375px", height: "667px" } },
        tablet: { name: "Tablet (768px)", styles: { width: "768px", height: "1024px" } },
        desktop: { name: "Desktop (1440px)", styles: { width: "1440px", height: "900px" } },
      },
      defaultViewport: "desktop",
    },
    a11y: {
      config: {
        rules: [
          { id: "color-contrast", enabled: true },
          { id: "keyboard-navigation", enabled: true },
        ],
      },
    },
  },
};

export default preview;
