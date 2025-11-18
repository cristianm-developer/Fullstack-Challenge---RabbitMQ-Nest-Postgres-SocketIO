import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { initPostgresql } from './posgresql.config';
import { MicroserviceLoggingModule } from '@repo/microservice-logging-module';
import { initMicroserviceHealth } from './microservice-health.config';
import { TasksModule } from './tasks/tasks.module';

const SERVICE_NAME = 'auth-service';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.example',
    }),
    MicroserviceLoggingModule.forRoot(SERVICE_NAME),
    initMicroserviceHealth(),
    initPostgresql(),
    AuthModule,
    TasksModule
  ],
  controllers: [],
  providers: [],
  exports: [

  ]
})
export class AppModule {}
