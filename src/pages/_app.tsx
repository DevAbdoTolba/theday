import "../styles/Material.css";
import "../styles/DribbleButton.css";
import "../styles/RainbowBorder.css";

import React, { useContext, useMemo, useState, useEffect } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Button, CssBaseline } from "@mui/material";
import { Analytics } from "@vercel/analytics/react";
import Offline from "../components/Offline";
import Image from "next/image";
import Head from "next/head";
import { TranscriptContextProvider } from "../context/TranscriptContext";
import IndexedProvider from "../context/IndexedContext";
import { DevOptionsProvider } from "../context/DevOptionsContext";
import DevDashboard from "../components/DevDashboard";

import Script from 'next/script';

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



  const [offline, setOffline] = React.useState(false);
  console.log(
    "%cAbdoTolba was here!! :D",
    "color: red; font-family: sans-serif; font-size: 4.5rem; font-weight: bolder; text-shadow: #000 1px 1px;"
  );
  console.log("https://github.com/DevAbdoTolba");

  // check if there is a localstorage named "first-open-date" if not set it to the current date
  if (typeof window !== "undefined") {
    if (!localStorage.getItem("first-open-date")) {
      localStorage.setItem(
        "first-open-date",
        new Date().toISOString().split("T")[0]
      );
    }
  }

  const [mode, setMode] = useState<'light' | 'dark'>("dark");
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        const newMode = mode === 'light' ? 'dark' : 'light';
        setMode(newMode);
        localStorage.setItem('themeMode', newMode);
      },
    }),
    [mode]
  );

  useEffect(() => {
    const savedMode = localStorage.getItem('themeMode');
    if (savedMode === 'light' || savedMode === 'dark') {
      setMode(savedMode);
    }
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
      APP 
      <Component {...pageProps} />
    </>
  );
}
