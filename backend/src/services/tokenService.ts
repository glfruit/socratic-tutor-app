import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthTokens, JwtPayload } from '../types';

export class TokenService {
  generateTokens(payload: JwtPayload): AuthTokens {
    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.ACCESS_TOKEN_TTL as jwt.SignOptions['expiresIn']
    });
    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.REFRESH_TOKEN_TTL as jwt.SignOptions['expiresIn']
    });

    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  }

  verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
  }
}
