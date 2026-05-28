import type { Meta, StoryObj } from '@storybook/react';
import CategoryDisplay from './CategoryDisplay.js';

const meta: Meta<typeof CategoryDisplay> = {
  title: 'Components/CategoryDisplay',
  component: CategoryDisplay,
};

export default meta;
type Story = StoryObj<typeof CategoryDisplay>;

export const Animales: Story = {
  args: {
    categoryName: 'Animales',
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
