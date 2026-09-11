import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import routes from "./app/routes/index.routes";
import cookieParser from "cookie-parser";
import { helmetMiddleware, requestLogger } from "./app/middlewares/security";
import { generalRateLimiter } from "./app/middlewares/rateLimit";
import config from "./config";

const app: Application = express();

app.use(helmetMiddleware);
app.use(requestLogger);

const corsOrigins = config.corsOrigins.length > 0 ? config.corsOrigins : ["http://localhost:3000", "http://localhost:3001"];

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["X-Request-Id"],
    maxAge: 86400,
  }),
);
app.use(cookieParser());

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "toolera-server",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use("/backend/api/v1", generalRateLimiter, routes);

app.use(globalErrorHandler);

app.use((req: Request, res: Response, _next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API Not Found | Toolera Server",
    errorMessages: [
      {
        path: req.originalUrl,
        message: "API Not Found | Toolera Server",
      },
    ],
  });
});

export default app;
