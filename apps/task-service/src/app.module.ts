import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { initPostgresql } from './posgresql.config';
import { initMicroserviceHealth } from './microservice-health.config';
import { TasksModule } from './tasks/tasks.module';
import { CommentsModule } from './comments/comments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MicroserviceInterceptorModule } from '@repo/microservice-interceptors';

const SERVICE_NAME = 'task-service';
const isProduction = process.env.NODE_ENV === 'production';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: isProduction ? undefined : '.env.example',
    }),
    initMicroserviceHealth(),
    initPostgresql(),
    MicroserviceInterceptorModule.forRoot(SERVICE_NAME),
    TasksModule,
    CommentsModule,
    NotificationsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
