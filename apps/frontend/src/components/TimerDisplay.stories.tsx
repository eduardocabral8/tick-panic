import type { Meta, StoryObj } from '@storybook/react';
import { within, expect } from '@storybook/test';
import TimerDisplay from './TimerDisplay.js';

/**
 * Visual countdown timer component built for high pressure.
 * The heartbeat visual pulse accelerates and changes color as the remaining time runs out.
 */
const meta: Meta<typeof TimerDisplay> = {
  title: 'Game/TimerDisplay',
  component: TimerDisplay,
  tags: ['autodocs'],
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        component: 'The heartbeat of the gameplay session. Displays remaining seconds for the active player with high-contrast, pulsating colors.',
      },
    },
  },
  argTypes: {
    remainingSeconds: {
      description: 'Seconds left on the active turn. If null, displays a placeholder hyphen "-".',
      control: { type: 'number', min: 0, max: 15 },
    },
    totalSeconds: {
      description: 'Initial threshold of seconds, used to calculate relative pulse speed ratios.',
      control: { type: 'number' },
      table: {
        defaultValue: { summary: '5' },
      },
    },
    isActive: {
      description: 'Controls whether the countdown animation and state transitions are active.',
      control: { type: 'boolean' },
    },
    roundNumber: {
      description: 'Current round index to render context information.',
      control: { type: 'number' },
    },
    totalRounds: {
      description: 'Total number of rounds configured in the current game room.',
      control: { type: 'number' },
      table: {
        defaultValue: { summary: '5' },
      },
    },
    onExpired: {
      description: 'Callback fired automatically by the component when the remaining seconds reach 0.',
      action: 'expired',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TimerDisplay>;

/**
 * Default state with plenty of time remaining (> 3s). Displays a slow pulse in the primary text color.
 */
export const ActiveMoreThan3: Story = {
  args: {
    remainingSeconds: 5,
    totalSeconds: 5,
    isActive: true,
    roundNumber: 3,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const timer = canvas.getByRole('timer', { name: /tiempo restante/i });
    await expect(timer).toBeInTheDocument();
    await expect(timer).toHaveTextContent('5');
  },
};


/**
 * Critical countdown state (<= 3s). Switches to accent color and speeds up heartbeat scaling.
 */
export const ActiveCritical: Story = {
  args: {
    remainingSeconds: 2,
    totalSeconds: 5,
    isActive: true,
    roundNumber: 3,
  },
};

/**
 * Inactive timer state prior to the start of the turn.
 */
export const Inactive: Story = {
  args: {
    remainingSeconds: 5,
    totalSeconds: 5,
    isActive: false,
    roundNumber: 1,
  },
};

/**
 * Time is fully up (0s). Changes to error color (red) indicating the turn has concluded.
 */
export const Expired: Story = {
  args: {
    remainingSeconds: 0,
    totalSeconds: 5,
    isActive: true,
    roundNumber: 5,
  },
};
