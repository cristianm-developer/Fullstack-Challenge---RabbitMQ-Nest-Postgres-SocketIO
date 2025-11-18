import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  login: jest.fn()
}

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call the auth service login method and return a JWT if the user exists', async () => {
      mockAuthService.login.mockResolvedValue({
        accessToken: 'test',
        refreshToken: 'test',
        expiresIn: '15m',
      });
      const result = await controller.login({ usernameOrEmail: 'test@test.com', password: 'test' });
      expect(result).toBeDefined();
      expect(authService.login).toHaveBeenCalledWith({ usernameOrEmail: 'test@test.com', password: 'test' });
    });

    it('should throw an error if the auth service login method throws an error', async () => {
      mockAuthService.login.mockRejectedValue(new Error('Error'));
      await expect(controller.login({ usernameOrEmail: 'test@test.com', password: 'test' })).rejects.toThrow(Error);
      expect(authService.login).toHaveBeenCalledWith({ usernameOrEmail: 'test@test.com', password: 'test' });
    });
    
  });
});
