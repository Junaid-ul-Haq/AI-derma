'use client';

import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000', {
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

export function connectSocket(userId: string): Socket {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  // Re-register every connect (handles reconnects too)
  s.emit('register-user', { userId });
  s.on('connect', () => s.emit('register-user', { userId }));
  return s;
}

export function disconnectSocket(): void {
  socket?.disconnect();
}
