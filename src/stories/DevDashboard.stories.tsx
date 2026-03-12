import type { Meta, StoryObj } from "@storybook/react";
import DevDashboard from "@/components/DevDashboard";

/**
 * DevDashboard is a floating developer-tools panel.
 * It only renders when DevOptionsContext.isDev is true.
 *
 * In Storybook the DevOptionsProvider is always active, and isDev is
 * determined by DevOptionsContext internal logic (e.g. env variable or
 * localStorage flag). If the panel is not visible, check DevOptions.isDev.
 */

const meta = {
  title: "Components/DevDashboard",
  component: DevDashboard,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Floating developer-tools panel fixed to the bottom-right corner. Toggles a settings panel with switches for dev options (Sticky Search Bar, Progressive Loading). Only visible when isDev is true in DevOptionsContext.",
      },
    },
  },
} satisfies Meta<typeof DevDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
