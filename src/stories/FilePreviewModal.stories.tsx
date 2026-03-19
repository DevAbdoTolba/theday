import type { Meta, StoryObj } from "@storybook/react";
import FilePreviewModal from "@/components/FilePreviewModal";
import type { ParsedFile } from "@/utils/types";

const pdfFile: ParsedFile = {
  id: "pdf-001",
  name: "Chapter 1 — Introduction to Algorithms.pdf",
  url: "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/preview",
  type: "pdf",
  isExternalLink: false,
};

const youtubeFile: ParsedFile = {
  id: "yt-001",
  name: "Lecture 3 — Sorting Algorithms",
  url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  type: "youtube",
  isExternalLink: true,
  youtubeId: "dQw4w9WgXcQ",
};

const imageFile: ParsedFile = {
  id: "img-001",
  name: "Exam Schedule Spring 2025.png",
  url: "https://drive.google.com/file/d/example/preview",
  type: "image",
  thumbnailUrl: "https://picsum.photos/800/600",
  isExternalLink: false,
};

const unknownFile: ParsedFile = {
  id: "unk-001",
  name: "Miscellaneous Resource",
  url: "https://example.com/resource",
  type: "unknown",
  isExternalLink: true,
};

const meta = {
  title: "Components/FilePreviewModal",
  component: FilePreviewModal,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Full-screen modal for previewing files. Supports PDF via Google Drive embed, YouTube videos, images with high-resolution thumbnails, and generic external links.",
      },
    },
  },
  argTypes: {
    open: { control: "boolean" },
    onClose: { action: "onClose" },
  },
} satisfies Meta<typeof FilePreviewModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PdfPreview: Story = {
  args: { open: true, file: pdfFile, onClose: () => {} },
};

export const YoutubePreview: Story = {
  args: { open: true, file: youtubeFile, onClose: () => {} },
};

export const ImagePreview: Story = {
  args: { open: true, file: imageFile, onClose: () => {} },
};

export const UnknownFile: Story = {
  args: { open: true, file: unknownFile, onClose: () => {} },
};

export const Closed: Story = {
  args: { open: false, file: pdfFile, onClose: () => {} },
};

export const NullFile: Story = {
  args: { open: true, file: null, onClose: () => {} },
};
