import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NOTIFICATION_PATTERNS, NotificationMessageDto } from '@repo/types';

@Injectable()
export class NotificationsService {
    constructor(
        @Inject('NOTIFICATIONS_CLIENT')
        private readonly notificationsClient: ClientProxy,
    ){}

    handleNotification(notification: NotificationMessageDto) {
        this.notificationsClient.emit(NOTIFICATION_PATTERNS.HANDLE_NOTIFICATION, notification);
    }
}
