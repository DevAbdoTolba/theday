import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Offline from '../../components/Offline';

const meta = {
  component: Offline,
} satisfies Meta<typeof Offline>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {}
};