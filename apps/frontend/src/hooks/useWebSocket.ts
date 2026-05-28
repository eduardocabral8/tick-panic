import { useEffect, useRef, useCallback, useState } from 'react';
import { getSocket, joinRoom } from '../services/ws.js';

export function useWebSocket(gameId: string | null, onReconnect?: () => void) {
  const socketRef = useRef(getSocket());
  const [connected, setConnected] = useState<boolean>(socketRef.current.connected);

  useEffect(() => {
    if (gameId) {
      joinRoom(gameId);
    }

    const handleConnect = () => {
      setConnected(true);
      if (gameId) {
        joinRoom(gameId);
      }
      if (onReconnect) {
        onReconnect();
      }
    };

    const handleDisconnect = () => {
      setConnected(false);
    };

    socketRef.current.on('connect', handleConnect);
    socketRef.current.on('disconnect', handleDisconnect);

    return () => {
      socketRef.current.off('connect', handleConnect);
      socketRef.current.off('disconnect', handleDisconnect);
    };
  }, [gameId, onReconnect]);

  const on = useCallback((event: string, callback: (payload: unknown) => void) => {
    socketRef.current.on(event, callback);
  }, []);

  const off = useCallback((event: string, callback: (payload: unknown) => void) => {
    socketRef.current.off(event, callback);
  }, []);

  return { on, off, connected };
}
