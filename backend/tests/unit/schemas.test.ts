import { MasteryLevel } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import {
  learningRecordSchema,
  loginSchema,
  messageSchema,
  oauthSchema,
  refreshSchema,
  registerSchema,
  sessionCreateSchema,
  sessionUpdateSchema
} from '../../src/utils/schemas';

describe('schemas', () => {
  it('parses register/login payloads', () => {
    expect(registerSchema.parse({ email: 'a@test.com', password: 'password1', name: 'A' }).email).toBe(
      'a@test.com'
    );
    expect(loginSchema.parse({ email: 'a@test.com', password: 'password1' }).email).toBe('a@test.com');
  });

  it('parses session/message payloads', () => {
    expect(sessionCreateSchema.parse({ subject: 'math', title: 'x' }).subject).toBe('math');
    expect(sessionUpdateSchema.parse({ title: 'new' }).title).toBe('new');
    expect(messageSchema.parse({ content: 'hello' }).content).toBe('hello');
  });

  it('parses progress/oauth/refresh payloads', () => {
    expect(learningRecordSchema.parse({ concept: 'fractions', masteryLevel: MasteryLevel.MASTERY }).concept).toBe(
      'fractions'
    );
    expect(oauthSchema.parse({ accessToken: 'token' }).accessToken).toBe('token');
    expect(refreshSchema.parse({ refreshToken: 'rt' }).refreshToken).toBe('rt');
  });
});
