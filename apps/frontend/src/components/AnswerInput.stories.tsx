import type { Meta, StoryObj } from '@storybook/react';
import AnswerInput from './AnswerInput.js';

const meta: Meta<typeof AnswerInput> = {
  title: 'Components/AnswerInput',
  component: AnswerInput,
};

export default meta;
type Story = StoryObj<typeof AnswerInput>;

export const Default: Story = {
  args: {
    onSubmit: () => {},
    disabled: false,
    placeholder: 'escribe tu respuesta...',
  },
};

export const Disabled: Story = {
  args: {
    onSubmit: () => {},
    disabled: true,
    placeholder: 'esperando...',
  },
};

export const CustomPlaceholder: Story = {
  args: {
    onSubmit: () => {},
    disabled: false,
    placeholder: 'tu respuesta aquí',
  },
};
