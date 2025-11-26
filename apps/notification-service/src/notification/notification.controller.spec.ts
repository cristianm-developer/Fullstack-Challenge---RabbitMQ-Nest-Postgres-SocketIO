import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationMessageDto, WS_NOTIFICATIONS } from '@repo/types';
import { MicroserviceInterceptorModule } from '@repo/microservice-interceptors';
import { LoggerModule } from 'pino-nestjs';

const mockNotificationService = {
  handleNotification: jest.fn(),
};

describe('NotificationController', () => {
  let controller: NotificationController;
  let notificationService: NotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ 
        LoggerModule.forRoot(),
        MicroserviceInterceptorModule.forRoot('notification-service')
      ],
      controllers: [NotificationController],
      providers: [
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    controller = module.get<NotificationController>(NotificationController);
    notificationService = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handleNotification', () => {

    it('should be defined', () => {
      expect(controller.handleNotification).toBeDefined();
    })

    it('should handle the notification', async () => {
      const notification: NotificationMessageDto = {
        message: 'voce tem um novo comentario na tarefa que voce esta participando',
        data: { url: 'test' },
        event: WS_NOTIFICATIONS.commentNew,
        title: 'Novo comentario',
        type: 'INFO',
        userIds: ['1'],
      };
      await controller.handleNotification(notification);
      expect(notificationService.handleNotification).toHaveBeenCalled();
    })
  })
});
