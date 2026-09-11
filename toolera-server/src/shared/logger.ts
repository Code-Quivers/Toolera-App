import path from "path";
import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
const { combine, timestamp, label, printf } = format;

const successFormat = printf(({ level, message, timestamp }) => {
  const date = new Date(timestamp as Date);
  const localTime = date.toLocaleString("en-US", {
    hour12: true,
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return `[${localTime}] [${level.toUpperCase()}] ▶ ${message}`;
});

const errorFormat = printf(({ level, message, timestamp, ...srv }) => {
  const date = new Date(timestamp as Date);
  const localTime = date.toLocaleString("en-US", {
    hour12: true,
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return `[${localTime}] [${level.toUpperCase()}] - Message: "${message}" | StatusCode: ${srv?.statusCode || "400"}`;
});

const logger = createLogger({
  level: "info",
  format: combine(label({ label: "TOOLERA" }), timestamp(), successFormat),
  transports: [
    new transports.Console(),
    new DailyRotateFile({
      filename: path.join(process.cwd(), "logs", "winston", "successes", "TOOLERA_-%DATE%-success.log"),
      datePattern: "YYYY-DD-MM-HH",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "30d",
    }),
  ],
});

const infoLogger = createLogger({
  level: "info",
  format: combine(label({ label: "TOOLERA" }), timestamp(), successFormat),
  transports: [
    new transports.Console(),
    new DailyRotateFile({
      filename: path.join(process.cwd(), "logs", "winston", "info", "TOOLERA_-%DATE%-info.log"),
      datePattern: "YYYY-DD-MM-HH",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "30d",
    }),
  ],
});

const errorLogger = createLogger({
  level: "error",
  format: combine(label({ label: "TOOLERA" }), timestamp(), errorFormat),
  transports: [
    new transports.Console(),
    new DailyRotateFile({
      filename: path.join(process.cwd(), "logs", "winston", "errors", "TOOLERA_-%DATE%-error.log"),
      datePattern: "YYYY-DD-MM-HH",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "30d",
    }),
  ],
});

export { logger, errorLogger, infoLogger };
