import type { Meta, StoryObj } from "@storybook/react";
import SemesterBar from "@/components/SemesterBar";

/**
 * SemesterBar (SimpleSnackbar) is a legacy component that shows snackbar
 * prompts asking students to confirm or set their current semester.
 * It reads from localStorage on mount and shows prompts after user interaction.
 *
 * NOTE: The component's JSX is currently commented out — it renders nothing
 * visible. Stories here document its existence and props for future reference.
 */

const meta = {
  title: "Components/SemesterBar",
  component: SemesterBar,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Legacy semester-confirmation snackbar. Prompts the student to confirm their current semester (and optionally set a custom semester) after a period of inactivity. Currently renders an empty fragment — JSX is commented out pending a redesign.",
      },
    },
  },
} satisfies Meta<typeof SemesterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
