import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import NoData from '../../components/NoData';
import React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { DataContext } from '../../context/TranscriptContext';
import { ColorModeContext } from '../../pages/_app';

const meta = {
  component: NoData,
  decorators: [
    (Story) => (
      <ColorModeContext.Provider value={{ toggleColorMode: () => {} }}>
        <ThemeProvider theme={createTheme({ palette: { mode: 'dark', background: { default: '#151a2c', paper: '#151a2c' }, text: { primary: '#fff' } } })}>
          <CssBaseline />
          <DataContext.Provider value={{ transcript: null, loadingTranscript: false, className: 'default', setLoadingTranscript: () => {}, error: null, setClassName: () => {} } as any}>
            {(() => {
              if (typeof window !== 'undefined') {
                try {
                  localStorage.setItem('classes', JSON.stringify([{ class: 'default', id: 'default' }]));
                  localStorage.setItem('className', 'default');
                } catch {}
              }
              return <Story />
            })()}
          </DataContext.Provider>
        </ThemeProvider>
      </ColorModeContext.Provider>
    ),
  ],
} satisfies Meta<typeof NoData>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
