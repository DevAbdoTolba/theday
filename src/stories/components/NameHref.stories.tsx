import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import NameHref from '../../components/NameHref';
import React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

const meta = {
  component: NameHref,
  decorators: [
    (Story) => (
      <ThemeProvider theme={createTheme({ palette: { mode: 'dark' } })}>
        <CssBaseline />
        <div style={{ padding: 24 }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof NameHref>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'Resources',
    dataName: ['Docs', 'GitHub', 'University'],
    dataHref: [
      'https://nextjs.org/docs',
      'https://github.com/DevAbdoTolba',
      'https://aast.edu',
    ],
  },
};
