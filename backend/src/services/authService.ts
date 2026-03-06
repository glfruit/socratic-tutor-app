import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { PrismaLike } from '../config/prisma';
import { RedisLike } from '../config/redis';
import { AppError } from '../utils/appError';
import { TokenService } from './tokenService';

interface RegisterInput {
  email: string;
  password: string;
  name: string;
  role?: Role;
}

interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  constructor(
    private readonly prisma: PrismaLike,
    private readonly redis: RedisLike,
    private readonly tokenService: TokenService = new TokenService()
  ) {}

  async register(input: RegisterInput) {
    const existing = await this.prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new AppError('Email already registered', 409);
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        name: input.name,
        role: input.role ?? Role.STUDENT
      }
    });

    const tokens = this.tokenService.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    await this.redis.set(this.refreshKey(user.id), tokens.refreshToken, 'EX', 60 * 60 * 24 * 7);

    return {
      user: this.publicUser(user),
      tokens
    };
  }

  async login(input: LoginInput) {
    const user = await this.prisma.user.findUnique({ where: { email: input.email } });
    if (!user?.passwordHash) {
      throw new AppError('Invalid credentials', 401);
    }

    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) {
      throw new AppError('Invalid credentials', 401);
    }

    const tokens = this.tokenService.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    await this.redis.set(this.refreshKey(user.id), tokens.refreshToken, 'EX', 60 * 60 * 24 * 7);

    return {
      user: this.publicUser(user),
      tokens
    };
  }

  async refresh(refreshToken: string) {
    const payload = this.tokenService.verifyRefreshToken(refreshToken);
    const cached = await this.redis.get(this.refreshKey(payload.userId));

    if (!cached || cached !== refreshToken) {
      throw new AppError('Invalid refresh token', 401);
    }

    const tokens = this.tokenService.generateTokens(payload);
    await this.redis.set(this.refreshKey(payload.userId), tokens.refreshToken, 'EX', 60 * 60 * 24 * 7);
    return tokens;
  }

  async oauthLogin(profile: { email: string; name: string }) {
    let user = await this.prisma.user.findUnique({ where: { email: profile.email } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          role: Role.STUDENT
        }
      });
    }

    const tokens = this.tokenService.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    await this.redis.set(this.refreshKey(user.id), tokens.refreshToken, 'EX', 60 * 60 * 24 * 7);

    return {
      user: this.publicUser(user),
      tokens
    };
  }

  private publicUser(user: { id: string; email: string; name: string; role: Role }) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };
  }

  private refreshKey(userId: string): string {
    return `socratic:refresh:${userId}`;
  }
}
