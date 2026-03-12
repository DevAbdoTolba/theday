import type { Meta, StoryObj } from "@storybook/react";
import SemesterCard from "@/components/dashboard/SemesterCard";

const mockSubjects = [
  { name: "Mathematics", abbreviation: "MATH" },
  { name: "Physics", abbreviation: "PHYS" },
  { name: "Data Structures", abbreviation: "DS" },
  { name: "Algorithms", abbreviation: "ALGO" },
  { name: "Discrete Mathematics", abbreviation: "DM" },
  { name: "English", abbreviation: "ENG" },
];

const meta = {
  title: "Components/Dashboard/SemesterCard",
  component: SemesterCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Collapsible card displaying all subjects within a semester. Animates open/close with Framer Motion. Highlighted when marked as current semester.",
      },
    },
  },
  argTypes: {
    semesterIndex: { control: "number", description: "1-based semester number" },
    isCurrent: { control: "boolean", description: "Whether this is the student's current semester" },
    customTitle: { control: "text", description: "Override for the default 'Semester N' title" },
  },
} satisfies Meta<typeof SemesterCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    semesterIndex: 1,
    subjects: mockSubjects,
    isCurrent: false,
  },
};

export const CurrentSemester: Story = {
  args: {
    semesterIndex: 4,
    subjects: mockSubjects,
    isCurrent: true,
  },
};

export const CustomTitle: Story = {
  args: {
    semesterIndex: 5,
    subjects: mockSubjects.slice(0, 3),
    isCurrent: false,
    customTitle: "My Pinned Semester",
  },
};

export const FewSubjects: Story = {
  args: {
    semesterIndex: 8,
    subjects: [{ name: "Graduation Project", abbreviation: "GP" }],
    isCurrent: false,
  },
};
