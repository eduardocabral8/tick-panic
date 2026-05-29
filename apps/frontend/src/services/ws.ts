import { io, Socket } from 'socket.io-client';
import { WS_URL } from '../environment.js';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(WS_URL, { transports: ['websocket'] });
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function joinRoom(gameId: string): void {
  getSocket().emit('join_room', { gameId });
}
