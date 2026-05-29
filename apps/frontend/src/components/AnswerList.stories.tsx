import type { Meta, StoryObj } from '@storybook/react';
import { expect } from '@storybook/test';
import AnswerList from './AnswerList.js';

/**
 * List showcasing answers submitted by a player.
 * Items color-code status: valid answers highlight in green (`text-valid`), invalid answers strike through in red (`text-error line-through`), and pending answers render normally.
 * Note: Renders items in reverse chronological order (newest first).
 */
const meta: Meta<typeof AnswerList> = {
  title: 'Components/AnswerList',
  component: AnswerList,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Standard list display for turn responses. Accepts answer objects with validations, reverses order to put latest answers on top, and applies color statuses.',
      },
    },
  },
  argTypes: {
    answers: {
      description: 'Collection of answer objects, each containing an ID, answer string, and validation status.',
      control: { type: 'object' },
    },
  },
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
  play: async ({ canvasElement }) => {
    const listItems = canvasElement.querySelectorAll('li');
    
    // Assert there are 3 entries
    await expect(listItems.length).toBe(3);
    
    // Assert reverse order: first element in DOM should be the last in the input array (Elefante)
    await expect(listItems[0]).toHaveTextContent('Elefante');
    await expect(listItems[1]).toHaveTextContent('Gato');
    await expect(listItems[2]).toHaveTextContent('Perro');
    
    // Assert styling classes correspond to state
    await expect(listItems[2]).toHaveClass('text-valid'); // Perro
    await expect(listItems[1]).toHaveClass('text-error'); // Gato
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

