import app from './app';
import env from './config/env';

const server = app.listen(env.port, () => {
  console.log(`🚀 API running at http://localhost:${env.port}${env.apiPrefix}`);
  console.log(`📚 Swagger UI available at http://localhost:${env.port}/docs`);
});

const shutdown = (signal: string) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Forcing shutdown after timeout.');
    process.exit(1);
  }, 10000).unref();
};

['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal as NodeJS.Signals, () => shutdown(signal));
});
