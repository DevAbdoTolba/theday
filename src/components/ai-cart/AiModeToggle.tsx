import React from "react";
import { Box, Switch, Typography, useTheme, alpha } from "@mui/material";
import { useAiCart } from "../../hooks/useAiCart";

export default function AiModeToggle() {
  const { aiModeActive, toggleAiMode } = useAiCart();
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        bgcolor: aiModeActive
          ? alpha(theme.palette.primary.main, 0.12)
          : "transparent",
        borderRadius: 2,
        px: 1,
        transition: "background-color 0.2s ease",
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          fontSize: "0.7rem",
          color: aiModeActive ? "primary.main" : "text.secondary",
          display: { xs: "none", sm: "block" },
          userSelect: "none",
        }}
      >
        AI
      </Typography>
      <Switch
        checked={aiModeActive}
        onChange={toggleAiMode}
        size="small"
        color="primary"
        inputProps={{ "aria-label": "Toggle AI Mode" }}
      />
    </Box>
  );
}
