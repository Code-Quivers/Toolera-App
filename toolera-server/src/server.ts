import { Server } from "http";
import app from "./app";
import config from "./config";
import { errorLogger, infoLogger } from "./shared/logger";
import { connectDb, disconnectDb } from "./db/connection";

async function bootstrap() {
  try {
    await connectDb();
  } catch (error) {
    errorLogger.error("[toolera-server] Failed to connect to PostgreSQL. Exiting.", error);
    process.exit(1);
  }

  const server: Server = app.listen(config.port, () => {
    infoLogger.info(`Toolera Server running on PORT ${config.port}`);
  });

  const exitHandler = async () => {
    infoLogger.info("Shutting down server...");
    server.close(async (err) => {
      if (err) errorLogger.error("Error during server close:", err);
      await disconnectDb();
      process.exit(0);
    });
  };

  const unexpectedErrorHandler = async (error: unknown) => {
    errorLogger.error("Unexpected error:", error);
    await exitHandler();
  };

  process.on("uncaughtException", unexpectedErrorHandler);
  process.on("unhandledRejection", unexpectedErrorHandler);
  process.on("SIGTERM", exitHandler);
  process.on("SIGINT", exitHandler);
}

bootstrap();
