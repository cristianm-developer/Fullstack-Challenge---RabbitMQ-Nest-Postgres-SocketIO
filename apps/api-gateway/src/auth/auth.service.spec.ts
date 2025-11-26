import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ClientProxy } from '@nestjs/microservices';
import { AUTH_PATTERNS, LoginUserDto, RefreshTokenDto, RegisterUserDto, UpdateUserDto } from '@repo/types';
import { firstValueFrom, of } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  let authClient: ClientProxy;

  const mockClientProxy = {
    send: jest.fn(),
    emit: jest.fn(),
  };

  const mockAuthClient = {
    ...mockClientProxy,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: 'AUTH_CLIENT', useValue: mockAuthClient },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    authClient = module.get<ClientProxy>('AUTH_CLIENT');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should be defined', () => {
      expect(service.login).toBeDefined();
    });

    it('should call auth microservice with LOGIN_USER pattern', async () => {
      const loginDto: LoginUserDto = {
        usernameOrEmail: 'test@example.com',
        password: 'password123',
      };
      const expectedResponse = {
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresIn: '3600',
      };

      mockAuthClient.send.mockReturnValue(of(expectedResponse));

      const observable = await service.login(loginDto);
      const result = await firstValueFrom(observable);

      expect(authClient.send).toHaveBeenCalledWith(AUTH_PATTERNS.LOGIN_USER, {
        usernameOrEmail: loginDto.usernameOrEmail,
        password: loginDto.password,
      });
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('register', () => {
    it('should be defined', () => {
      expect(service.register).toBeDefined();
    });

    it('should call auth microservice with REGISTER_USER pattern', async () => {
      const registerDto: RegisterUserDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      };
      const expectedResponse = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
      };

      mockAuthClient.send.mockReturnValue(of(expectedResponse));

      const observable = await service.register(registerDto);
      const result = await firstValueFrom(observable);

      expect(authClient.send).toHaveBeenCalledWith(AUTH_PATTERNS.REGISTER_USER, {
        email: registerDto.email,
        username: registerDto.username,
        password: registerDto.password,
      });
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('findAll', () => {
    it('should be defined', () => {
      expect(service.findAll).toBeDefined();
    });

    it('should call auth microservice with FIND_ALL_USERS pattern', async () => {
      const expectedResponse = [
        { id: 1, username: 'user1' },
        { id: 2, username: 'user2' },
      ];

      mockAuthClient.send.mockReturnValue(of(expectedResponse));

      const observable = await service.findAll();
      const result = await firstValueFrom(observable);

      expect(authClient.send).toHaveBeenCalledWith(AUTH_PATTERNS.FIND_ALL_USERS, {});
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('update', () => {
    it('should be defined', () => {
      expect(service.update).toBeDefined();
    });

    it('should call auth microservice with UPDATE_USER pattern', async () => {
      const updateDto: UpdateUserDto = {
        id: 1,
        email: 'updated@example.com',
      };
      const expectedResponse = {
        id: 1,
        email: 'updated@example.com',
        username: 'testuser',
      };

      mockAuthClient.send.mockReturnValue(of(expectedResponse));

      const observable = await service.update(updateDto);
      const result = await firstValueFrom(observable);

      expect(authClient.send).toHaveBeenCalledWith(AUTH_PATTERNS.UPDATE_USER, {
        id: updateDto.id,
        email: updateDto.email,
        username: updateDto.username,
        password: updateDto.password,
      });
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('refreshToken', () => {
    it('should be defined', () => {
      expect(service.refreshToken).toBeDefined();
    });

    it('should call auth microservice with REFRESH_TOKEN pattern', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'refreshToken123',
      };
      const expectedResponse = {
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresIn: '3600',
      };
      mockAuthClient.send.mockReturnValue(of(expectedResponse));
      const observable = await service.refreshToken(refreshTokenDto);
      const result = await firstValueFrom(observable);
    });
  });
});
