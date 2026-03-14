import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { Button } from "@mui/material";
import SearchDialog from "@/components/SearchDialog";

type DataMap = Record<string, { id: string; mimeType: string; name: string; parents: string[]; size: number }[]>;

const mockData: DataMap = {
  Material: [
    { id: "f001", mimeType: "application/pdf", name: "Chapter 1 — Introduction.pdf", parents: [], size: 1024000 },
    { id: "f002", mimeType: "application/pdf", name: "Chapter 2 — Big O Notation.pdf", parents: [], size: 512000 },
    { id: "f003", mimeType: "video/youtube", name: "Lecture 1 — https://youtu.be/dQw4w9WgXcQ", parents: [], size: 0 },
  ],
  "Previous Exams": [
    { id: "f004", mimeType: "application/pdf", name: "Midterm 2024.pdf", parents: [], size: 256000 },
    { id: "f005", mimeType: "application/pdf", name: "Final 2023.pdf", parents: [], size: 300000 },
  ],
  Schedule: [
    { id: "f006", mimeType: "image/png", name: "Exam Schedule Spring 2025.png", parents: [], size: 80000 },
  ],
};

function SearchDialogDemo({ data, initialOpen }: { data: DataMap; initialOpen?: boolean }) {
  const [open, setOpen] = useState(initialOpen ?? true);
  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>Open Search</Button>
      <SearchDialog open={open} setOpen={setOpen} data={data} />
    </>
  );
}

const meta = {
  title: "Components/SearchDialog",
  component: SearchDialog,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Full-screen search dialog for a subject's materials. Supports text search, category filter chips, type badges (PDF, YouTube, Image, etc.), and new-item highlighting from IndexedContext.",
      },
    },
  },
} satisfies Meta<typeof SearchDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  render: () => <SearchDialogDemo data={mockData} initialOpen={true} />,
};

export const WithNewItems: Story = {
  render: () => <SearchDialogDemo data={mockData} initialOpen={true} />,
  parameters: {
    docs: {
      description: {
        story: "The 'New' filter chip appears when IndexedContext reports updated items (sample-new-item-id is pre-seeded in the global decorator).",
      },
    },
  },
};

export const EmptyData: Story = {
  render: () => (
    <SearchDialogDemo
      data={{}}
      initialOpen={true}
    />
  ),
};

export const Closed: Story = {
  render: () => <SearchDialogDemo data={mockData} initialOpen={false} />,
};
