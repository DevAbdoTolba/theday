import "../styles/Material.css";
import "../styles/DribbleButton.css";
import "../styles/RainbowBorder.css";

import React from "react";
import { AppProviders } from "../context/AppContext";

export default function App({
  Component,
  pageProps,
}: {
  Component: React.ComponentType<any>;
  pageProps: any;
}) {
  return (
    <AppProviders>
      <Component {...pageProps} />
    </AppProviders>
  );
}
