import type { Meta, StoryObj } from '@storybook/react';
import CategoryDisplay from './CategoryDisplay.js';

const meta: Meta<typeof CategoryDisplay> = {
  title: 'Components/CategoryDisplay',
  component: CategoryDisplay,
};

export default meta;
type Story = StoryObj<typeof CategoryDisplay>;

export const Round1: Story = {
  args: {
    categoryName: 'Animales',
    roundNumber: 1,
  },
};

export const Round3: Story = {
  args: {
    categoryName: 'Países',
    roundNumber: 3,
  },
};

export const Round5: Story = {
  args: {
    categoryName: 'Profesiones',
    roundNumber: 5,
  },
};
