import { Controller, Logger, UseInterceptors } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NOTIFICATION_PATTERNS, NotificationMessageDto } from '@repo/types';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { HttpToRpcInterceptor, MicroserviceLoggingInterceptor } from '@repo/microservice-interceptors';


@UseInterceptors(MicroserviceLoggingInterceptor, HttpToRpcInterceptor)
@Controller()
export class NotificationController {

    private readonly logger = new Logger(NotificationController.name);

    constructor(
        private readonly notificationService: NotificationService
    ) {}

    @MessagePattern(NOTIFICATION_PATTERNS.HANDLE_NOTIFICATION)
    async handleNotification(@Payload() payload: NotificationMessageDto){
        this.logger.log(`Receiving notification: ${JSON.stringify(payload)}`);
        this.notificationService.handleNotification(payload);
    }

}
