import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import BackToLobbyButton from './BackToLobbyButton.js';

const meta: Meta<typeof BackToLobbyButton> = {
  title: 'Components/BackToLobbyButton',
  component: BackToLobbyButton,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div style={{ padding: '20px', maxWidth: '300px' }}>
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BackToLobbyButton>;

export const Default: Story = {
  args: {
    className: '',
  },
};

export const CustomClass: Story = {
  args: {
    className: 'border-red-500 text-red-500 hover:border-red-600 hover:text-red-600',
  },
};
