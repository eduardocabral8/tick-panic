import { describe, it, expect, vi } from 'vitest';
import { createGameSocket, broadcastEvent } from './gameSocket.js';

describe('createGameSocket', () => {
  it('should join socket to room on join_room event', () => {
    const mockSocket = {
      on: vi.fn(),
      join: vi.fn(),
    };
    const mockIo = {
      on: vi.fn().mockImplementation((_event: string, handler: (socket: unknown) => void) => {
        handler(mockSocket);
      }),
    };

    createGameSocket(mockIo as unknown as import('socket.io').Server);

    const joinRoomHandler = mockSocket.on.mock.calls.find((call) => call[0] === 'join_room');
    expect(joinRoomHandler).toBeDefined();
    joinRoomHandler[1]({ gameId: 'game-1' });
    expect(mockSocket.join).toHaveBeenCalledWith('game-1');
  });
});

describe('broadcastEvent', () => {
  it('should emit event to room', () => {
    const mockTo = {
      emit: vi.fn(),
    };
    const mockIo = {
      to: vi.fn().mockReturnValue(mockTo),
    };

    broadcastEvent(mockIo as unknown as import('socket.io').Server, 'game-1', 'TURN_STARTED', { turnId: 't1' });

    expect(mockIo.to).toHaveBeenCalledWith('game-1');
    expect(mockTo.emit).toHaveBeenCalledWith('TURN_STARTED', { turnId: 't1' });
  });
});
