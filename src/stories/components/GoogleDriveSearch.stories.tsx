import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import GoogleDriveSearch from "../../components/GoogleDriveSearch";
import { SearchProvider } from "../../context/SearchContext";

const meta = {
  component: GoogleDriveSearch,
  decorators: [
    (Story) => (
      <SearchProvider>
        <Story />
      </SearchProvider>
    ),
  ],
} satisfies Meta<typeof GoogleDriveSearch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    transcript: {
      semesters: [
        {
          index: 1,
          subjects: [
            { name: "Programming I", abbreviation: "PRG1" },
            { name: "Discrete Mathematics", abbreviation: "DM" },
          ],
        },
        {
          index: 2,
          subjects: [
            { name: "Data Structures", abbreviation: "DS" },
            { name: "Computer Architecture", abbreviation: "CA" },
          ],
        },
      ],
    },
    currentSemester: 1,
  },
};
