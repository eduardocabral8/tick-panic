import type { Meta, StoryObj } from '@storybook/react';
import TimerDisplay from './TimerDisplay.js';

const meta: Meta<typeof TimerDisplay> = {
  title: 'Components/TimerDisplay',
  component: TimerDisplay,
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

export default meta;
type Story = StoryObj<typeof TimerDisplay>;

export const ActiveMoreThan3: Story = {
  args: {
    remainingSeconds: 5,
    totalSeconds: 5,
    isActive: true,
    roundNumber: 3,
  },
};

export const ActiveCritical: Story = {
  args: {
    remainingSeconds: 2,
    totalSeconds: 5,
    isActive: true,
    roundNumber: 3,
  },
};

export const Inactive: Story = {
  args: {
    remainingSeconds: 5,
    totalSeconds: 5,
    isActive: false,
    roundNumber: 1,
  },
};

export const Expired: Story = {
  args: {
    remainingSeconds: 0,
    totalSeconds: 5,
    isActive: true,
    roundNumber: 5,
  },
};
