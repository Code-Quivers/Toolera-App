import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { config } from '../config';

export function proxyTo(target: string, pathRewrite?: Record<string, string>) {
  const opts: Options = {
    target,
    changeOrigin: true,
    on: {
      proxyReq: (proxyReq, req: any) => {
        // Express strips the mount prefix from req.url — restore the full path
        if (req.originalUrl) {
          const parsed = new URL(req.originalUrl, 'http://localhost');
          proxyReq.path = parsed.pathname + parsed.search;
        }
        // express.json() consumes the body stream — rewrite it onto the proxy request
        if (req.body && Object.keys(req.body).length > 0) {
          const body = JSON.stringify(req.body);
          proxyReq.setHeader('Content-Type', 'application/json');
          proxyReq.setHeader('Content-Length', Buffer.byteLength(body));
          proxyReq.write(body);
        }
      },
      error: (_err, _req, res: any) => {
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
