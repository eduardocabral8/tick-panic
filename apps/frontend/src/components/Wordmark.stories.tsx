import type { Meta, StoryObj } from '@storybook/react';
import { within, expect } from '@storybook/test';
import Wordmark from './Wordmark.js';

/**
 * Visual game wordmark showing "tick:panic" in lowercase.
 * Supports static representation and dynamic keyframe text animations.
 */
const meta: Meta<typeof Wordmark> = {
  title: 'Components/Wordmark',
  component: Wordmark,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Renders the game wordmark "tick:panic". Used primarily on home screen, waiting rooms, and header navigation panels.',
      },
    },
  },
  argTypes: {
    className: {
      description: 'CSS classes to customize layout and sizing of the text.',
      control: { type: 'text' },
      table: {
        defaultValue: { summary: '""' },
      },
    },
    animate: {
      description: 'Controls whether the text elements undergo keyframe animation cycles.',
      control: { type: 'boolean' },
      table: {
        defaultValue: { summary: 'false' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Wordmark>;

export const Default: Story = {
  args: {
    animate: false,
    className: 'text-4xl',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const wordmark = canvas.getByLabelText('tickpanic');
    await expect(wordmark).toBeInTheDocument();
    await expect(wordmark).toHaveTextContent('tick:panic');
  },
};

export const Animated: Story = {
  args: {
    animate: true,
    className: 'text-4xl',
  },
};

