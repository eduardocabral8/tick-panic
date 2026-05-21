import { useEffect, useRef, useCallback } from 'react';
import { getSocket, joinRoom } from '../services/ws.js';

export function useWebSocket(gameId: string | null, onReconnect?: () => void) {
  const socketRef = useRef(getSocket());

  useEffect(() => {
    if (gameId) {
      joinRoom(gameId);
    }

    const handleConnect = () => {
      if (gameId) {
        joinRoom(gameId);
      }
      if (onReconnect) {
        onReconnect();
      }
    };

    socketRef.current.on('connect', handleConnect);

    return () => {
      socketRef.current.off('connect', handleConnect);
    };
  }, [gameId, onReconnect]);

  const on = useCallback((event: string, callback: (payload: unknown) => void) => {
    socketRef.current.on(event, callback);
  }, []);

  const off = useCallback((event: string, callback: (payload: unknown) => void) => {
    socketRef.current.off(event, callback);
  }, []);

  return { on, off };
}
