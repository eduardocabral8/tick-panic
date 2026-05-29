import type { Meta, StoryObj } from '@storybook/react';
import { within, expect } from '@storybook/test';
import RoundIndicator from './RoundIndicator.js';

/**
 * Visual game round indicator showing progression.
 * Numbers representing rounds are displayed side-by-side: passed rounds are faded, active round is highlighted, and future rounds are muted.
 */
const meta: Meta<typeof RoundIndicator> = {
  title: 'Components/RoundIndicator',
  component: RoundIndicator,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Renders the round indicator numbers horizontally. Highlight colors map dynamically to player round status to maintain game context.',
      },
    },
  },
  argTypes: {
    currentRound: {
      description: 'The index of the active round. Determines the highlighted item in the series.',
      control: { type: 'number', min: 1 },
    },
    totalRounds: {
      description: 'The total round count of the current lobby session.',
      control: { type: 'number', min: 1 },
      table: {
        defaultValue: { summary: '5' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof RoundIndicator>;

export const Round1: Story = {
  args: { currentRound: 1, totalRounds: 5 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const round1 = canvas.getByText('1');
    const round2 = canvas.getByText('2');
    
    // Assert active round has text-accent and future rounds have text-text-tertiary
    await expect(round1).toHaveClass('text-accent');
    await expect(round2).toHaveClass('text-text-tertiary');
  },
};

export const Round3: Story = {
  args: { currentRound: 3, totalRounds: 5 },
};

export const Round5: Story = {
  args: { currentRound: 5, totalRounds: 5 },
};

