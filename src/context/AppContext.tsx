import React, { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import IndexedProvider from "./IndexedContext";
import { TranscriptContextProvider } from "./TranscriptContext";
import { SearchProvider } from "./SearchContext";
import Image from "next/image";
import { getItem, setItem, isBrowser } from "../utils/storage";

export const ColorModeContext = React.createContext({ toggleColorMode: () => {} });
export const offlineContext = React.createContext<any>({});

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const [offline, setOffline] = useState(false);
  const [mode, setMode] = useState<"light" | "dark">("dark");

  const updateOnlineStatus = (navigatorObj: Navigator) => {
    if (navigatorObj.onLine) setOffline(false);
    else setOffline(true);
  };

  // online/offline listener
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

  // first open date init
  useEffect(() => {
    if (!isBrowser) return;
    if (!getItem("first-open-date")) {
      setItem("first-open-date", new Date().toISOString().split("T")[0]);
    }
  }, []);

  // theme mode setup
  useEffect(() => {
    if (!isBrowser) return;
    const savedMode = getItem("themeMode");
    if (savedMode === "light" || savedMode === "dark") {
      setMode(savedMode as "light" | "dark");
      return;
    }
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    setMode(prefersDark ? "dark" : "light");
  }, []);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        const newMode = mode === "light" ? "dark" : "light";
        setMode(newMode);
        setItem("themeMode", newMode);
      },
    }),
    [mode]
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
    <IndexedProvider>
      <TranscriptContextProvider>
        <SearchProvider>
          <offlineContext.Provider value={[offline, setOffline]}>
            <ColorModeContext.Provider value={colorMode}>
              <ThemeProvider theme={theme}>
                <CssBaseline />
                <Head>
                  <title>{"TheDay"}</title>
                  <link rel="icon" href={"/main.png"} />
                  <meta name="theme-color" content={mode === "dark" ? "#151a2c" : "#f4f6fb"} />
                  <meta name="color-scheme" content={mode === "dark" ? "dark light" : "light dark"} />
                </Head>
                {/* Preload app icon (invisible) */}
                <Image
                  src={"/icon-512x512.png"}
                  alt="icon"
                  width={200}
                  height={200}
                  style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: -100, opacity: 0 }}
                />
                {children}
              </ThemeProvider>
            </ColorModeContext.Provider>
          </offlineContext.Provider>
        </SearchProvider>
      </TranscriptContextProvider>
    </IndexedProvider>
  );
}
