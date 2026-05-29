import type { Meta, StoryObj } from '@storybook/react';
import { expect } from '@storybook/test';
import PressureBackdrop from './PressureBackdrop.js';

/**
 * A fullscreen subtle overlay with grain and gradient blend effects.
 * Designed to heighten the feeling of pressure and excitement during gameplay.
 */
const meta: Meta<typeof PressureBackdrop> = {
  title: 'Components/PressureBackdrop',
  component: PressureBackdrop,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Renders a visual grain overlay and dark radial gradient. Uses hardware-accelerated blend modes to overlay subtly above all other background components.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof PressureBackdrop>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const div = canvasElement.querySelector('[aria-hidden="true"]');
    await expect(div).toBeInTheDocument();
  },
};

