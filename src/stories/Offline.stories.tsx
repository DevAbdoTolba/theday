import type { Meta, StoryObj } from "@storybook/react";
import Offline from "@/components/Offline";

const meta = {
  title: "Components/Offline",
  component: Offline,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Offline indicator screen shown when the user loses internet connectivity. Contains an easter-egg confetti animation triggered by clicking repeatedly.",
      },
    },
  },
} satisfies Meta<typeof Offline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
