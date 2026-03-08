import { createServer } from 'http';
import app from './app';
import env from './config/env';
import prisma from './config/prisma';
import { setupSocket } from './socket/chat.handler';

const httpServer = createServer(app);

setupSocket(httpServer);

const server = httpServer.listen(env.port, () => {
  console.log(`🚀 API running at http://localhost:${env.port}${env.apiPrefix}`);
  console.log(`📚 Swagger UI available at http://localhost:${env.port}/docs`);
  console.log(`💬 WebSocket (chat) ready on port ${env.port}`);
});

const shutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);

  await new Promise<void>((resolve) => {
    server.close(() => {
      console.log('HTTP server closed.');
      resolve();
    });
  });

  try {
    await prisma.$disconnect();
    console.log('Prisma disconnected.');
  } catch (err) {
    console.error('Error during Prisma disconnect:', err);
  }

  process.exit(0);
};

const handleSignal = (signal: NodeJS.Signals) => {
  process.once(signal, () => {
    const timeout = setTimeout(() => {
      console.error('Forcing shutdown after timeout.');
      process.exit(1);
    }, 10000);
    timeout.unref();

    shutdown(signal).catch((err) => {
      console.error('Error during shutdown:', err);
      process.exit(1);
    });
  });
};

(['SIGINT', 'SIGTERM', 'SIGHUP'] as NodeJS.Signals[]).forEach(handleSignal);
