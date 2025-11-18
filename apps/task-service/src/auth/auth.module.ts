import { Module } from '@nestjs/common';
import { Auth } from './entities/auth.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { initJwtModule } from '../jwt-module.config';

@Module({
    imports:  [
        TypeOrmModule.forFeature([Auth]),
        initJwtModule(),
        
    ],
    controllers: [
        AuthController
    ],
    providers: [
        AuthService
    ],
    exports: [
        AuthService
    ]
})
export class AuthModule {}
