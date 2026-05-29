import type { Meta, StoryObj } from '@storybook/react';
import { within, expect } from '@storybook/test';
import CategoryDisplay from './CategoryDisplay.js';

/**
 * Visual display component showcasing the currently selected theme or category.
 * Used during active turns so the player knows what semantic group to answer from.
 */
const meta: Meta<typeof CategoryDisplay> = {
  title: 'Components/CategoryDisplay',
  component: CategoryDisplay,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Renders the active category label in a bold lowercase display. Automatically handles word-wrapping for long strings to prevent text overflows.',
      },
    },
  },
  argTypes: {
    categoryName: {
      description: 'The label of the game category.',
      control: { type: 'text' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CategoryDisplay>;

export const Animales: Story = {
  args: {
    categoryName: 'Animales',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textEl = canvas.getByText('animales');
    await expect(textEl).toBeInTheDocument();
  },
};

export const Paises: Story = {
  args: {
    categoryName: 'Países',
  },
};

export const Profesiones: Story = {
  args: {
    categoryName: 'Profesiones',
  },
};

