import { useContext } from "react";
import { AiCartContext } from "../context/AiCartContext";
import type { AiCartContextValue } from "../context/AiCartContext";

export function useAiCart(): AiCartContextValue {
  const ctx = useContext(AiCartContext);
  if (!ctx) {
    throw new Error("useAiCart must be used within an AiCartProvider");
  }
  return ctx;
}
