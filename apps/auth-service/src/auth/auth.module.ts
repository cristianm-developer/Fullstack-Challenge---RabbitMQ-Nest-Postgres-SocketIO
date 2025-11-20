import { Module } from '@nestjs/common';
import { Auth } from './entities/auth.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { initJwtModule } from '../jwt-module.config';
import { MicroserviceInterceptorModule, MicroserviceLoggingInterceptor, HttpToRpcInterceptor, PINO_SERVICE_NAME } from '@repo/microservice-interceptors';

const SERVICE_NAME = 'auth-service';

@Module({
    imports:  [
        TypeOrmModule.forFeature([Auth]),
        initJwtModule(),
        MicroserviceInterceptorModule.forRoot(SERVICE_NAME),
    ],
    controllers: [
        AuthController
    ],
    providers: [
        AuthService,
        {
            provide: PINO_SERVICE_NAME,
            useValue: SERVICE_NAME,
        },
        MicroserviceLoggingInterceptor,
        HttpToRpcInterceptor,
    ],
    exports: [
        AuthService
    ]
})
export class AuthModule {}
