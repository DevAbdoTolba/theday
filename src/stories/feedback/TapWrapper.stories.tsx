import type { Meta, StoryObj } from "@storybook/react";
import { TapWrapper } from "@/components/feedback/TapWrapper";
import { Box, Typography } from "@mui/material";

const meta = {
  title: "Components/Feedback/TapWrapper",
  component: TapWrapper,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Framer Motion wrapper that adds spring-physics tap and hover animations. Wrap any clickable content to get tactile press feedback.",
      },
    },
  },
} satisfies Meta<typeof TapWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onClick: () => alert("Tapped!"),
    children: (
      <Box
        sx={{
          padding: "1.5rem 3rem",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: 3,
          cursor: "pointer",
        }}
      >
        <Typography variant="h6" color="white">
          Tap or hover me
        </Typography>
      </Box>
    ),
  },
};

export const WithCard: Story = {
  args: {
    onClick: () => {},
    children: (
      <Box
        sx={{
          p: 2,
          bgcolor: "background.paper",
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          width: 200,
          cursor: "pointer",
        }}
      >
        <Typography variant="subtitle1" fontWeight={600}>
          Semester 1
        </Typography>
        <Typography variant="body2" color="text.secondary">
          6 subjects
        </Typography>
      </Box>
    ),
  },
};
