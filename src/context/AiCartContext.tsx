import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { Snackbar, Alert } from "@mui/material";
import { AiCartItem } from "../utils/types";
import {
  readAiModeActive,
  writeAiModeActive,
  readAiCartItems,
  writeAiCartItems,
  clearAiCartStorage,
  formatCartToMarkdown,
} from "../utils/ai-cart-helpers";

export interface AiCartContextValue {
  aiModeActive: boolean;
  items: AiCartItem[];
  itemCount: number;
  toggleAiMode: () => void;
  addItem: (item: AiCartItem) => void;
  removeItem: (id: string) => void;
  toggleItem: (item: AiCartItem) => void;
  clearCart: () => void;
  isSelected: (id: string) => boolean;
  exportMarkdown: () => string;
  storageError: string | null;
  dismissStorageError: () => void;
}

const noop = () => {};

export const AiCartContext = createContext<AiCartContextValue>({
  aiModeActive: false,
  items: [],
  itemCount: 0,
  toggleAiMode: noop,
  addItem: noop,
  removeItem: noop,
  toggleItem: noop,
  clearCart: noop,
  isSelected: () => false,
  exportMarkdown: () => "",
  storageError: null,
  dismissStorageError: noop,
});

export function AiCartProvider({ children }: { children: React.ReactNode }) {
  const [aiModeActive, setAiModeActive] = useState(false);
  const [items, setItems] = useState<AiCartItem[]>([]);
  const [storageError, setStorageError] = useState<string | null>(null);

  // Hydrate from localStorage on mount (client-only)
  useEffect(() => {
    setAiModeActive(readAiModeActive());
    setItems(readAiCartItems());
  }, []);

  // Persist AI mode changes
  useEffect(() => {
    writeAiModeActive(aiModeActive);
  }, [aiModeActive]);

  // Persist cart changes
  useEffect(() => {
    try {
      writeAiCartItems(items);
      setStorageError(null);
    } catch {
      setStorageError(
        "Storage is full. Please clear the cart to free space."
      );
    }
  }, [items]);

  // Cross-tab sync
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === "aiModeActive") {
        setAiModeActive(e.newValue === "true");
      }
      if (e.key === "aiCartItems") {
        setItems(e.newValue ? (JSON.parse(e.newValue) as AiCartItem[]) : []);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const toggleAiMode = useCallback(() => {
    setAiModeActive((prev) => !prev);
  }, []);

  const addItem = useCallback((item: AiCartItem) => {
    setItems((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev;
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const toggleItem = useCallback((item: AiCartItem) => {
    setItems((prev) => {
      if (prev.some((i) => i.id === item.id)) {
        return prev.filter((i) => i.id !== item.id);
      }
      return [...prev, item];
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    clearAiCartStorage();
  }, []);

  const isSelected = useCallback(
    (id: string) => items.some((i) => i.id === id),
    [items]
  );

  const exportMarkdown = useCallback(() => {
    return formatCartToMarkdown(items);
  }, [items]);

  const dismissStorageError = useCallback(() => {
    setStorageError(null);
  }, []);

  const value = useMemo<AiCartContextValue>(
    () => ({
      aiModeActive,
      items,
      itemCount: items.length,
      toggleAiMode,
      addItem,
      removeItem,
      toggleItem,
      clearCart,
      isSelected,
      exportMarkdown,
      storageError,
      dismissStorageError,
    }),
    [
      aiModeActive,
      items,
      toggleAiMode,
      addItem,
      removeItem,
      toggleItem,
      clearCart,
      isSelected,
      exportMarkdown,
      storageError,
      dismissStorageError,
    ]
  );

  return (
    <AiCartContext.Provider value={value}>
      {children}
      <Snackbar
        open={!!storageError}
        autoHideDuration={6000}
        onClose={dismissStorageError}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="warning" variant="filled" onClose={dismissStorageError}>
          {storageError}
        </Alert>
      </Snackbar>
    </AiCartContext.Provider>
  );
}
