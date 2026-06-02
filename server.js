// Custom Next.js server — adds Socket.io for real-time notifications
// Run with:  node server.js   (instead of next dev)
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// userId (string) -> socketId mapping
const userSockets = new Map();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    const parsedUrl = parse(req.url, true);
    await handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  // Expose to API routes via globalThis
  globalThis._io = io;
  globalThis._userSockets = userSockets;

  io.on('connection', (socket) => {
    // Client registers its userId so we can target it
    socket.on('register-user', ({ userId }) => {
      if (userId) {
        userSockets.set(String(userId), socket.id);
        socket._userId = String(userId);
      }
    });

    socket.on('disconnect', () => {
      if (socket._userId) {
        userSockets.delete(socket._userId);
      }
    });
  });

  httpServer
    .once('error', (err) => { console.error(err); process.exit(1); })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
