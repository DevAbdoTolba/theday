import type { Meta, StoryObj } from "@storybook/react";
import FileBrowser from "@/components/FileBrowser";
import type { SubjectMaterials } from "@/utils/types";

const mockData: SubjectMaterials = {
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

const emptyData: SubjectMaterials = {};

const meta = {
  title: "Components/FileBrowser",
  component: FileBrowser,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Full-featured file browser for a subject's study materials. Supports grid/list view toggle, category tabs (Material, Schedule, Exams), file preview on click, YouTube integration, search filtering, and new item indicators.",
      },
    },
  },
  argTypes: {
    subjectName: { control: "text" },
    fetching: { control: "boolean" },
    newItems: { control: "object" },
  },
} satisfies Meta<typeof FileBrowser>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: mockData,
    subjectName: "Data Structures",
    newItems: [],
    fetching: false,
  },
};

export const WithNewItems: Story = {
  args: {
    data: mockData,
    subjectName: "Data Structures",
    newItems: ["f001", "f004"],
    fetching: false,
  },
};

export const Loading: Story = {
  args: {
    data: mockData,
    subjectName: "Algorithms",
    newItems: [],
    fetching: true,
  },
};

export const Empty: Story = {
  args: {
    data: emptyData,
    subjectName: "Graduation Project",
    newItems: [],
    fetching: false,
  },
};
