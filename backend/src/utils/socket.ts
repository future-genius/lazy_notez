import http from 'http';
import { Server as IOServer } from 'socket.io';

let io: IOServer | null = null;

export const initSocket = (server: http.Server) => {
  if (io) return io;
  io = new IOServer(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);
    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = () => io;
