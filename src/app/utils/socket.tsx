// utils/socket.ts
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (userId: string): Socket => {
  if (!socket) {
    socket = io('https://api.blackstoneinfomaticstech.com', {
      transports: ['websocket'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket?.id);
      socket?.emit('subscribe', userId);
    });

    socket.on('disconnect', () => {
      console.warn('⚠️ Socket disconnected');
    });

    socket.on('connect_error', (err: any) => {
      console.error('❌ Socket connection error:', err);
    });
  }
  
   if (socket.connected && userId) {
    socket.emit('subscribe', userId);
  }

  return socket;
};
