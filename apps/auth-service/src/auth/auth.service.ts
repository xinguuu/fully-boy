import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { SignupDto, LoginDto, AuthResponse, UserResponse } from './dto/auth.dto';
import { REDIS_KEYS, REDIS_TTL, TOKEN_CONFIG } from '@xingu/shared';

@Injectable()
export class AuthService {
  private readonly refreshSecret: string;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private redis: RedisService,
  ) {
    // Validate JWT_REFRESH_SECRET in production
    if (process.env.NODE_ENV === 'production' && !process.env.JWT_REFRESH_SECRET) {
      throw new Error('JWT_REFRESH_SECRET must be set in production environment');
    }

    // Use environment variable or fallback for development only
    this.refreshSecret = process.env.JWT_REFRESH_SECRET || 'xingu-refresh-secret-dev-only';

    // Warn if using fallback in development
    if (!process.env.JWT_REFRESH_SECRET && process.env.NODE_ENV !== 'production') {
      console.warn('⚠️  WARNING: Using default JWT_REFRESH_SECRET. Set JWT_REFRESH_SECRET in .env for production!');
    }
  }

  async signup(dto: SignupDto): Promise<AuthResponse> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, TOKEN_CONFIG.BCRYPT_SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
      },
    });

    return this.generateTokens(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    const key = REDIS_KEYS.REFRESH_TOKEN(userId, refreshToken);
    await this.redis.del(key);
  }

  async refresh(refreshToken: string): Promise<AuthResponse> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.refreshSecret,
      });

      const key = REDIS_KEYS.REFRESH_TOKEN(payload.sub, refreshToken);
      const exists = await this.redis.exists(key);

      if (!exists) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      await this.redis.del(key);

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getCurrentUser(userId: string): Promise<UserResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  private async generateTokens(user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
  }): Promise<AuthResponse> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.refreshSecret,
      expiresIn: TOKEN_CONFIG.REFRESH_TOKEN_EXPIRY,
    });

    const key = REDIS_KEYS.REFRESH_TOKEN(user.id, refreshToken);
    await this.redis.set(key, '1', REDIS_TTL.REFRESH_TOKEN);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}
