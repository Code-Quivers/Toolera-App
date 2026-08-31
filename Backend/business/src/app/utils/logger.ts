const timestamp = () => new Date().toISOString();

export const infoLogger = {
  info: (message: string, ...meta: unknown[]) => {
    console.log(`[${timestamp()}] INFO: ${message}`, ...meta);
  },
};

export const errorLogger = {
  error: (message: string, ...meta: unknown[]) => {
    console.error(`[${timestamp()}] ERROR: ${message}`, ...meta);
  },
};
