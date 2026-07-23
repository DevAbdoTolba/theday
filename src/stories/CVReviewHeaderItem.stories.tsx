import React, { useMemo } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Box, ThemeProvider, Typography, createTheme } from "@mui/material";
import CVReviewHeaderItem from "@/components/cv-review/CVReviewHeaderItem";
import {
  CV_REVIEWERS,
  normalizeCalendlyUrl,
} from "@/components/cv-review/reviewers";
import type { ReviewerProfile } from "@/components/cv-review/reviewers";

const testUrls = [
  "https://calendly.com/abdo-tolba/cv-review",
  "https://calendly.com/omar-shawky/cv-review",
  "https://calendly.com/nairah/cv-review",
] as const;

const availableReviewers: readonly ReviewerProfile[] = CV_REVIEWERS.map(
  (reviewer, index) => ({
    ...reviewer,
    booking: normalizeCalendlyUrl(testUrls[index]),
  }),
);

const oneUnavailableReviewer: readonly ReviewerProfile[] =
  availableReviewers.map((reviewer) =>
    reviewer.id === "omar-shawky"
      ? { ...reviewer, booking: normalizeCalendlyUrl(null) }
      : reviewer,
  );

const failedPortraitReviewers: readonly ReviewerProfile[] =
  availableReviewers.map((reviewer) =>
    reviewer.id === "abdo-tolba"
      ? { ...reviewer, portraitSrc: "/missing-cv-reviewer-photo.jpg" }
      : reviewer,
  );

interface StoryFrameProps {
  readonly children: React.ReactNode;
  readonly mode?: "light" | "dark";
  readonly note?: string;
}

function StoryFrame({
  children,
  mode = "dark",
  note,
}: StoryFrameProps) {
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          background: {
            default: mode === "dark" ? "#151a2c" : "#f4f6fb",
            paper: mode === "dark" ? "#151a2c" : "#f4f6fb",
          },
        },
        shape: { borderRadius: 12 },
      }),
    [mode],
  );

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: 390,
          width: "100%",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          p: 2,
          bgcolor: "background.default",
          color: "text.primary",
        }}
      >
        {note && (
          <Typography
            variant="caption"
            sx={{ mr: "auto", maxWidth: 320, color: "text.secondary" }}
          >
            {note}
          </Typography>
        )}
        {children}
      </Box>
    </ThemeProvider>
  );
}

const meta = {
  title: "Components/CV Review Header Item",
  component: CVReviewHeaderItem,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Pitch-black CV header invitation with a white organic outline, native-CSS motion, reviewer selection, and a secure external Calendly handoff.",
      },
    },
  },
  args: {
    reviewers: availableReviewers,
  },
} satisfies Meta<typeof CVReviewHeaderItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CollapsedDark: Story = {
  render: (args) => (
    <StoryFrame>
      <CVReviewHeaderItem {...args} />
    </StoryFrame>
  ),
};

export const CollapsedLight: Story = {
  render: (args) => (
    <StoryFrame mode="light">
      <CVReviewHeaderItem {...args} />
    </StoryFrame>
  ),
};

export const HoverPreview: Story = {
  render: (args) => (
    <StoryFrame>
      <CVReviewHeaderItem {...args} />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(
      canvas.getByRole("button", { name: /open cv review invitation/i }),
    );
    await expect(
      canvas.getByRole("button", { name: /now/i }),
    ).toBeVisible();
  },
};

export const PinnedOpen: Story = {
  render: (args) => (
    <StoryFrame>
      <CVReviewHeaderItem {...args} />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: /open cv review invitation/i }),
    );
    await expect(
      canvas.getByRole("button", { name: /collapse cv review invitation/i }),
    ).toBeVisible();
  },
};

export const MobilePinned320: Story = {
  render: (args) => (
    <StoryFrame>
      <CVReviewHeaderItem {...args} />
    </StoryFrame>
  ),
  parameters: {
    viewport: {
      defaultViewport: "mobile320",
      viewports: {
        mobile320: {
          name: "Small phone (320px)",
          styles: { width: "320px", height: "640px" },
        },
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: /open cv review invitation/i }),
    );
  },
};

