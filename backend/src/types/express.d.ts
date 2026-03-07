import { Role } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: Role;
      };
      file?: {
        originalname: string;
        mimetype: string;
        size: number;
        buffer: Buffer;
        path?: string;
      };
    }
  }
}

export {};
