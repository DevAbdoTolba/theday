import type { Meta, StoryObj } from "@storybook/react";
import { FileListItem } from "@/components/FileListItem";
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

const mockSlide: ParsedFile = {
  id: "file-005",
  name: "Week 5 Slides — Dynamic Programming",
  url: "https://docs.google.com/presentation/d/example",
  type: "slide",
  isExternalLink: false,
};

const meta = {
  title: "Components/FileListItem",
  component: FileListItem,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "List-view row for a single file or resource. Displays file type icon, name, and a click handler. More compact than FileCard; used in list view mode.",
      },
    },
  },
  argTypes: {
    isNew: { control: "boolean", description: "Show 'New' indicator" },
    onClick: { action: "onClick" },
  },
} satisfies Meta<typeof FileListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PdfFile: Story = {
  args: { file: mockPdf, onClick: () => {} },
};

export const YoutubeFile: Story = {
  args: { file: mockYoutube, onClick: () => {} },
};

export const SlideFile: Story = {
  args: { file: mockSlide, onClick: () => {} },
};

export const NewItem: Story = {
  args: { file: mockPdf, isNew: true, onClick: () => {} },
};
