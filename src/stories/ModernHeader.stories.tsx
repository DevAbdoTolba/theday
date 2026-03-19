import type { Meta, StoryObj } from "@storybook/react";
import ModernHeader from "@/components/ModernHeader";

/**
 * ModernHeader is the redesigned app bar used on subject pages.
 * It depends on: next/router (mocked), ColorModeContext (mocked via alias),
 * offlineContext (mocked via alias), DataContext (mocked in global decorator).
 * Navigation and key submission are no-ops in Storybook.
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
  title: "Components/ModernHeader",
  component: ModernHeader,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Glassmorphism-style sticky app bar. Supports search dialog (desktop: center bar, mobile: icon), back navigation, offline indicator, theme toggle, class switcher (when multiple classes saved), and transcript-key dialog.",
      },
    },
  },
  argTypes: {
    title: { control: "text" },
    isSearch: { control: "boolean" },
    isHome: { control: "boolean" },
    onMenuClick: { action: "onMenuClick" },
  },
} satisfies Meta<typeof ModernHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HomePage: Story = {
  args: {
    title: "TheDay",
    isSearch: false,
    isHome: true,
    data: undefined,
    onMenuClick: () => {},
  },
};

export const SubjectPage: Story = {
  args: {
    title: "Data Structures",
    isSearch: true,
    isHome: false,
    data: mockData,
    onMenuClick: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: "Subject-page variant with search button, back arrow, and key dialog trigger.",
      },
    },
  },
};

export const MobileSubjectPage: Story = {
  args: {
    title: "Data Structures",
    isSearch: true,
    isHome: false,
    data: mockData,
    onMenuClick: () => {},
  },
  parameters: {
    viewport: { defaultViewport: "mobile" },
    docs: {
      description: { story: "Mobile layout — search becomes an icon button, class switcher hides." },
    },
  },
};

export const NoSearchNoData: Story = {
  args: {
    title: "Algorithms",
    isSearch: false,
    isHome: false,
    data: undefined,
    onMenuClick: () => {},
  },
};