export const MobileFighterSelection320: Story = {
  render: (args) => (
    <StoryFrame>
      <CVReviewHeaderItem {...args} />
    </StoryFrame>
  ),
  parameters: {
    viewport: {
      defaultViewport: "mobile320",
      viewports: {
        mobile320: {
          name: "Small phone (320px)",
          styles: { width: "320px", height: "640px" },
        },
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: /open cv review invitation/i }),
    );
    await userEvent.click(canvas.getByRole("button", { name: /now/i }));

    const body = within(document.body);
    await expect(
      body.getByRole("dialog", { name: /choose your fighter/i }),
    ).toBeVisible();
    await expect(
      body.getByRole("button", { name: /close reviewer selection/i }),
    ).toBeVisible();
  },
};

export const DialogOpenAllUnavailable: Story = {
  args: {
    reviewers: CV_REVIEWERS,
  },
  render: (args) => (
    <StoryFrame>
      <CVReviewHeaderItem {...args} />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: /open cv review invitation/i }),
    );
    await userEvent.click(
      canvas.getByRole("button", { name: /now/i }),
    );
    const body = within(document.body);
    await expect(
      body.getByRole("dialog", { name: /choose your fighter/i }),
    ).toBeVisible();
    await expect(body.queryByRole("link", { name: /select/i })).toBeNull();
  },
};

export const NairahSelectedPremium: Story = {
  render: (args) => (
    <StoryFrame>
      <CVReviewHeaderItem {...args} />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: /open cv review invitation/i }),
    );
    await userEvent.click(
      canvas.getByRole("button", { name: /now/i }),
    );

    const body = within(document.body);
    await userEvent.click(body.getByRole("radio", { name: /nairah/i }));

    const bookingLink = body.getByRole("link", {
      name: /select nairah on calendly/i,
    });
    await expect(bookingLink).toHaveAttribute(
      "href",
      "https://calendly.com/nairah/cv-review",
    );
    await expect(bookingLink).toHaveAttribute("target", "_blank");
    await expect(bookingLink).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
  },
};

export const OneReviewerComingSoon: Story = {
  args: {
    reviewers: oneUnavailableReviewer,
  },
  render: (args) => (
    <StoryFrame>
      <CVReviewHeaderItem {...args} />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: /open cv review invitation/i }),
    );
    await userEvent.click(
      canvas.getByRole("button", { name: /now/i }),
    );
    await expect(
      within(document.body).getByRole("radio", { name: /omar shawky/i }),
    ).toBeDisabled();
  },
};

export const FailedPortraitFallback: Story = {
  args: {
    reviewers: failedPortraitReviewers,
  },
  render: (args) => (
    <StoryFrame>
      <CVReviewHeaderItem {...args} />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: /open cv review invitation/i }),
    );
    await userEvent.click(
      canvas.getByRole("button", { name: /now/i }),
    );
    await expect(await within(document.body).findByText("AT")).toBeVisible();
  },
};

export const RapidReversal: Story = {
  render: (args) => (
    <StoryFrame note="The play step reverses hover repeatedly, then pins the current surface without timers.">
      <CVReviewHeaderItem {...args} />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", {
      name: /open cv review invitation/i,
    });
    await userEvent.hover(trigger);
    await userEvent.unhover(trigger);
    await userEvent.hover(trigger);
    await userEvent.click(trigger);
    await expect(
      canvas.getByRole("button", { name: /now/i }),
    ).toBeVisible();
  },
};

export const ReducedMotionReview: Story = {
  render: (args) => (
    <StoryFrame note="Enable prefers-reduced-motion in browser or Storybook emulation: the morph and gold shimmer become a brief opacity/state transition.">
      <CVReviewHeaderItem {...args} />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: /open cv review invitation/i }),
    );
  },
};

export const LightThemeDialog: Story = {
  render: (args) => (
    <StoryFrame mode="light">
      <CVReviewHeaderItem {...args} />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: /open cv review invitation/i }),
    );
    await userEvent.click(
      canvas.getByRole("button", { name: /now/i }),
    );
  },
};
