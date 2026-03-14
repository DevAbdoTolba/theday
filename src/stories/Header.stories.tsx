import type { Meta, StoryObj } from "@storybook/react";
import Header from "@/components/Header";

/**
 * Header uses next/router and DataContext. Both are mocked in Storybook
 * (router via Vite alias, DataContext via global decorator). Navigation
 * actions are no-ops in this environment.
 */

const mockData = {
  Material: [
    { id: "f001", mimeType: "application/pdf", name: "Chapter 1.pdf", parents: [], size: 1024000 },
    { id: "f002", mimeType: "video/youtube", name: "Lecture 1 https://youtu.be/dQw4w9WgXcQ", parents: [], size: 0 },
  ],
  "Previous Exams": [
    { id: "f003", mimeType: "application/pdf", name: "Midterm 2024.pdf", parents: [], size: 256000 },
  ],
};

const meta = {
  title: "Components/Header",
  component: Header,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Top app bar with brand title, key-dialog trigger, color-mode toggle, and optional search (inline or dialog). Supports subject-search mode that opens SearchDialog. Class switcher appears when multiple classes are stored in localStorage.",
      },
    },
  },
  argTypes: {
    title: { control: "text" },
    isSearch: { control: "boolean" },
    isSubjectSearch: { control: "boolean" },
    position: {
      control: "select",
      options: ["static", "sticky", "fixed", "absolute", "relative"],
    },
  },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "TheDay",
    isSearch: false,
    isSubjectSearch: false,
    position: "static",
  },
};

export const SubjectPage: Story = {
  args: {
    title: "Data Structures",
    isSearch: false,
    isSubjectSearch: true,
    data: mockData,
    position: "static",
  },
  parameters: {
    docs: {
      description: {
        story: "Subject-page variant with search dialog trigger (desktop: clickable search bar, mobile: icon).",
      },
    },
  },
};

export const WithInlineSearch: Story = {
  args: {
    title: "TheDay",
    isSearch: true,
    isSubjectSearch: false,
    position: "static",
  },
};

export const BackButton: Story = {
  args: {
    title: "Data Structures",
    isSearch: false,
    isSubjectSearch: false,
    position: "static",
  },
  parameters: {
    docs: {
      description: { story: "Non-home page shows a back-arrow button next to the title." },
    },
  },
};
