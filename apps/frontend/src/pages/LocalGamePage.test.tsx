import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LocalGamePage from './LocalGamePage.js';

describe('LocalGamePage', () => {
  it('renders setup form initially', () => {
    render(
      <MemoryRouter>
        <LocalGamePage />
      </MemoryRouter>,
    );
    expect(screen.getByText('modo local')).toBeDefined();
    expect(screen.getByPlaceholderText('jugador 1')).toBeDefined();
    expect(screen.getByPlaceholderText('jugador 2')).toBeDefined();
    expect(screen.getByText('iniciar juego')).toBeDefined();
  });

  it('completes setup and transitions to choose category', () => {
    render(
      <MemoryRouter>
        <LocalGamePage />
      </MemoryRouter>,
    );

    const p1Input = screen.getByPlaceholderText('jugador 1');
    const p2Input = screen.getByPlaceholderText('jugador 2');
    
    fireEvent.change(p1Input, { target: { value: 'Sofia' } });
    fireEvent.change(p2Input, { target: { value: 'Mateo' } });

    // Elegir que empiece Sofia (Jugador 1)
    const selectP1 = screen.getByText('Sofia');
    fireEvent.click(selectP1);

    const startButton = screen.getByText('iniciar juego');
    fireEvent.click(startButton);

    // Debe mostrar la pantalla de elegir categoría para Sofia
    expect(screen.getByText('asignale una categoría a Mateo')).toBeDefined();
    expect(screen.getByPlaceholderText('escribí una categoría aquí...')).toBeDefined();
  });

  it('allows random category generation and manually typing category', () => {
    render(
      <MemoryRouter>
        <LocalGamePage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText('jugador 1'), { target: { value: 'Sofia' } });
    fireEvent.change(screen.getByPlaceholderText('jugador 2'), { target: { value: 'Mateo' } });
    
    // Iniciar con Sofia
    fireEvent.click(screen.getByText('Sofia'));
    fireEvent.click(screen.getByText('iniciar juego'));

    // Escribir manual
    const categoryInput = screen.getByPlaceholderText('escribí una categoría aquí...');
    fireEvent.change(categoryInput, { target: { value: 'Marcas de auto' } });
    expect(screen.getByText('Marcas de auto')).toBeDefined();

    // Probar aleatoria
    const randomBtn = screen.getByText('aleatoria');
    fireEvent.click(randomBtn);
    
    // Debe haber seleccionado una categoría no vacía del array de categorías
    const confirmBtn = screen.getByText('guardar y pasar dispositivo');
    expect(confirmBtn.getAttribute('disabled')).toBeNull();
  });

  it('navigates the entire turn flow: CHOOSE_CATEGORY -> PASS_TO_GUESS -> PLAYING -> PASS_TO_VALIDATE -> VALIDATION -> next turn', () => {
    render(
      <MemoryRouter>
        <LocalGamePage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText('jugador 1'), { target: { value: 'Sofia' } });
    fireEvent.change(screen.getByPlaceholderText('jugador 2'), { target: { value: 'Mateo' } });
    fireEvent.click(screen.getByText('Sofia'));
    fireEvent.click(screen.getByText('iniciar juego'));

    // 1. CHOOSE_CATEGORY
    fireEvent.change(screen.getByPlaceholderText('escribí una categoría aquí...'), {
      target: { value: 'Colores' },
    });
    fireEvent.click(screen.getByText('guardar y pasar dispositivo'));

    // 2. PASS_TO_GUESS
    expect(screen.getByText('pasale el dispositivo a Mateo')).toBeDefined();
    fireEvent.click(screen.getByText('¡ya tengo el dispositivo! comenzar'));

    // 3. PLAYING
    expect(screen.getByText(/colores/i)).toBeDefined();
    expect(screen.getByText('¡ya la dije!')).toBeDefined();
    
    // Pulsar "ya la dije"
    fireEvent.click(screen.getByText('¡ya la dije!'));

    // 4. PASS_TO_VALIDATE
    expect(screen.getByText('¡tiempo terminado!')).toBeDefined();
    expect(screen.getByText('soy Sofia, validar')).toBeDefined();
    fireEvent.click(screen.getByText('soy Sofia, validar'));

    // 5. VALIDATION
    expect(
      screen.getByText(
        (_, element) =>
          element?.tagName === 'SPAN' &&
          (element?.textContent?.includes('¿dijo Mateo una respuesta válida') ?? false),
      ),
    ).toBeDefined();
    
    // Marcar como válida (+1 pt)
    fireEvent.click(screen.getByText('sí, fue válida (+1 pt)'));

    // 6. Debe pasar al turno de Mateo
    expect(screen.getByText('asignale una categoría a Sofia')).toBeDefined();
  });

  it('runs timer countdown and auto-stops when remaining seconds reach 0', () => {
    // Activar timers falsos de Vitest
    vi.useFakeTimers();

    render(
      <MemoryRouter>
        <LocalGamePage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText('jugador 1'), { target: { value: 'Sofia' } });
    fireEvent.change(screen.getByPlaceholderText('jugador 2'), { target: { value: 'Mateo' } });
    fireEvent.click(screen.getByText('Sofia'));
    fireEvent.click(screen.getByText('iniciar juego'));

    // Definir categoría y empezar
    fireEvent.change(screen.getByPlaceholderText('escribí una categoría aquí...'), {
      target: { value: 'Paises' },
    });
    fireEvent.click(screen.getByText('guardar y pasar dispositivo'));
    fireEvent.click(screen.getByText('¡ya tengo el dispositivo! comenzar'));

    // En ronda 1 el time limit es 5 segundos
    expect(screen.getByText('5', { selector: '.font-mono' })).toBeDefined();

    // Avanzar 5 segundos en el reloj
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Debe saltar automáticamente a la pantalla de transición de validación
    expect(screen.getByText('¡tiempo terminado!')).toBeDefined();

    vi.useRealTimers();
  });
});
