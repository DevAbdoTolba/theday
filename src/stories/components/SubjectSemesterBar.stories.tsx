import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import SubjectSemesterBar from '../../components/SubjectSemesterBar';
import React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

const meta = {
  component: SubjectSemesterBar,
  decorators: [
    (Story) => (
      <ThemeProvider theme={createTheme({ palette: { mode: 'dark' } })}>
        <CssBaseline />
        <div style={{ height: '80vh' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof SubjectSemesterBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    subject: 'DS',
    subjectFullName: 'Data Structures',
    semester: 2,
  },
};
