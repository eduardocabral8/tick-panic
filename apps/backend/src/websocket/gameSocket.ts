import { Server as SocketIOServer, Socket } from 'socket.io';

export function createGameSocket(io: SocketIOServer): void {
  io.on('connection', (socket: Socket) => {
    socket.on('join_room', (data: { gameId: string }) => {
      if (data.gameId) {
        socket.join(data.gameId);
      }
    });
  });
}

export function broadcastEvent(io: SocketIOServer, gameId: string, event: string, payload: unknown): void {
  io.to(gameId).emit(event, payload);
}
