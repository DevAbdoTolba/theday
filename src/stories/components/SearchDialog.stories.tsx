import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import SearchDialog from '../../components/SearchDialog';
import React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import IndexedProvider from '../../context/IndexedContext';

const meta = {
  component: SearchDialog,
  argTypes: {
    newItemIds: {
      control: 'object',
      description: 'Override list of item ids considered new',
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={createTheme({ palette: { mode: 'dark' } })}>
        <CssBaseline />
        <IndexedProvider>
          <div style={{ height: '100vh' }}>
            <Story />
          </div>
        </IndexedProvider>
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof SearchDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    open: true,
    setOpen: () => {},
    data: {
      Lectures: [
        { id: '1', name: 'Intro.pdf', mimeType: 'application/pdf', parents: ['l'], size: 0 },
        { id: '2', name: 'https://youtu.be/dQw4w9WgXcQ Video', mimeType: 'text/plain', parents: ['l'], size: 0 },
      ],
      Sheets: [
        { id: '3', name: 'Sheet 1', mimeType: 'application/vnd.google-apps.document', parents: ['s'], size: 0 },
      ],
    },
    newItemIds: ['2'],
  },
};

export const AllNew: Story = {
  args: {
    ...Default.args,
    newItemIds: ['1', '2', '3'],
  },
};

export const NoneNew: Story = {
  args: {
    ...Default.args,
    newItemIds: [],
  },
};
