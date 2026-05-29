import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect } from '@storybook/test';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import BackToLobbyButton from './BackToLobbyButton.js';

/**
 * A standard navigation button that returns the player to the lobby.
 * Styled with an outline theme to remain visually subordinate to major actions.
 */
const meta: Meta<typeof BackToLobbyButton> = {
  title: 'Components/BackToLobbyButton',
  component: BackToLobbyButton,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div style={{ padding: '20px', maxWidth: '300px' }}>
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'Renders a standardized button to return to the game lobby page. Fully responsive and encapsulates react-router redirection logic.',
      },
    },
  },
  argTypes: {
    className: {
      description: 'Additional CSS utility classes to modify border colors, sizes, margins or animations.',
      control: { type: 'text' },
      table: {
        defaultValue: { summary: '""' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BackToLobbyButton>;

export const Default: Story = {
  args: {
    className: '',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /volver al lobby/i });
    await expect(button).toBeInTheDocument();
    await userEvent.click(button);
  },
};

export const CustomClass: Story = {
  args: {
    className: 'border-red-500 text-red-500 hover:border-red-600 hover:text-red-600',
  },
};

