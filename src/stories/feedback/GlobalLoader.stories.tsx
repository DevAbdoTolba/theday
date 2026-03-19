import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { Button, Box } from "@mui/material";
import GlobalLoader from "@/components/feedback/GlobalLoader";

/**
 * GlobalLoader uses next/router (mocked via Vite alias).
 * In the real app it shows a top progress bar during route transitions.
 * Since router events are mocked (no-ops), GlobalLoader renders nothing by
 * default. The Loading story wraps it in a component that forces the visible
 * state for documentation purposes.
 */

function ForcedLoadingWrapper() {
  return (
    <Box sx={{ position: "relative", height: 60, width: "100%", border: "1px dashed grey", borderRadius: 1 }}>
      <Box sx={{ position: "absolute", top: 0, left: 0, width: "100%", zIndex: 1 }}>
        <Box sx={{ height: 3, background: "linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)", borderRadius: "0 2px 2px 0" }} />
      </Box>
      <Box sx={{ pt: 2, px: 2, color: "text.secondary", fontSize: 13 }}>
        ↑ GlobalLoader fixed bar (simulated) — appears at very top of viewport during route transitions
      </Box>
    </Box>
  );
}

const meta = {
  title: "Components/Feedback/GlobalLoader",
  component: GlobalLoader,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Fixed top progress bar (3px height) shown during Next.js page transitions. Listens to router.events (routeChangeStart/Complete/Error). Renders null when not loading — invisible in Storybook since the mock router emits no events.",
      },
    },
  },
} satisfies Meta<typeof GlobalLoader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {
  parameters: {
    docs: {
      description: { story: "Default state — renders null (router not transitioning)." },
    },
  },
};

export const LoadingPreview: Story = {
  render: () => <ForcedLoadingWrapper />,
  parameters: {
    docs: {
      description: {
        story: "Visual simulation of what the loading bar looks like at the top of the viewport.",
      },
    },
  },
};
