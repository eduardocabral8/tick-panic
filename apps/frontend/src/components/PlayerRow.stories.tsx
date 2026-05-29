import type { Meta, StoryObj } from '@storybook/react';
import { within, expect } from '@storybook/test';
import PlayerRow from './PlayerRow.js';

/**
 * Display card for a player within a lobby or current game session.
 * Visual cues highlight if it is the player's active turn or if they hold host permissions.
 */
const meta: Meta<typeof PlayerRow> = {
  title: 'Components/PlayerRow',
  component: PlayerRow,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Renders a line item showing player details including their name, score, current turn indicator, and host badge status.',
      },
    },
  },
  argTypes: {
    name: {
      description: 'The player name displayed.',
      control: { type: 'text' },
    },
    score: {
      description: 'The running score of the player in the current session.',
      control: { type: 'number' },
    },
    isHost: {
      description: 'Flag indicating whether this player created the game lobby and owns administrative rights.',
      control: { type: 'boolean' },
    },
    isCurrentTurn: {
      description: 'Flag highlighting the row to draw attention when it is this player\'s active turn.',
      control: { type: 'boolean' },
    },
    hideScore: {
      description: 'Hides the score display entirely. Useful for initial lobby phases before gameplay begins.',
      control: { type: 'boolean' },
      table: {
        defaultValue: { summary: 'false' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof PlayerRow>;

export const Default: Story = {
  args: {
    name: 'Alice',
    score: 12,
    isHost: false,
    isCurrentTurn: false,
    hideScore: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nameEl = canvas.getByText('Alice');
    const scoreEl = canvas.getByText('12');
    await expect(nameEl).toBeInTheDocument();
    await expect(scoreEl).toBeInTheDocument();
  },
};

export const Active: Story = {
  args: {
    name: 'Bob',
    score: 8,
    isHost: false,
    isCurrentTurn: true,
    hideScore: false,
  },
};

export const Host: Story = {
  args: {
    name: 'Alice',
    score: 12,
    isHost: true,
    isCurrentTurn: false,
    hideScore: false,
  },
};

export const HiddenScore: Story = {
  args: {
    name: 'Carla',
    score: 0,
    isHost: false,
    isCurrentTurn: false,
    hideScore: true,
  },
};

