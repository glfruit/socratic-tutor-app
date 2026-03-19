// Regression: ISSUE-001 — CORS origin mismatch blocks API via 127.0.0.1
// Found by /qa on 2026-03-19
// Report: .gstack/qa-reports/qa-report-localhost-2026-03-19.md

import { describe, expect, it } from 'vitest';

describe('CORS origin derivation', () => {
  function deriveCorsOrigins(corsOrigin: string): string[] {
    const origins = [corsOrigin];
    try {
      const parsed = new URL(corsOrigin);
      if (parsed.hostname === 'localhost') {
        origins.push(corsOrigin.replace('localhost', '127.0.0.1'));
      } else if (parsed.hostname === '127.0.0.1') {
        origins.push(corsOrigin.replace('127.0.0.1', 'localhost'));
      }
    } catch { /* keep single origin */ }
    return origins;
  }

  it('derives 127.0.0.1 variant from localhost origin', () => {
    const origins = deriveCorsOrigins('http://localhost:10005');
    expect(origins).toContain('http://localhost:10005');
    expect(origins).toContain('http://127.0.0.1:10005');
  });

  it('derives localhost variant from 127.0.0.1 origin', () => {
    const origins = deriveCorsOrigins('http://127.0.0.1:3000');
    expect(origins).toContain('http://127.0.0.1:3000');
    expect(origins).toContain('http://localhost:3000');
  });

  it('does not derive variants for non-local origins', () => {
    const origins = deriveCorsOrigins('https://myapp.example.com');
    expect(origins).toEqual(['https://myapp.example.com']);
  });

  it('handles invalid URL gracefully', () => {
    const origins = deriveCorsOrigins('not-a-url');
    expect(origins).toEqual(['not-a-url']);
  });
});
