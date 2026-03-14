import type { Meta, StoryObj } from "@storybook/react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

const mockSemesters = [
  { index: 1, subjects: [{ name: "Mathematics", abbreviation: "MATH" }, { name: "Physics", abbreviation: "PHYS" }] },
  { index: 2, subjects: [{ name: "Data Structures", abbreviation: "DS" }, { name: "Algorithms", abbreviation: "ALGO" }] },
  { index: 3, subjects: [{ name: "Operating Systems", abbreviation: "OS" }, { name: "Databases", abbreviation: "DB" }] },
  { index: 4, subjects: [{ name: "Networks", abbreviation: "NET" }, { name: "Security", abbreviation: "SEC" }] },
];

const meta = {
  title: "Components/Dashboard/DashboardHeader",
  component: DashboardHeader,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Dashboard header with semester focus selector. Allows students to pin a semester, create custom subject shortcuts, and search subjects. Persists preferences in localStorage.",
      },
    },
  },
  argTypes: {
    currentSemesterIndex: {
      control: { type: "range", min: 1, max: 8, step: 1 },
      description: "Currently focused semester (1-based)",
    },
  },
} satisfies Meta<typeof DashboardHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    allSemesters: mockSemesters,
    currentSemesterIndex: 3,
    onUpdateFocus: (index, customSubjects) => {
      console.log("Focus updated:", index, customSubjects);
    },
  },
};

export const FirstSemesterFocused: Story = {
  args: {
    allSemesters: mockSemesters,
    currentSemesterIndex: 1,
    onUpdateFocus: () => {},
  },
};

export const AllEightSemesters: Story = {
  args: {
    allSemesters: [
      { index: 1, subjects: [{ name: "Math", abbreviation: "MATH" }] },
      { index: 2, subjects: [{ name: "Physics", abbreviation: "PHYS" }] },
      { index: 3, subjects: [{ name: "DS", abbreviation: "DS" }] },
      { index: 4, subjects: [{ name: "Algorithms", abbreviation: "ALGO" }] },
      { index: 5, subjects: [{ name: "OS", abbreviation: "OS" }] },
      { index: 6, subjects: [{ name: "Networks", abbreviation: "NET" }] },
      { index: 7, subjects: [{ name: "AI", abbreviation: "AI" }] },
      { index: 8, subjects: [{ name: "Graduation Project", abbreviation: "GP" }] },
    ],
    currentSemesterIndex: 4,
    onUpdateFocus: () => {},
  },
};
