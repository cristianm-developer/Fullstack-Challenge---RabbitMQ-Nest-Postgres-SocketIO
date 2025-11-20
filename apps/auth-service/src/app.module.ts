import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { initPostgresql } from './posgresql.config';
import { initMicroserviceHealth } from './microservice-health.config';
import { LoggerModule } from 'pino-nestjs';
import { MicroserviceInterceptorModule } from '@repo/microservice-interceptors';

const SERVICE_NAME = 'auth-service';
const isProduction = process.env.NODE_ENV === 'production';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: isProduction ? undefined : '.env.example',
    }),
    MicroserviceInterceptorModule.forRoot(SERVICE_NAME),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: isProduction ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            singleLine: false,
            translateTime: 'SYS:standard',
          }
        }: undefined,
        base: { serviceName: SERVICE_NAME },
        level: isProduction ? 'info' : 'debug',
      } 
    }),
    initMicroserviceHealth(),
    initPostgresql(),
    AuthModule
  ],
  controllers: [],
  providers: [

  ],
  exports: [

  ]
})
export class AppModule {}
