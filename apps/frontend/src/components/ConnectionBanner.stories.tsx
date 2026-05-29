import type { Meta, StoryObj } from '@storybook/react';
import { within, expect } from '@storybook/test';
import ConnectionBanner from './ConnectionBanner.js';

/**
 * Visual warning banner that slides down if connection to the server is lost.
 * Implements a 1-second debounce timer to avoid visual flashing during brief reconnects.
 */
const meta: Meta<typeof ConnectionBanner> = {
  title: 'Components/ConnectionBanner',
  component: ConnectionBanner,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Alert banner rendered at the absolute top of the screen when disconnected. Automatically delayed by 1000ms to ignore momentary packet loss.',
      },
    },
  },
  argTypes: {
    connected: {
      description: 'The real-time connection status with the backend WebSocket server.',
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ConnectionBanner>;

export const Disconnected: Story = {
  args: {
    connected: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const banner = canvas.getByRole('status');
    await expect(banner).toBeInTheDocument();
    await expect(banner).toHaveTextContent('sin conexión, reintentando…');
    // Wait for the 1000ms delay to finish to verify opacity classes
    await new Promise((resolve) => setTimeout(resolve, 1100));
    await expect(banner).toHaveClass('opacity-100');
  },
};

export const Connected: Story = {
  args: {
    connected: true,
  },
};

