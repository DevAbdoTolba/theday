import "../styles/Material.css";
import "../styles/DribbleButton.css";
import "../styles/RainbowBorder.css";

import React, { useMemo, useState, useEffect } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Button, CssBaseline } from "@mui/material";
import { Analytics } from "@vercel/analytics/react";
import Image from "next/image";
import Head from "next/head";
import { TranscriptContextProvider } from "../context/TranscriptContext";
import IndexedProvider from "../context/IndexedContext";
import { SearchProvider } from "../context/SearchContext";
import { isBrowser, getItem, setItem } from "../utils/storage";

// const useStyles = makeStyles((theme) => ({
//   "@global": {
//     html: {
//       WebkitFontSmoothing: "auto",
//       MozOsxFontSmoothing: "auto",
//       boxSizing: "border-box",
//     },
//     "*, *::before, *::after": {
//       boxSizing: "inherit",
//     },
//     body: {
//       margin: 0,
//       background: theme.palette.background.default,
//     },
//   },
// }));

export const ColorModeContext = React.createContext({ toggleColorMode: () => {} });

export const offlineContext = React.createContext<any>({});

export default function App({
  Component,
  pageProps,
}: {
  Component: React.ComponentType<any>;
  pageProps: any;
}) {
  // const classes = useStyles();

  useEffect(() => {
    if (!isBrowser) return;
    const handler = () => updateOnlineStatus(navigator);
    window.addEventListener("online", handler);
    window.addEventListener("offline", handler);
    handler();
    return () => {
      window.removeEventListener("online", handler);
      window.removeEventListener("offline", handler);
    };
  }, []);

  const updateOnlineStatus = (navigator: Navigator) => {
    if (navigator.onLine) {
      setOffline(false);
    }
    if (!navigator.onLine) {
      setOffline(true);
    }
  };

  const [offline, setOffline] = useState(false);

  // check if there is a localstorage named "first-open-date" if not set it to the current date
  useEffect(() => {
    if (!isBrowser) return;
    if (!getItem("first-open-date")) {
      setItem("first-open-date", new Date().toISOString().split("T")[0]);
    }
  }, []);

  const [mode, setMode] = useState<'light' | 'dark'>("dark");
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        const newMode = mode === 'light' ? 'dark' : 'light';
        setMode(newMode);
        setItem('themeMode', newMode);
      },
    }),
    [mode]
  );

  useEffect(() => {
    if (!isBrowser) return;
    const savedMode = getItem('themeMode');
    if (savedMode === 'light' || savedMode === 'dark') {
      setMode(savedMode as 'light' | 'dark');
      return;
    }
    // Fallback to prefers-color-scheme
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setMode(prefersDark ? 'dark' : 'light');
  }, []);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "light"
            ? {
                background: {
                  default: "#f4f6fb",
                  paper: "#f4f6fb",
                },
                text: {
                  primary: "#151a2c",
                },
              }
            : {
                background: {
                  default: "#151a2c",
                  paper: "#151a2c",
                },
                text: {
                  primary: "#fff",
                },
              }),
        },
        shape: { borderRadius: 12 },
        transitions: { duration: { shortest: 150 } },
      }),
    [mode]
  );

  return (
    <>
      <Head>
        <title>{"TheDay"}</title>
        {/* <meta name="description" content={description} /> */}
        <link rel="icon" href={"/main.png"} />
        <meta name="theme-color" content={mode === 'dark' ? '#151a2c' : '#f4f6fb'} />
        <meta name="color-scheme" content={mode === 'dark' ? 'dark light' : 'light dark'} />
      </Head>
      <IndexedProvider>
        <TranscriptContextProvider>
          <SearchProvider>
            <offlineContext.Provider value={[offline, setOffline]}>
              <ColorModeContext.Provider value={colorMode}>
                <ThemeProvider theme={theme}>
                  <CssBaseline />
                  <Image
                    src={"/icon-512x512.png"}
                    alt="icon"
                    width={200}
                    height={200}
                    style={{
                      position: "fixed",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      zIndex: -100,
                      opacity: 0,
                    }}
                  />
                  <Component {...pageProps} />
                  <Analytics />
                </ThemeProvider>
              </ColorModeContext.Provider>
            </offlineContext.Provider>
          </SearchProvider>
        </TranscriptContextProvider>
      </IndexedProvider>
    </>
  );
}
