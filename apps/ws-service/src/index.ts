import { createServer } from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { WS_EVENTS } from '@xingu/shared';
import { connectDatabase, disconnectDatabase } from './config/database';
import { redisPub, redisSub, disconnectRedis } from './config/redis';
import { setupRoomHandlers } from './handlers/room.handler';
import { setupGameHandlers } from './handlers/game.handler';

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

io.on(WS_EVENTS.CONNECTION, (socket) => {
  console.log(`Client connected: ${socket.id}`);

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
  process.exit(1);
});
