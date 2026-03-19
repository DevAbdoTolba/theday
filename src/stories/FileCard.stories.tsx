import type { Meta, StoryObj } from "@storybook/react";
import { FileCard } from "@/components/FileCard";
import type { ParsedFile } from "@/utils/types";

const mockPdf: ParsedFile = {
  id: "file-001",
  name: "Chapter 1 — Introduction to Algorithms.pdf",
  url: "https://drive.google.com/file/d/example/preview",
  type: "pdf",
  isExternalLink: false,
};

const mockYoutube: ParsedFile = {
  id: "file-002",
  name: "Lecture 3 — Sorting Algorithms",
  url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  type: "youtube",
  isExternalLink: true,
  youtubeId: "dQw4w9WgXcQ",
};

const mockImage: ParsedFile = {
  id: "file-003",
  name: "Exam Schedule Spring 2025.png",
  url: "https://drive.google.com/file/d/example/preview",
  type: "image",
  thumbnailUrl: "https://via.placeholder.com/300x200",
  isExternalLink: false,
};

const mockDoc: ParsedFile = {
  id: "file-004",
  name: "Assignment 2 — Binary Trees",
  url: "https://docs.google.com/document/d/example/edit",
  type: "doc",
  isExternalLink: false,
};

const meta = {
  title: "Components/FileCard",
  component: FileCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Grid-view card for a single file or resource. Supports hover-expand preview on desktop and tap-expand on mobile. Indicates new items and file types with icons.",
      },
    },
  },
  argTypes: {
    isNew: { control: "boolean", description: "Show 'New' indicator badge" },
    peekMode: { control: "boolean", description: "Enable hover-expand preview" },
    gridPosition: { control: "select", options: ["left", "right"] },
    onClick: { action: "onClick" },
  },
} satisfies Meta<typeof FileCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PdfFile: Story = {
  args: { file: mockPdf, onClick: () => {} },
};

export const YoutubeFile: Story = {
  args: { file: mockYoutube, onClick: () => {} },
};

export const ImageFile: Story = {
  args: { file: mockImage, onClick: () => {} },
};

export const DocFile: Story = {
  args: { file: mockDoc, onClick: () => {} },
};

export const NewItem: Story = {
  args: { file: mockPdf, isNew: true, onClick: () => {} },
};

export const PeekMode: Story = {
  args: { file: mockPdf, peekMode: true, onClick: () => {} },
};
