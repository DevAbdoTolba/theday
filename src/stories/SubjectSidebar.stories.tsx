import type { Meta, StoryObj } from "@storybook/react";
import SubjectSidebar from "@/components/SubjectSidebar";

const meta = {
  title: "Components/SubjectSidebar",
  component: SubjectSidebar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Slide-in curriculum navigation sidebar. Desktop: triggered by hovering near the left edge (proximity button). Mobile: controlled by mobileOpen prop. Lists all semesters and subjects from DataContext, highlights the current subject.",
      },
    },
  },
  argTypes: {
    currentSubject: { control: "text", description: "Abbreviation of the active subject" },
    mobileOpen: { control: "boolean", description: "Whether the mobile drawer is open" },
    onMobileClose: { action: "onMobileClose" },
  },
} satisfies Meta<typeof SubjectSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    currentSubject: "MATH",
    mobileOpen: false,
    onMobileClose: () => {},
  },
};

export const MobileOpen: Story = {
  args: {
    currentSubject: "DS",
    mobileOpen: true,
    onMobileClose: () => {},
  },
  parameters: {
    viewport: { defaultViewport: "mobile" },
    docs: {
      description: { story: "Mobile drawer variant — full-width slide-in from the left." },
    },
  },
};

export const ActiveInSemester2: Story = {
  args: {
    currentSubject: "ALGO",
    mobileOpen: false,
    onMobileClose: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: "Active subject is in Semester 2; that semester auto-expands on open.",
      },
    },
  },
};

export const NoActiveSubject: Story = {
  args: {
    currentSubject: "",
    mobileOpen: false,
    onMobileClose: () => {},
  },
};
