import type { Meta, StoryObj } from '@storybook/react';
import AnswerList from './AnswerList.js';

const meta: Meta<typeof AnswerList> = {
  title: 'Components/AnswerList',
  component: AnswerList,
};

export default meta;
type Story = StoryObj<typeof AnswerList>;

export const Mixed: Story = {
  args: {
    answers: [
      { id: '1', text: 'Perro', isValid: true },
      { id: '2', text: 'Gato', isValid: false },
      { id: '3', text: 'Elefante', isValid: null },
    ],
  },
};

export const AllValid: Story = {
  args: {
    answers: [
      { id: '1', text: 'Perro', isValid: true },
      { id: '2', text: 'Gato', isValid: true },
    ],
  },
};

export const AllInvalid: Story = {
  args: {
    answers: [
      { id: '1', text: 'Perro', isValid: false },
      { id: '2', text: 'Gato', isValid: false },
    ],
  },
};

export const Empty: Story = {
  args: {
    answers: [],
  },
};
