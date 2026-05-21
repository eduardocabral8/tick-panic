import type { Meta, StoryObj } from '@storybook/react';
import PlayerRow from './PlayerRow.js';

const meta: Meta<typeof PlayerRow> = {
  title: 'Components/PlayerRow',
  component: PlayerRow,
};

export default meta;
type Story = StoryObj<typeof PlayerRow>;

export const Default: Story = {
  args: {
    name: 'Alice',
    score: 12,
    isHost: false,
    isCurrentTurn: false,
  },
};

export const Active: Story = {
  args: {
    name: 'Bob',
    score: 8,
    isHost: false,
    isCurrentTurn: true,
  },
};

export const Host: Story = {
  args: {
    name: 'Alice',
    score: 12,
    isHost: true,
    isCurrentTurn: false,
  },
};
