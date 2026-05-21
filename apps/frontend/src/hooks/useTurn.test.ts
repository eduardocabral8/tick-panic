import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTurn } from './useTurn.js';

const mockedApi = vi.hoisted(() => ({
  startTurn: vi.fn(),
  submitAnswer: vi.fn(),
  finishTurn: vi.fn(),
  nextTurn: vi.fn(),
  validateAnswer: vi.fn(),
}));

vi.mock('../services/api.js', () => ({
  startTurn: mockedApi.startTurn,
  submitAnswer: mockedApi.submitAnswer,
  finishTurn: mockedApi.finishTurn,
  nextTurn: mockedApi.nextTurn,
  validateAnswer: mockedApi.validateAnswer,
}));

describe('useTurn', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('startTurn delegates to api', async () => {
    mockedApi.startTurn.mockResolvedValueOnce({});
    const { result } = renderHook(() => useTurn());
    await result.current.startTurn('g1');
    expect(mockedApi.startTurn).toHaveBeenCalledWith('g1');
  });

  it('startTurn sets error on failure', async () => {
    mockedApi.startTurn.mockRejectedValueOnce(new Error('fail'));
    const { result } = renderHook(() => useTurn());
    await expect(result.current.startTurn('g1')).rejects.toThrow('no se pudo iniciar el turno');
    await waitFor(() => expect(result.current.error).toBe('no se pudo iniciar el turno'));
  });

  it('submitAnswer delegates to api', async () => {
    mockedApi.submitAnswer.mockResolvedValueOnce({});
    const { result } = renderHook(() => useTurn());
    await result.current.submitAnswer('t1', 'respuesta', 'p1');
    expect(mockedApi.submitAnswer).toHaveBeenCalledWith('t1', 'respuesta', 'p1');
  });

  it('submitAnswer sets error on failure', async () => {
    mockedApi.submitAnswer.mockRejectedValueOnce(new Error('fail'));
    const { result } = renderHook(() => useTurn());
    await expect(result.current.submitAnswer('t1', 'x', 'p1')).rejects.toThrow('no se pudo enviar la respuesta');
  });

  it('finishTurn delegates to api', async () => {
    mockedApi.finishTurn.mockResolvedValueOnce({});
    const { result } = renderHook(() => useTurn());
    await result.current.finishTurn('t1');
    expect(mockedApi.finishTurn).toHaveBeenCalledWith('t1');
  });

  it('finishTurn sets error on failure', async () => {
    mockedApi.finishTurn.mockRejectedValueOnce(new Error('fail'));
    const { result } = renderHook(() => useTurn());
    await expect(result.current.finishTurn('t1')).rejects.toThrow('no se pudo finalizar el turno');
  });

  it('nextTurn delegates to api', async () => {
    mockedApi.nextTurn.mockResolvedValueOnce({});
    const { result } = renderHook(() => useTurn());
    await result.current.nextTurn('g1');
    expect(mockedApi.nextTurn).toHaveBeenCalledWith('g1');
  });

  it('nextTurn sets error on failure', async () => {
    mockedApi.nextTurn.mockRejectedValueOnce(new Error('fail'));
    const { result } = renderHook(() => useTurn());
    await expect(result.current.nextTurn('g1')).rejects.toThrow('no se pudo pasar al siguiente turno');
  });

  it('validateAnswer delegates to api', async () => {
    mockedApi.validateAnswer.mockResolvedValueOnce({});
    const { result } = renderHook(() => useTurn());
    await result.current.validateAnswer('t1', 'a1', true, 'p1');
    expect(mockedApi.validateAnswer).toHaveBeenCalledWith('t1', 'a1', true, 'p1');
  });

  it('validateAnswer sets error on failure', async () => {
    mockedApi.validateAnswer.mockRejectedValueOnce(new Error('fail'));
    const { result } = renderHook(() => useTurn());
    await expect(result.current.validateAnswer('t1', 'a1', true, 'p1')).rejects.toThrow('no se pudo validar la respuesta');
  });
});
