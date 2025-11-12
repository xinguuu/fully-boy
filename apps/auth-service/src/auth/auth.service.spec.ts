import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

vi.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let redisService: RedisService;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    name: 'Test User',
    role: 'user',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
    };

    const mockJwtService = {
      sign: vi.fn(),
      verify: vi.fn(),
    };

    const mockRedisService = {
      set: vi.fn(),
      get: vi.fn(),
      del: vi.fn(),
      exists: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get(PrismaService);
    jwtService = module.get(JwtService);
    redisService = module.get(RedisService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('signup', () => {
    it('should create a new user and return auth tokens', async () => {
      const signupDto = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      };

      (prismaService.user.findUnique as Mock).mockResolvedValue(null);
      (prismaService.user.create as Mock).mockResolvedValue(mockUser);
      (bcrypt.hash as Mock).mockResolvedValue('hashed-password');
      (jwtService.sign as Mock).mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');
      (redisService.set as Mock).mockResolvedValue('OK');

      const result = await service.signup(signupDto);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: signupDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(signupDto.password, 10);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: signupDto.email,
          passwordHash: 'hashed-password',
          name: signupDto.name,
        },
      });
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
        },
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      const signupDto = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test User',
      };

      (prismaService.user.findUnique as Mock).mockResolvedValue(mockUser);

      await expect(service.signup(signupDto)).rejects.toThrow(ConflictException);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: signupDto.email },
      });
      expect(prismaService.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      (prismaService.user.findUnique as Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as Mock).mockResolvedValue(true);
      (jwtService.sign as Mock).mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');
      (redisService.set as Mock).mockResolvedValue('OK');

      const result = await service.login(loginDto);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.passwordHash);
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
        },
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const loginDto = {
        email: 'notfound@example.com',
        password: 'password123',
      };

      (prismaService.user.findUnique as Mock).mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      (prismaService.user.findUnique as Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.passwordHash);
    });
  });

  describe('logout', () => {
    it('should delete refresh token from Redis', async () => {
      const userId = 'user-1';
      const refreshToken = 'refresh-token';

      (redisService.del as Mock).mockResolvedValue(1);

      await service.logout(userId, refreshToken);

      expect(redisService.del).toHaveBeenCalledWith(`refresh_token:${userId}:${refreshToken}`);
    });
  });

  describe('refresh', () => {
    it('should generate new tokens with valid refresh token', async () => {
      const refreshToken = 'valid-refresh-token';
      const payload = { sub: 'user-1', email: 'test@example.com', role: 'user' };

      (jwtService.verify as Mock).mockReturnValue(payload);
      (redisService.exists as Mock).mockResolvedValue(1);
      (prismaService.user.findUnique as Mock).mockResolvedValue(mockUser);
      (jwtService.sign as Mock).mockReturnValueOnce('new-access-token').mockReturnValueOnce('new-refresh-token');
      (redisService.del as Mock).mockResolvedValue(1);
      (redisService.set as Mock).mockResolvedValue('OK');

      const result = await service.refresh(refreshToken);

      expect(jwtService.verify).toHaveBeenCalledWith(refreshToken, {
        secret: 'test-refresh-secret',
      });
      expect(redisService.exists).toHaveBeenCalledWith(`refresh_token:${payload.sub}:${refreshToken}`);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { id: payload.sub } });
      expect(redisService.del).toHaveBeenCalledWith(`refresh_token:${payload.sub}:${refreshToken}`);
      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
        },
      });
    });

    it('should throw UnauthorizedException if refresh token not found in Redis', async () => {
      const refreshToken = 'invalid-refresh-token';
      const payload = { sub: 'user-1', email: 'test@example.com', role: 'user' };

      (jwtService.verify as Mock).mockReturnValue(payload);
      (redisService.exists as Mock).mockResolvedValue(0);

      await expect(service.refresh(refreshToken)).rejects.toThrow(UnauthorizedException);
      expect(prismaService.user.findUnique).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const refreshToken = 'valid-refresh-token';
      const payload = { sub: 'user-1', email: 'test@example.com', role: 'user' };

      (jwtService.verify as Mock).mockReturnValue(payload);
      (redisService.exists as Mock).mockResolvedValue(1);
      (prismaService.user.findUnique as Mock).mockResolvedValue(null);

      await expect(service.refresh(refreshToken)).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if JWT verification fails', async () => {
      const refreshToken = 'invalid-jwt-token';

      (jwtService.verify as Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refresh(refreshToken)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getCurrentUser', () => {
    it('should return user data by ID', async () => {
      const userId = 'user-1';

      (prismaService.user.findUnique as Mock).mockResolvedValue(mockUser);

      const result = await service.getCurrentUser(userId);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        createdAt: mockUser.createdAt,
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = 'nonexistent-user';

      (prismaService.user.findUnique as Mock).mockResolvedValue(null);

      await expect(service.getCurrentUser(userId)).rejects.toThrow(NotFoundException);
    });
  });
});
