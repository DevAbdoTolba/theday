// src/components/FileTypeIcon.tsx
// Single source of truth for file-type presentation (icon, label, tint).
// FileCard, FileListItem, and the Graduation Wing all render from this map
// so a given file shows the same glyph everywhere and new ParsedFile types
// only need to be added once.

import React from "react";
import dynamic from "next/dynamic";
import type { SvgIconProps } from "@mui/material";
import type { ParsedFile } from "../utils/types";

const PictureAsPdf = dynamic(() => import("@mui/icons-material/PictureAsPdf"), { ssr: false });
const Folder = dynamic(() => import("@mui/icons-material/Folder"), { ssr: false });
const ImageIcon = dynamic(() => import("@mui/icons-material/Image"), { ssr: false });
const YouTube = dynamic(() => import("@mui/icons-material/YouTube"), { ssr: false });
const OndemandVideo = dynamic(() => import("@mui/icons-material/OndemandVideo"), { ssr: false });
const Article = dynamic(() => import("@mui/icons-material/Article"), { ssr: false });
const Slideshow = dynamic(() => import("@mui/icons-material/Slideshow"), { ssr: false });
const TableChart = dynamic(() => import("@mui/icons-material/TableChart"), { ssr: false });
const InsertDriveFile = dynamic(() => import("@mui/icons-material/InsertDriveFile"), { ssr: false });
const LinkIcon = dynamic(() => import("@mui/icons-material/Link"), { ssr: false });

type FileType = ParsedFile["type"];

export const FILE_TYPE_LABEL: Record<FileType, string> = {
  pdf: "PDF",
  video: "Video",
  youtube: "YouTube",
  doc: "Doc",
  sheet: "Sheet",
  slide: "Slides",
  image: "Image",
  folder: "Folder",
  unknown: "Link",
};

const FILE_TYPE_ICON: Record<FileType, React.ComponentType<SvgIconProps>> = {
  pdf: PictureAsPdf,
  video: OndemandVideo,
  youtube: YouTube,
  doc: Article,
  sheet: TableChart,
  slide: Slideshow,
  image: ImageIcon,
  folder: Folder,
  unknown: InsertDriveFile,
};

/** Tints used by the classic file browsers (FileCard / FileListItem). */
export const FILE_TYPE_TINT: Record<FileType, SvgIconProps["color"]> = {
  pdf: "error",
  youtube: "error",
  video: "action",
  folder: "primary",
  image: "secondary",
  doc: "primary",
  slide: "warning",
  sheet: "success",
  unknown: "disabled",
};

export default function FileTypeIcon({
  type,
  external = false,
  ...iconProps
}: { type: FileType; external?: boolean } & SvgIconProps) {
  // External links share the "unknown" type; give them a link glyph
  const Icon = external && type === "unknown" ? LinkIcon : FILE_TYPE_ICON[type];
  return <Icon {...iconProps} />;
}
