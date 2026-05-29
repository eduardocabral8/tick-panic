import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect } from '@storybook/test';
import AnswerInput from './AnswerInput.js';

/**
 * Input component for typing and submitting answers against the clock.
 * Features a visual flash effect upon submission and is disabled when time expires.
 */
const meta: Meta<typeof AnswerInput> = {
  title: 'Game/AnswerInput',
  component: AnswerInput,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Form input used by the active player to submit answers during their turn.',
      },
    },
  },
  argTypes: {
    onSubmit: {
      description: 'Callback function triggered when the form is submitted with a non-empty value.',
      action: 'submitted',
    },
    disabled: {
      description: 'Disables the input field and submit button when the player turn is not active.',
      control: { type: 'boolean' },
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    placeholder: {
      description: 'Helper text displayed inside the input when it is empty.',
      control: { type: 'text' },
      table: {
        defaultValue: { summary: 'escribe tu respuesta...' },
      },
    },
    timerExpired: {
      description: 'Triggers automatic submission of any currently typed text when the turn timer expires.',
      control: { type: 'boolean' },
      table: {
        defaultValue: { summary: 'false' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AnswerInput>;

/**
 * Default state when the player has an active turn and is free to type answers.
 */
export const Default: Story = {
  args: {
    disabled: false,
    placeholder: 'escribe tu respuesta...',
    timerExpired: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('respuesta');
    const submitButton = canvas.getByRole('button', { name: /enviar/i });

    // Verify input is empty and submit button is disabled initially
    await expect(input).toHaveValue('');
    await expect(submitButton).toBeDisabled();

    // Type a test answer
    await userEvent.type(input, 'elefante');
    await expect(input).toHaveValue('elefante');
    await expect(submitButton).toBeEnabled();

    // Submit the form
    await userEvent.click(submitButton);

    // Input should be cleared upon successful submission
    await expect(input).toHaveValue('');
  },
};

/**
 * Disabled state when the player is waiting for their turn or for other players to finish.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'esperando...',
    timerExpired: false,
  },
};

/**
 * Expired state showing how the input behaves when the turn timer expires.
 */
export const Expired: Story = {
  args: {
    disabled: false,
    placeholder: 'tiempo agotado',
    timerExpired: true,
  },
};
