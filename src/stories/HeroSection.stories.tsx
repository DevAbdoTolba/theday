import type { Meta, StoryObj } from "@storybook/react";
import HeroSection from "@/components/HeroSection";

/**
 * HeroSection uses next/router (mocked in Storybook via Vite alias) and
 * localStorage for the "last visited subject" feature. The mock router
 * prevents crashes; navigation buttons are no-ops.
 */

const meta = {
  title: "Components/HeroSection",
  component: HeroSection,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Dashboard hero banner with a time-of-day greeting, motivational tagline, and a 'Continue studying' quick-action button that links to the last visited subject (stored in localStorage).",
      },
    },
  },
} satisfies Meta<typeof HeroSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLastSubject: Story = {
  decorators: [
    (Story) => {
      localStorage.setItem(
        "lastVisitedSubject",
        JSON.stringify({ name: "Data Structures", abbr: "DS" })
      );
      return <Story />;
    },
  ],
  parameters: {
    docs: {
      description: {
        story: "Shows the 'Continue studying' button when a last-visited subject is found in localStorage.",
      },
    },
  },
};

export const NoLastSubject: Story = {
  decorators: [
    (Story) => {
      localStorage.removeItem("lastVisitedSubject");
      return <Story />;
    },
  ],
  parameters: {
    docs: {
      description: { story: "No last-visited subject — quick-action button is hidden." },
    },
  },
};
