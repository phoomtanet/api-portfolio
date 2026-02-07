const startTime = Date.now();

export const getHealthStatus = () => ({
  status: 'ok',
  uptime: process.uptime(),
  timestamp: new Date().toISOString(),
  startedAt: new Date(startTime).toISOString(),
});
