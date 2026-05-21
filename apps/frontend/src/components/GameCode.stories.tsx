import type { Meta, StoryObj } from '@storybook/react';
import GameCode from './GameCode.js';

const meta: Meta<typeof GameCode> = {
  title: 'Components/GameCode',
  component: GameCode,
};

export default meta;
type Story = StoryObj<typeof GameCode>;

export const Default: Story = {
  args: { code: 'ABC123' },
};

export const Copied: Story = {
  args: { code: 'XYZ789' },
};
