import { createServer } from 'http';
import { Server } from 'socket.io';
import { WS_EVENTS } from '@xingu/shared';

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
});

io.on(WS_EVENTS.CONNECTION, (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on(WS_EVENTS.DISCONNECT, () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const port = process.env.PORT || 3003;
httpServer.listen(port, () => {
  console.log(`🚀 WebSocket Service is running on: http://localhost:${port}`);
});
