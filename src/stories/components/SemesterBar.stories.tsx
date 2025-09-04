import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import SemesterBar from '../../components/SemesterBar';
import React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

const meta = {
  component: SemesterBar,
  decorators: [
    (Story) => (
      <ThemeProvider theme={createTheme({ palette: { mode: 'dark' } })}>
        <CssBaseline />
        <Story />
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof SemesterBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
