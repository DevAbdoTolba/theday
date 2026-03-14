import React from "react";
import dynamic from "next/dynamic";
import { Box, IconButton, Typography, Chip, useTheme } from "@mui/material";
import { AiCartItem } from "../../utils/types";

const DeleteOutline = dynamic(
  () => import("@mui/icons-material/DeleteOutline"),
  { ssr: false }
);
const PictureAsPdf = dynamic(
  () => import("@mui/icons-material/PictureAsPdf"),
  { ssr: false }
);
const YouTube = dynamic(() => import("@mui/icons-material/YouTube"), {
  ssr: false,
});
const Article = dynamic(() => import("@mui/icons-material/Article"), {
  ssr: false,
});
const Slideshow = dynamic(() => import("@mui/icons-material/Slideshow"), {
  ssr: false,
});
const TableChart = dynamic(() => import("@mui/icons-material/TableChart"), {
  ssr: false,
});
const InsertDriveFile = dynamic(
  () => import("@mui/icons-material/InsertDriveFile"),
  { ssr: false }
);
const ImageIcon = dynamic(() => import("@mui/icons-material/Image"), {
  ssr: false,
});

function CartFileIcon({ type }: { type: AiCartItem["type"] }) {
  switch (type) {
    case "pdf":
      return <PictureAsPdf fontSize="small" color="error" />;
    case "youtube":
    case "video":
      return <YouTube fontSize="small" color="error" />;
    case "doc":
      return <Article fontSize="small" color="primary" />;
    case "slide":
      return <Slideshow fontSize="small" color="warning" />;
    case "sheet":
      return <TableChart fontSize="small" color="success" />;
    case "image":
      return <ImageIcon fontSize="small" color="secondary" />;
    default:
      return <InsertDriveFile fontSize="small" color="disabled" />;
  }
}

interface AiCartItemRowProps {
  item: AiCartItem;
  onRemove: (id: string) => void;
}

export default function AiCartItemRow({ item, onRemove }: AiCartItemRowProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        py: 0.75,
        px: 1,
        borderRadius: 1.5,
        transition: "background-color 0.15s ease",
        "&:hover": {
          bgcolor: theme.palette.action.hover,
        },
      }}
    >
      <CartFileIcon type={item.type} />
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          noWrap
          sx={{ fontWeight: 500, lineHeight: 1.3 }}
        >
          {item.name}
        </Typography>
        <Chip
          label={item.type.toUpperCase()}
          size="small"
          variant="outlined"
          sx={{ fontSize: "0.6rem", height: 16, mt: 0.25 }}
        />
      </Box>
      <IconButton
        size="small"
        onClick={() => onRemove(item.id)}
        sx={{ color: "text.secondary", flexShrink: 0 }}
        aria-label={`Remove ${item.name}`}
      >
        <DeleteOutline fontSize="small" />
      </IconButton>
    </Box>
  );
}
