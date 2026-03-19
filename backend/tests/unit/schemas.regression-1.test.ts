// Regression: ISSUE-006 — admin role exposed in self-registration
// Found by /qa on 2026-03-19
// Report: .gstack/qa-reports/qa-report-localhost-2026-03-19.md

import { describe, expect, it } from 'vitest';
import { registerSchema } from '../../src/utils/schemas';

describe('registerSchema role restriction', () => {
  it('accepts STUDENT role', () => {
    const result = registerSchema.parse({
      email: 'a@test.com',
      password: 'password1',
      name: 'A',
      role: 'STUDENT'
    });
    expect(result.role).toBe('STUDENT');
  });

  it('accepts TEACHER role', () => {
    const result = registerSchema.parse({
      email: 'a@test.com',
      password: 'password1',
      name: 'A',
      role: 'TEACHER'
    });
    expect(result.role).toBe('TEACHER');
  });

  it('rejects ADMIN role', () => {
    expect(() =>
      registerSchema.parse({
        email: 'a@test.com',
        password: 'password1',
        name: 'A',
        role: 'ADMIN'
      })
    ).toThrow();
  });

  it('rejects GUEST role', () => {
    expect(() =>
      registerSchema.parse({
        email: 'a@test.com',
        password: 'password1',
        name: 'A',
        role: 'GUEST'
      })
    ).toThrow();
  });

  it('allows omitting role (defaults to undefined)', () => {
    const result = registerSchema.parse({
      email: 'a@test.com',
      password: 'password1',
      name: 'A'
    });
    expect(result.role).toBeUndefined();
  });
});
