import type { Meta, StoryObj } from "@storybook/react";
import YoutubePlayer from "@/components/YoutubePlayer";

const meta = {
  title: "Components/YoutubePlayer",
  component: YoutubePlayer,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Modal dialog for playing YouTube video lectures directly in-app. Accepts a YouTube video ID and wraps it in a responsive iframe dialog.",
      },
    },
  },
  argTypes: {
    open: { control: "boolean", description: "Whether the dialog is visible" },
    videoId: { control: "text", description: "YouTube video ID (e.g., dQw4w9WgXcQ)" },
    title: { control: "text", description: "Video title shown in dialog header" },
    onClose: { action: "onClose" },
  },
} satisfies Meta<typeof YoutubePlayer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    open: true,
    videoId: "dQw4w9WgXcQ",
    title: "Introduction to Algorithms — Lecture 1",
    onClose: () => {},
  },
};

export const Closed: Story = {
  args: {
    open: false,
    videoId: "dQw4w9WgXcQ",
    title: "Introduction to Algorithms — Lecture 1",
    onClose: () => {},
  },
};

export const NoVideoId: Story = {
  args: {
    open: true,
    videoId: null,
    title: "No video selected",
    onClose: () => {},
  },
};
