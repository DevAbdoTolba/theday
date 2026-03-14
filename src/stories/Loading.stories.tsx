import type { Meta, StoryObj } from "@storybook/react";
import Loading from "@/components/Loading";

const meta = {
  title: "Components/Loading",
  component: Loading,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Full-screen loading spinner displayed while the app bootstraps or while data is being fetched for the first time.",
      },
    },
  },
} satisfies Meta<typeof Loading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
