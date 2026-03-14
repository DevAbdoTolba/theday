import type { Meta, StoryObj } from "@storybook/react";
import ProgressiveLoadingUI from "@/components/ProgressiveLoadingUI";

/**
 * NOTE: ProgressiveLoadingUI only renders when DevOptionsContext has
 * `progressiveLoading: true`. The global decorator uses DevOptionsProvider
 * which defaults to persisted localStorage values. Use the Controls panel to
 * verify each loading stage, or enable progressive loading in DevDashboard.
 */

const folderStructure = {
  "folder-1": { name: "Material" },
  "folder-2": { name: "Previous Exams" },
  "folder-3": { name: "Schedule" },
};

const meta = {
  title: "Components/ProgressiveLoadingUI",
  component: ProgressiveLoadingUI,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Progressive loading indicator shown while subject folders and files are being fetched. Displays a labeled progress bar and stage chips (Folder Structure / Files & Content). Only visible when DevOptions.progressiveLoading is enabled.",
      },
    },
  },
  argTypes: {
    subject: { control: "text" },
    loadingFolders: { control: "boolean" },
    loadingFiles: { control: "boolean" },
    folderStructure: { control: "object" },
    data: { control: "object" },
  },
} satisfies Meta<typeof ProgressiveLoadingUI>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoadingFolders: Story = {
  args: {
    subject: "DS",
    folderStructure: null,
    loadingFolders: true,
    loadingFiles: false,
    data: null,
  },
};

export const FoldersLoadedFilesLoading: Story = {
  args: {
    subject: "DS",
    folderStructure,
    loadingFolders: false,
    loadingFiles: true,
    data: null,
  },
};

export const FullyLoaded: Story = {
  args: {
    subject: "DS",
    folderStructure,
    loadingFolders: false,
    loadingFiles: false,
    data: { Material: [], "Previous Exams": [], Schedule: [] },
  },
};

export const NoFolders: Story = {
  args: {
    subject: "DS",
    folderStructure: null,
    loadingFolders: false,
    loadingFiles: false,
    data: null,
  },
};
