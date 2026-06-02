// Server-side helper: push a Socket.io event to a specific user.
// Works only when the custom server (server.js) is running and the user
// has an active socket connection.
export function emitToUser(userId: string, event: string, data: unknown): void {
  try {
    const io          = (globalThis as any)._io;
    const userSockets = (globalThis as any)._userSockets as Map<string, string> | undefined;
    if (!io || !userSockets) return;
    const socketId = userSockets.get(String(userId));
    if (socketId) io.to(socketId).emit(event, data);
  } catch {
    // Socket server not available (e.g. during build / serverless)
  }
}
