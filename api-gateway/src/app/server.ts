import { config } from './config';
import app from './app';

const server = app.listen(config.port, () => {
  console.log(`[API Gateway] running on port ${config.port}`);
  console.log(`[Health] http://localhost:${config.port}/health`);
  console.log(`[→ Store Management] ${config.services.storeManagement}`);
  console.log(`[→ Business Service] ${config.services.business}`);
});

process.on('unhandledRejection', (err: any) => {
  console.error('[API Gateway] Unhandled rejection:', err.message);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
