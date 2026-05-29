import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect } from '@storybook/test';
import GameCode from './GameCode.js';

/**
 * Component that displays the unique game lobby identifier.
 * Clicking on the code copies it to the system clipboard and provides immediate visual feedback.
 */
const meta: Meta<typeof GameCode> = {
  title: 'Lobby/GameCode',
  component: GameCode,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Interactive code display used in lobby waiting rooms to allow easy sharing with friends.',
      },
    },
  },
  argTypes: {
    code: {
      description: 'The alphanumeric room access code.',
      control: { type: 'text' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof GameCode>;

/**
 * Default state displaying the access code ready to be copied.
 */
export const Default: Story = {
  args: {
    code: 'TICK15',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /copiar código/i });

    // Verify initial code text
    await expect(button).toHaveTextContent('TICK15');

    // Simulate click to copy
    await userEvent.click(button);

    // After click, text should momentarily change to confirmation
    await expect(button).toHaveTextContent('copiado');
  },
};

/**
 * Variation displaying a longer code to test spacing and text truncation.
 */
export const LongCode: Story = {
  args: {
    code: 'PANIC2026GAME',
  },
};
