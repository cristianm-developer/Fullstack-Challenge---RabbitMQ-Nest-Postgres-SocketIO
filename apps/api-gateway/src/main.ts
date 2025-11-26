import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WebSocketProxyMiddleware } from './websocket-proxy.middleware';
import { RpcExceptionFilter } from './common/filters/rpc-exception.filter';
import { createProxyMiddleware } from 'http-proxy-middleware';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const HTTP_PORT = configService.get<number>('PORT') || 3000;
  let wsHost = configService.get<string>('WS_HOST');
  
  logger.log(`WS_HOST from config: ${wsHost}`);
  
  if (wsHost) {
    wsHost = wsHost.replace(/_/g, '-');
    
    if (!wsHost.startsWith('http://') && !wsHost.startsWith('https://')) {
      wsHost = `http://${wsHost}:${HTTP_PORT}`;
      logger.log(`WS_HOST normalized to: ${wsHost}`);
    }
  }

  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN') || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalFilters(new RpcExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('API Gateway - Jungle Gaming Challenge')
    .setDescription(
      'Documentação da API Gateway com endpoints de autenticação e gerenciamento de tarefas',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Digite o token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Autenticação', 'Endpoints relacionados à autenticação de usuários')
    .addTag('Tarefas', 'Endpoints relacionados ao gerenciamento de tarefas')
    .addTag(
      'Saúde',
      'Endpoints relacionados à verificação de saúde do sistema e serviços',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
  
  const httpServer = app.getHttpServer();
  
  let wsProxy: any = null;
  if (wsHost) {
    wsProxy = createProxyMiddleware({
      target: wsHost,
      changeOrigin: true,
      ws: true,
      pathRewrite: (path, req) => {
        const rewritten = path.replace(/^\/notifications/, '/socket.io');
        logger.debug(`Path rewrite: ${path} -> ${rewritten}`);
        return rewritten;
      },
      onProxyReq: (proxyReq, req, res) => {
        logger.debug(`Proxying HTTP request: ${req.url} -> ${wsHost}${req.url}`);
        logger.debug(`Request headers: ${JSON.stringify(req.headers)}`);
        if (req.headers.authorization) {
          proxyReq.setHeader('Authorization', req.headers.authorization);
          logger.debug(`Preserved Authorization header`);
        }
        if (req.url && req.url.includes('EIO=')) {
          logger.debug(`Socket.IO handshake request detected`);
        }
      },
      onProxyReqWs: (proxyReq, req, socket) => {
        logger.log(`Proxying WebSocket upgrade: ${req.url} -> ${wsHost}/socket.io`);
        logger.debug(`Request headers: ${JSON.stringify(req.headers)}`);
        if (req.headers.authorization) {
          proxyReq.setHeader('Authorization', req.headers.authorization);
        }
      },
      onError: (err, req, res) => {
        logger.error(`Proxy error: ${err.message}`);
        logger.error(`Proxy error stack: ${err.stack}`);
        if (res && !res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('WebSocket proxy error');
        }
      },
      onProxyError: (err, req, res) => {
        logger.error(`Proxy connection error: ${err.message}`);
        logger.error(`Failed to connect to ${wsHost}`);
        logger.error(`Error code: ${(err as any).code}`);
        logger.error(`Error stack: ${err.stack}`);
      },
    } as any);
    
    app.use('/notifications', wsProxy);
    
    httpServer.on('upgrade', (req, socket, head) => {
      if (req.url && req.url.includes('/notifications')) {
        logger.log(`WebSocket upgrade request received: ${req.url}`);
        logger.log(`Proxying to: ${wsHost}/socket.io`);
        
        socket.on('error', (error) => {
          logger.error(`Socket error during upgrade: ${error.message}`);
          logger.error(`Socket error code: ${(error as any).code}`);
        });
        
        socket.on('close', () => {
          logger.debug(`Socket closed during upgrade`);
        });
        
        try {
          wsProxy.upgrade(req, socket, head);
        } catch (error) {
          logger.error(`Error in WebSocket upgrade: ${error}`);
          logger.error(`Error stack: ${error instanceof Error ? error.stack : 'No stack'}`);
          socket.destroy();
        }
      }
    });
    
    httpServer.on('error', (error) => {
      logger.error(`HTTP server error: ${error.message}`);
    });
  
    logger.log(`WebSocket proxy configured to forward to: ${wsHost}`);
    logger.log(`WebSocket requests to /notifications will be proxied to ${wsHost}/socket.io`);
  } else {
    logger.warn('WS_HOST not configured. WebSocket proxy is disabled.');
  }
  
  const server = await app.listen(process.env.PORT ?? 3000);

  logger.log(`API Gateway is running on port ${HTTP_PORT}`);
  logger.log(
    `Swagger documentation available at http://localhost:${HTTP_PORT}/api/docs`,
  );
}
bootstrap();
