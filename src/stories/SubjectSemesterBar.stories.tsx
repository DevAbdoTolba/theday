import type { Meta, StoryObj } from "@storybook/react";
import SubjectSemesterBar from "@/components/SubjectSemesterBar";

const meta = {
  title: "Components/SubjectSemesterBar",
  component: SubjectSemesterBar,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Banner displayed on subject pages showing the subject abbreviation, full name, and which semester it belongs to. Includes a prompt for adding the subject to the custom semester.",
      },
    },
  },
  argTypes: {
    subject: { control: "text", description: "Subject abbreviation (e.g., 'MATH')" },
    semester: { control: "number", description: "Semester number (1–8)" },
    subjectFullName: { control: "text", description: "Full subject name (optional)" },
  },
} satisfies Meta<typeof SubjectSemesterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    subject: "DS",
    semester: 3,
    subjectFullName: "Data Structures",
  },
};

export const WithoutFullName: Story = {
  args: {
    subject: "ALGO",
    semester: 4,
  },
};

export const LongSubjectName: Story = {
  args: {
    subject: "DISTRIB",
    semester: 6,
    subjectFullName: "Distributed Systems and Cloud Computing",
  },
};
