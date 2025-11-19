import 'dotenv/config';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { WS_EVENTS } from '@xingu/shared';
import * as Sentry from '@sentry/node';
import { connectDatabase, disconnectDatabase } from './config/database';
import { redisPub, redisSub, disconnectRedis } from './config/redis';
import { setupRoomHandlers } from './handlers/room.handler';
import { setupGameHandlers } from './handlers/game.handler';
import { wsAuthMiddleware } from './middleware/ws-auth.middleware';
import { initSentry } from './config/sentry.config';

// Initialize Sentry (WebSocket service doesn't use Express middleware)
initSentry(null, 'ws-service');

const httpServer = createServer((req, res) => {
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'WebSocket Service is healthy!' }));
  }
});

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
});

io.adapter(createAdapter(redisPub, redisSub));

io.use(wsAuthMiddleware);

// Capture Socket.io server errors
io.on('error', (error) => {
  console.error('Socket.io server error:', error);
  Sentry.captureException(error, {
    tags: { component: 'socket.io-server' },
  });
});

io.on(WS_EVENTS.CONNECTION, (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Capture socket connection errors
  socket.on('error', (error) => {
    console.error(`Socket error [${socket.id}]:`, error);
    Sentry.captureException(error, {
      tags: {
        component: 'socket-connection',
        socketId: socket.id,
      },
      extra: {
        userId: socket.data.userId,
        roomPin: socket.data.roomPin,
      },
    });
  });

  // Capture disconnect errors
  socket.on('disconnect', (reason) => {
    if (reason === 'transport error' || reason === 'ping timeout') {
      Sentry.captureMessage(`Socket disconnected: ${reason}`, {
        level: 'warning',
        tags: {
          component: 'socket-disconnect',
          socketId: socket.id,
          reason,
        },
        extra: {
          userId: socket.data.userId,
          roomPin: socket.data.roomPin,
        },
      });
    }
  });

  setupRoomHandlers(io, socket);
  setupGameHandlers(io, socket);
});

const port = process.env.PORT || 3005;

async function startServer() {
  await connectDatabase();

  httpServer.listen(port, () => {
    console.log(`🚀 WebSocket Service is running on: http://localhost:${port}`);
  });
}

process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing server');
  await disconnectDatabase();
  await disconnectRedis();
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing server');
  await disconnectDatabase();
  await disconnectRedis();
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  Sentry.captureException(error, {
    tags: { component: 'server-startup' },
    level: 'fatal',
  });
  process.exit(1);
});
