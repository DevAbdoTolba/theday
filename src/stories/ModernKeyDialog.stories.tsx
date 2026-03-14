import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { Button } from "@mui/material";
import ModernKeyDialog from "@/components/ModernKeyDialog";

/**
 * ModernKeyDialog uses next/router (mocked) and DataContext (mocked).
 * API calls to /api/getTranscriptName will fail gracefully in Storybook
 * showing the error state. Confirmation step shown via the ConfirmStep story.
 */

function KeyDialogDemo({ initialOpen }: { initialOpen?: boolean }) {
  const [open, setOpen] = useState(initialOpen ?? true);
  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>Open Key Dialog</Button>
      <ModernKeyDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}

const meta = {
  title: "Components/ModernKeyDialog",
  component: ModernKeyDialog,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Multi-step dialog for entering a class transcript key. Step 1: input + validation (24-char hex). Step 2: confirmation with class name. Supports Arabic/English toggle. Checks localStorage before making an API call.",
      },
    },
  },
  argTypes: {
    open: { control: "boolean" },
    onClose: { action: "onClose" },
  },
} satisfies Meta<typeof ModernKeyDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  render: () => <KeyDialogDemo initialOpen={true} />,
};

export const Closed: Story = {
  render: () => <KeyDialogDemo initialOpen={false} />,
};
