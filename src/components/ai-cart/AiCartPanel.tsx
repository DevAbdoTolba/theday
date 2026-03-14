import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Snackbar,
  Alert,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useAiCart } from "../../hooks/useAiCart";
import { AiCartItem } from "../../utils/types";
import { formatCartToMarkdown } from "../../utils/ai-cart-helpers";
import AiCartItemRow from "./AiCartItemRow";

const Close = dynamic(() => import("@mui/icons-material/Close"), {
  ssr: false,
});
const DeleteSweep = dynamic(
  () => import("@mui/icons-material/DeleteSweep"),
  { ssr: false }
);
const ContentCopy = dynamic(
  () => import("@mui/icons-material/ContentCopy"),
  { ssr: false }
);
const ShoppingCartOutlined = dynamic(
  () => import("@mui/icons-material/ShoppingCartOutlined"),
  { ssr: false }
);

interface AiCartPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function AiCartPanel({ open, onClose }: AiCartPanelProps) {
  const theme = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const { items, itemCount, removeItem, clearCart } = useAiCart();
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });
  const [fallbackMarkdown, setFallbackMarkdown] = useState<string | null>(null);

  // Group items by className → subjectName
  const grouped = useMemo(() => {
    return items.reduce<Record<string, Record<string, AiCartItem[]>>>(
      (acc, item) => {
        if (!acc[item.className]) acc[item.className] = {};
        if (!acc[item.className][item.subjectName])
          acc[item.className][item.subjectName] = [];
        acc[item.className][item.subjectName].push(item);
        return acc;
      },
      {}
    );
  }, [items]);

  const handleExport = async () => {
    const markdown = formatCartToMarkdown(items);
    try {
      await navigator.clipboard.writeText(markdown);
      window.open("https://notebooklm.google.com/", "_blank");
      setSnackbar({
        open: true,
        message: "Copied to clipboard! NotebookLM opened.",
        severity: "success",
      });
      setFallbackMarkdown(null);
    } catch {
      setFallbackMarkdown(markdown);
      setSnackbar({
        open: true,
        message: "Clipboard access denied. Please copy manually.",
        severity: "error",
      });
    }
  };

  const handleClear = () => {
    clearCart();
    onClose();
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: { xs: "85vw", sm: 380 },
            maxWidth: 420,
            bgcolor: theme.palette.background.default,
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.5,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            AI Cart ({itemCount})
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: "auto", px: 2, py: 1.5 }}>
          {itemCount === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 8,
                opacity: 0.5,
              }}
            >
              <ShoppingCartOutlined sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="body2">Your cart is empty</Typography>
              <Typography variant="caption" color="text.secondary">
                Toggle AI Mode and click materials to add them
              </Typography>
            </Box>
          ) : (
            Object.keys(grouped)
              .sort()
              .map((className) => (
                <Box key={className} sx={{ mb: 2 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    sx={{ mb: 0.5 }}
                  >
                    {className || "Unknown Class"}
                  </Typography>
                  {Object.keys(grouped[className])
                    .sort()
                    .map((subjectName) => (
                      <Box key={subjectName} sx={{ ml: 1, mb: 1 }}>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          sx={{ mb: 0.25 }}
                        >
                          {subjectName}
                        </Typography>
                        <AnimatePresence initial={false}>
                          {grouped[className][subjectName]
                            .sort((a, b) => a.addedAt - b.addedAt)
                            .map((item, index) => (
                              <motion.div
                                key={item.id}
                                initial={prefersReducedMotion ? false : { opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                                transition={prefersReducedMotion ? { duration: 0 } : {
                                  duration: 0.25,
                                  delay: index * 0.03,
                                  exit: { duration: 0.2 },
                                }}
                                layout={false}
                              >
                                <AiCartItemRow
                                  item={item}
                                  onRemove={removeItem}
                                />
                              </motion.div>
                            ))}
                        </AnimatePresence>
                      </Box>
                    ))}
                  <Divider sx={{ mt: 1 }} />
                </Box>
              ))
          )}

          {/* Clipboard fallback */}
          {fallbackMarkdown && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
                Copy the Markdown below manually:
              </Typography>
              <TextField
                multiline
                fullWidth
                value={fallbackMarkdown}
                InputProps={{ readOnly: true }}
                minRows={4}
                maxRows={12}
                size="small"
                sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}
              />
            </Box>
          )}
        </Box>

        {/* Footer actions */}
        {itemCount > 0 && (
          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderTop: `1px solid ${theme.palette.divider}`,
              display: "flex",
              gap: 1,
            }}
          >
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<DeleteSweep />}
              onClick={handleClear}
              sx={{ flex: 1 }}
            >
              Clear
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<ContentCopy />}
              onClick={() => void handleExport()}
              sx={{ flex: 2 }}
            >
              Export for NotebookLM
            </Button>
          </Box>
        )}
      </Drawer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
