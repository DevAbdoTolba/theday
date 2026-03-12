import type { Meta, StoryObj } from "@storybook/react";
import NoData from "@/components/NoData";

const meta = {
  title: "Components/NoData",
  component: NoData,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Empty-state screen displayed when no study materials have been uploaded for a subject yet.",
      },
    },
  },
} satisfies Meta<typeof NoData>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
