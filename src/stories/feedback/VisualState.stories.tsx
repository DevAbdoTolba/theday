import type { Meta, StoryObj } from "@storybook/react";
import VisualState from "@/components/feedback/VisualState";

const meta = {
  title: "Components/Feedback/VisualState",
  component: VisualState,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Unified visual feedback component for loading, empty, and error states. Used throughout the app to provide consistent UX feedback.",
      },
    },
  },
  argTypes: {
    type: {
      control: "select",
      options: ["loading", "empty", "error"],
      description: "The type of visual state to display",
    },
    message: {
      control: "text",
      description: "Optional descriptive message shown below the icon",
    },
  },
} satisfies Meta<typeof VisualState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  args: { type: "loading" },
};

export const Empty: Story = {
  args: { type: "empty", message: "No files uploaded yet" },
};

export const Error: Story = {
  args: { type: "error", message: "Failed to load content. Please try again." },
};

export const EmptyNoMessage: Story = {
  args: { type: "empty" },
};
