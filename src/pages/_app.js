import "../styles/Material.css";

import React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Button, CssBaseline } from "@mui/material";
import { Analytics } from "@vercel/analytics/react";
import Offline from "../components/Offline";
import Image from "next/image";
import Head from "next/head";

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

const theme = createTheme({
  palette: {
    mode: "dark",
  },
});

// custom CssBaseline with dark mode

export const offlineContext = React.createContext();

export default function App({ Component, pageProps }) {
  // const classes = useStyles();

  React.useEffect(() => {
    window.addEventListener("online", () => updateOnlineStatus(navigator));
    window.addEventListener("offline", () => updateOnlineStatus(navigator));
  }, []);

  const updateOnlineStatus = (navigator) => {
    if (navigator.onLine) {
      setOffline(false);
    }
    if (!navigator.onLine) {
      setOffline(true);
    }
  };

  const [offline, setOffline] = React.useState(false);

  return (
    <offlineContext.Provider value={[offline, setOffline]}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Image
          src={"/icon-512x512.png"}
          alt="icon"
          width={"200"}
          height={"200"}
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
    </offlineContext.Provider>
  );
}
