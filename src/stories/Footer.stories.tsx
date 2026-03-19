import type { Meta, StoryObj } from "@storybook/react";
import footer from "@/components/Footer";

const meta = {
  title: "Components/Footer",
  component: footer,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Site footer displaying team member credits and contact links. Static content component.",
      },
    },
  },
} satisfies Meta<typeof footer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
