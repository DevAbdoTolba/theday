import type { Meta, StoryObj } from "@storybook/react";

// Minimal smoke-test story — verifies Storybook renders a React component
function Hello({ label }: { label: string }) {
  return <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>{label}</div>;
}

const meta = {
  title: "Setup/Smoke Test",
  component: Hello,
  tags: ["autodocs"],
} satisfies Meta<typeof Hello>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: "Storybook is working! 🎉" },
};
