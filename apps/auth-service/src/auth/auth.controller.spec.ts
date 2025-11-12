import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthResponse = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    user: {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
    },
  };

  const mockUserResponse = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    createdAt: new Date('2025-01-01'),
  };

  const mockCurrentUser = {
    id: 'user-1',
    email: 'test@example.com',
    role: 'user',
  };

  beforeEach(async () => {
    const mockAuthService = {
      signup: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      refresh: vi.fn(),
      getCurrentUser: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: vi.fn(() => true) })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('signup', () => {
    it('should create a new user', async () => {
      const signupDto = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      };

      (authService.signup as Mock).mockResolvedValue(mockAuthResponse);

      const result = await controller.signup(signupDto);

      expect(authService.signup).toHaveBeenCalledWith(signupDto);
      expect(result).toEqual(mockAuthResponse);
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      (authService.login as Mock).mockResolvedValue(mockAuthResponse);

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(mockAuthResponse);
    });
  });

  describe('logout', () => {
    it('should logout user and revoke refresh token', async () => {
      const refreshTokenDto = {
        refreshToken: 'refresh-token',
      };

      (authService.logout as Mock).mockResolvedValue(undefined);

      const result = await controller.logout(mockCurrentUser, refreshTokenDto);

      expect(authService.logout).toHaveBeenCalledWith(mockCurrentUser.id, refreshTokenDto.refreshToken);
      expect(result).toBeUndefined();
    });
  });

  describe('refresh', () => {
    it('should generate new tokens with valid refresh token', async () => {
      const refreshTokenDto = {
        refreshToken: 'valid-refresh-token',
      };

      (authService.refresh as Mock).mockResolvedValue(mockAuthResponse);

      const result = await controller.refresh(refreshTokenDto);

      expect(authService.refresh).toHaveBeenCalledWith(refreshTokenDto.refreshToken);
      expect(result).toEqual(mockAuthResponse);
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user data', async () => {
      (authService.getCurrentUser as Mock).mockResolvedValue(mockUserResponse);

      const result = await controller.getCurrentUser(mockCurrentUser);

      expect(authService.getCurrentUser).toHaveBeenCalledWith(mockCurrentUser.id);
      expect(result).toEqual(mockUserResponse);
    });
  });
});
