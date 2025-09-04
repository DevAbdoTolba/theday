import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React, { useEffect } from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import CurrentSemester from '../../pages/theday/q/[q]/CurrentSemester';
import { DataContext } from '../../context/TranscriptContext';

type StoryArgs = {
  currentSemester: number;
  specialCustom: boolean;
  customSubjects: string[];
  customName?: string;
  firstTimeCustomize: boolean;
};

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: '#151a2c', paper: '#151a2c' },
    text: { primary: '#fff' },
  },
  shape: { borderRadius: 12 },
});

const CurrentSemesterStoryWrapper: React.FC<StoryArgs> = (args) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const { specialCustom, customSubjects, customName, firstTimeCustomize } = args;
      localStorage.setItem('classes', JSON.stringify([{ class: 'default', id: 'default' }]));
      localStorage.setItem('className', 'default');
      localStorage.setItem('semester', specialCustom ? '-2' : '-1');
      localStorage.setItem('customSemesterSubjects', JSON.stringify(customSubjects || []));
      if (customName) localStorage.setItem('customSemesterName', customName);
      else localStorage.removeItem('customSemesterName');
      if (firstTimeCustomize) localStorage.removeItem('firstTimeCustomizeSemester');
      else localStorage.setItem('firstTimeCustomizeSemester', 'shown');
    } catch {}
  }, [args]);

  const dataCtxValue = {
    transcript: {
      semesters: [
        { index: 1, subjects: [
          { name: 'Programming I', abbreviation: 'PRG1' },
          { name: 'Discrete Mathematics', abbreviation: 'DM' },
          { name: 'Intro to CS', abbreviation: 'CS' },
        ] },
        { index: 2, subjects: [
          { name: 'Data Structures', abbreviation: 'DS' },
          { name: 'Computer Architecture', abbreviation: 'CA' },
          { name: 'Algorithms', abbreviation: 'ALG' },
        ] },
      ],
    },
    loadingTranscript: false,
    className: 'default',
    setLoadingTranscript: () => {},
    error: null,
    setClassName: () => {},
  } as any;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DataContext.Provider value={dataCtxValue}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <CurrentSemester currentSemester={args.currentSemester} handleClick={() => {}} setOpen={() => {}} />
        </div>
      </DataContext.Provider>
    </ThemeProvider>
  );
};

const meta = {
  component: CurrentSemesterStoryWrapper,
  argTypes: {
    currentSemester: { control: { type: 'number', min: 1, max: 8, step: 1 } },
    specialCustom: { control: 'boolean', description: 'Treat as special custom semester (-2)' },
    customSubjects: { control: 'object', description: 'Abbreviations to include in custom semester' },
    customName: { control: 'text', description: 'Custom semester name (optional)' },
    firstTimeCustomize: { control: 'boolean', description: 'Show first-time customize help dialog' },
  },
} satisfies Meta<typeof CurrentSemesterStoryWrapper>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    currentSemester: 1,
    specialCustom: false,
    customSubjects: [],
    customName: '',
    firstTimeCustomize: false,
  },
};

export const SpecialCustomEmpty: Story = {
  args: {
    currentSemester: 2,
    specialCustom: true,
    customSubjects: [],
    customName: 'Special for you 🌹',
    firstTimeCustomize: false,
  },
};

export const CustomWithSubjects: Story = {
  args: {
    currentSemester: 2,
    specialCustom: false,
    customSubjects: ['DS', 'CA'],
    customName: 'My Focus Plan',
    firstTimeCustomize: false,
  },
};

export const FirstTimeHelpShown: Story = {
  args: {
    currentSemester: 1,
    specialCustom: false,
    customSubjects: [],
    customName: '',
    firstTimeCustomize: true,
  },
};