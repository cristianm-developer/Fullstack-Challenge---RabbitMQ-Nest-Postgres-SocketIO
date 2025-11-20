import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [ClientsModule.registerAsync([{
    name: 'NOTIFICATIONS_CLIENT',
    imports: [ConfigModule],
    useFactory: (configService: ConfigService) => ({
        transport: Transport.RMQ,
        options: {
            urls: [configService.get<string>('RABBITMQ_URL')!],
            queue: configService.get<string>('RABBITMQ_NOTIFICATIONS_QUEUE')!,
            queueOptions: {
                durable: false,
            },
        }
        
    }),
    inject: [ConfigService],
  }])],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
