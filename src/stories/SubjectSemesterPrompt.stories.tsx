import type { Meta, StoryObj } from "@storybook/react";
import SubjectSemesterPrompt from "@/components/SubjectSemesterPrompt";

const meta = {
  title: "Components/SubjectSemesterPrompt",
  component: SubjectSemesterPrompt,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Interactive prompt that asks students whether a subject belongs to their current semester and whether to add it to their custom subject list. Multi-step UI with semester confirmation and custom-add flow.",
      },
    },
  },
  argTypes: {
    subjectAbbr: { control: "text", description: "Subject abbreviation shown in the prompt" },
    semesterIndex: { control: "number", description: "Semester index for context" },
    onAddToCustom: { action: "onAddToCustom" },
  },
} satisfies Meta<typeof SubjectSemesterPrompt>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    subjectAbbr: "MATH",
    semesterIndex: 3,
    onAddToCustom: (abbr) => console.log("Added to custom:", abbr),
  },
};

export const DifferentSubject: Story = {
  args: {
    subjectAbbr: "GP",
    semesterIndex: 8,
    onAddToCustom: (abbr) => console.log("Added to custom:", abbr),
  },
};
