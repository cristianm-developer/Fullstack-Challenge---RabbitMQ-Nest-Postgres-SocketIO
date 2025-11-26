import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { InjectPinoLogger } from 'pino-nestjs';
import { PinoLogger } from 'pino-nestjs';

@Injectable()
export class WebSocketProxyMiddleware implements NestMiddleware {
  public proxyMiddleware: any;
  private wsHost: string | undefined;

  constructor(
    private readonly configService: ConfigService,
    @InjectPinoLogger() private readonly logger: PinoLogger,
  ) {
    this.wsHost = this.configService.get<string>('WS_HOST');

    if (!this.wsHost) {
      this.logger.warn(
        'WS_HOST not configured. WebSocket proxy will not work.',
      );
      return;
    }

    const proxyOptions = {
      target: this.wsHost,
      changeOrigin: true,
      ws: true,
      onProxyReq: (proxyReq: any, req: Request, res: Response) => {
        this.logger.debug(`Proxying HTTP request to ${this.wsHost}${req.url}`);
      },
      onProxyReqWs: (proxyReq: any, req: Request, socket: any) => {
        this.logger.debug(
          `Proxying WebSocket connection to ${this.wsHost}${req.url}`,
        );
      },
      onError: (err: Error, req: Request, res: Response) => {
        this.logger.error(`Proxy error: ${err.message}`);
        if (res && !res.headersSent) {
          res.writeHead(500, {
            'Content-Type': 'text/plain',
          });
          res.end('WebSocket proxy error');
        }
      },
      onProxyRes: (proxyRes: any, req: Request, res: Response) => {
        this.logger.debug(
          `Proxy response: ${req.url} -> ${proxyRes.statusCode}`,
        );
      },
    };

    this.proxyMiddleware = createProxyMiddleware(proxyOptions);
    this.logger.info(
      `WebSocket proxy middleware initialized for ${this.wsHost}`,
    );
  }

  use(req: Request, res: Response, next: NextFunction) {
    this.logger.info(`WebSocket proxy middleware used for ${req.url}`);
    const isWebSocketRequest =
      req.headers.upgrade === 'websocket' ||
      req.headers.connection?.toLowerCase().includes('upgrade') ||
      req.url?.includes('/socket.io/') ||
      req.url?.includes('/notifications');

    if (isWebSocketRequest && this.proxyMiddleware && this.wsHost) {
      this.logger.info(
        `Intercepting WebSocket request: ${req.url} -> ${this.wsHost}`,
      );
      return this.proxyMiddleware(req, res, next);
    }

    next();
  }
}
