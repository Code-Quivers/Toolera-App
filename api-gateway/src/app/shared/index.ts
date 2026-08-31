import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { config } from '../config';

export function proxyTo(target: string, pathRewrite?: Record<string, string>) {
  const opts: Options = {
    target,
    changeOrigin: true,
    on: {
      error: (err, req, res: any) => {
        res.status(502).json({ success: false, message: 'Service temporarily unavailable' });
      },
    },
  };
  if (pathRewrite) (opts as any).pathRewrite = pathRewrite;
  return createProxyMiddleware(opts);
}

export const toStoreManagement = (prefix?: string) =>
  proxyTo(config.services.storeManagement, prefix ? { [`^${prefix}`]: prefix } : undefined);

export const toBusiness = (prefix?: string) =>
  proxyTo(config.services.business, prefix ? { [`^${prefix}`]: prefix } : undefined);
