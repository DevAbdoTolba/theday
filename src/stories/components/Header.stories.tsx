import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Header from "../../components/Header";
import { DataContext } from "../../context/TranscriptContext";
import { ColorModeContext } from "../../pages/_app";
import React from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import IndexedProvider from "../../context/IndexedContext";

const meta = {
  component: Header,
  decorators: [
    (Story) => {
      const theme = createTheme({
        palette: { mode: "dark", background: { default: "#151a2c", paper: "#151a2c" }, text: { primary: "#fff" } },
        shape: { borderRadius: 12 },
      });

      const dataCtxValue = {
        transcript: null,
        loadingTranscript: false,
        className: "default",
        setLoadingTranscript: () => {},
        error: null,
        setClassName: () => {},
      } as any;

      const colorMode = { toggleColorMode: () => {} };

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('classes', JSON.stringify([{ class: 'default', id: 'default' }]));
          localStorage.setItem('className', 'default');
        } catch {}
      }

      return (
        <ColorModeContext.Provider value={colorMode}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <DataContext.Provider value={dataCtxValue}>
              <IndexedProvider>
                <div style={{ minHeight: 120 }}>
                  <Story />
                </div>
              </IndexedProvider>
            </DataContext.Provider>
          </ThemeProvider>
        </ColorModeContext.Provider>
      );
    },
  ],
} satisfies Meta<typeof Header>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "TheDay",
    isSearch: false,
  },
};

export const WithSubjectSearch: Story = {
  args: {
    title: "Subjects",
    isSearch: false,
    isSubjectSearch: true,
    data: {
      Week1: [
        { id: "1", name: "Intro.pdf", mimeType: "application/pdf", parents: ["w1"], size: 1000 },
        { id: "2", name: "Link http://example.com", mimeType: "text/plain", parents: ["w1"], size: 0 },
      ],
      Week2: [
        { id: "3", name: "Lecture.mp4", mimeType: "video/mp4", parents: ["w2"], size: 2000 },
      ],
    },
  },
};
