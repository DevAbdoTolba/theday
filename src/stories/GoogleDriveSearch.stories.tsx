import type { Meta, StoryObj } from "@storybook/react";
import GoogleDriveSearch from "@/components/GoogleDriveSearch";

/**
 * GoogleDriveSearch is the main subject-page search bar.
 * It uses: next/router (mocked), SearchContext (provided by global decorator),
 * DevOptionsContext (provided by global decorator).
 * Keyboard navigation (arrows, enter, escape) and search shortcuts (/) work.
 */

const mockTranscript = {
  semesters: [
    {
      index: 1,
      subjects: [
        { name: "Mathematics", abbreviation: "MATH" },
        { name: "Physics", abbreviation: "PHYS" },
      ],
    },
    {
      index: 2,
      subjects: [
        { name: "Data Structures", abbreviation: "DS" },
        { name: "Algorithms", abbreviation: "ALGO" },
        { name: "Discrete Mathematics", abbreviation: "DM" },
      ],
    },
    {
      index: 3,
      subjects: [
        { name: "Operating Systems", abbreviation: "OS" },
        { name: "Computer Networks", abbreviation: "CN" },
        { name: "Database Systems", abbreviation: "DB" },
      ],
    },
  ],
};

const meta = {
  title: "Components/GoogleDriveSearch",
  component: GoogleDriveSearch,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Floating subject search bar with keyboard navigation, rotating placeholder hints, and a results dropdown. Press '/' to focus, arrow keys to navigate results, Enter to navigate, Escape to dismiss. Powered by SearchContext and DevOptionsContext.",
      },
    },
  },
  argTypes: {
    currentSemester: { control: "number", description: "Current semester index for context" },
    transcript: { control: "object" },
  },
} satisfies Meta<typeof GoogleDriveSearch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    transcript: mockTranscript,
    currentSemester: 2,
  },
};

export const NoTranscript: Story = {
  args: {
    transcript: null,
    currentSemester: 0,
  },
  parameters: {
    docs: {
      description: { story: "Empty state when transcript data is not yet available." },
    },
  },
};

export const ManySubjects: Story = {
  args: {
    transcript: mockTranscript,
    currentSemester: 3,
  },
  parameters: {
    docs: {
      description: { story: "With subjects across 3 semesters; type to filter results." },
    },
  },
};
