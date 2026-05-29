import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect } from '@storybook/test';
import RulesOverlay from './RulesOverlay.js';

/**
 * Access overlay floating button displaying rules.
 * Shows a persistent corner button with "?". Clicking it triggers a fullscreen overlay explaining gameplay, timing limits, scoring, and modes.
 */
const meta: Meta<typeof RulesOverlay> = {
  title: 'Components/RulesOverlay',
  component: RulesOverlay,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div
        style={{
          transform: 'translate(0, 0)',
          minHeight: '220px',
          width: '100%',
          position: 'relative',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px dashed rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          padding: '20px',
          overflow: 'hidden',
        }}
      >
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'Renders a fixed-position floating question-mark button that opens a fullscreen modal containing game instructions.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof RulesOverlay>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const triggerButton = canvas.getByRole('button', { name: /ver reglas del juego/i });
    
    // Verify initial closed state
    await expect(triggerButton).toBeInTheDocument();
    
    // Click to open overlay
    await userEvent.click(triggerButton);
    
    // Verify dialog is opened in DOM
    const dialog = canvas.getByRole('dialog', { name: /reglas del juego/i });
    await expect(dialog).toBeInTheDocument();
    await expect(canvas.getByText('objetivo')).toBeInTheDocument();

    // Click close button inside modal
    const closeButton = canvas.getByRole('button', { name: /cerrar/i });
    await userEvent.click(closeButton);

    // Verify dialog is removed from the DOM
    await expect(dialog).not.toBeInTheDocument();
  },
};

