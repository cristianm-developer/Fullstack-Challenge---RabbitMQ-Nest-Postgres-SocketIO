import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { NotificationMessageDto, WS_NOTIFICATIONS } from '@repo/types';

const mockNotificationsClient = {
  send: jest.fn(),
  emit: jest.fn(),
  toPromise: jest.fn(),
};

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationsService, { provide: 'NOTIFICATIONS_CLIENT', useValue: mockNotificationsClient }],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleNotification', () => {
    it('should be defined', () => {
      expect(service.handleNotification).toBeDefined();
    })

    it('should send the notification to the notifications microservice', () => {
      const notification: NotificationMessageDto = {
        message: 'voce tem um novo comentario na tarefa que voce esta participando',
        data: { url: 'test' },
        title: 'Novo comentario',
        type: 'INFO',
        userId: '1',
        event: WS_NOTIFICATIONS.taskCreated,
      };
      service.handleNotification(notification);
      expect(mockNotificationsClient.emit).toHaveBeenCalled();
    })

  })
});
