/**
 * Mock for src/pages/_app exports used in Storybook.
 * Provides ColorModeContext and offlineContext with safe defaults.
 */
import React from "react";

export const ColorModeContext = React.createContext({
  toggleColorMode: () => {},
});

export const offlineContext = React.createContext<[boolean, React.Dispatch<React.SetStateAction<boolean>>]>(
  [false, () => {}]
);
