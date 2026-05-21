import type { Meta, StoryObj } from '@storybook/react';
import RoundIndicator from './RoundIndicator.js';

const meta: Meta<typeof RoundIndicator> = {
  title: 'Components/RoundIndicator',
  component: RoundIndicator,
};

export default meta;
type Story = StoryObj<typeof RoundIndicator>;

export const Round1: Story = {
  args: { currentRound: 1, totalRounds: 5 },
};

export const Round3: Story = {
  args: { currentRound: 3, totalRounds: 5 },
};

export const Round5: Story = {
  args: { currentRound: 5, totalRounds: 5 },
};
