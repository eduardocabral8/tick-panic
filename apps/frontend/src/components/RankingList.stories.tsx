import type { Meta, StoryObj } from '@storybook/react';
import { within, expect } from '@storybook/test';
import RankingList from './RankingList.js';

/**
 * Scoreboard list containing game participants.
 * Automatically sorts entries in descending score order. Highlighting is applied to the top player if there is an undisputed winner, or displays a tie indicator.
 */
const meta: Meta<typeof RankingList> = {
  title: 'Components/RankingList',
  component: RankingList,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Leaderboard ranking visualizer. Takes a collection of player score profiles, sorts them, handles tie banners, and visually emphasizes the winner.',
      },
    },
  },
  argTypes: {
    entries: {
      description: 'List of player profiles with ids, names, scores, and host statuses.',
      control: { type: 'object' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof RankingList>;

export const SingleWinner: Story = {
  args: {
    entries: [
      { id: '1', name: 'alice', score: 10, isHost: true },
      { id: '2', name: 'bob', score: 7 },
      { id: '3', name: 'carla', score: 5 },
    ],
  },
  play: async ({ canvasElement }) => {
    const listItems = canvasElement.querySelectorAll('li');
    
    // Assert there are 3 entries
    await expect(listItems.length).toBe(3);
    
    // Verify first row contains "alice" (winner) and score 10
    const firstRow = listItems[0];
    await expect(within(firstRow).getByText('alice')).toBeInTheDocument();
    await expect(within(firstRow).getByText('10')).toBeInTheDocument();
    await expect(firstRow).toHaveClass('bg-accent'); // Winner class
  },
};

export const TiedWinners: Story = {
  args: {
    entries: [
      { id: '1', name: 'alice', score: 8, isHost: true },
      { id: '2', name: 'bob', score: 8 },
      { id: '3', name: 'carla', score: 3 },
    ],
  },
};

export const AllZero: Story = {
  args: {
    entries: [
      { id: '1', name: 'alice', score: 0, isHost: true },
      { id: '2', name: 'bob', score: 0 },
    ],
  },
};

