import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Badge, Fab, useTheme, alpha } from "@mui/material";
import { useAiCart } from "../../hooks/useAiCart";
import AiCartPanel from "./AiCartPanel";

const AutoAwesome = dynamic(
  () => import("@mui/icons-material/AutoAwesome"),
  { ssr: false }
);

export default function AiCartFab() {
  const { aiModeActive, itemCount } = useAiCart();
  const [panelOpen, setPanelOpen] = useState(false);
  const theme = useTheme();

  const visible = aiModeActive || itemCount > 0;

  if (!visible) return null;

  return (
    <>
      <Fab
        color="primary"
        aria-label="AI Cart"
        onClick={() => setPanelOpen((prev) => !prev)}
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 1100,
          boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            transform: "scale(1.08)",
            boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
          },
          "&:active": {
            transform: "scale(0.95)",
          },
        }}
      >
        <Badge
          badgeContent={itemCount}
          color="error"
          max={99}
          sx={{
            "& .MuiBadge-badge": {
              fontWeight: 700,
              fontSize: "0.7rem",
            },
          }}
        >
          <AutoAwesome />
        </Badge>
      </Fab>

      <AiCartPanel open={panelOpen} onClose={() => setPanelOpen(false)} />
    </>
  );
}
