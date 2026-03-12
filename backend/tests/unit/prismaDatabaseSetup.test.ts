import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const backendRoot = path.resolve(__dirname, '..', '..');
const repoRoot = path.resolve(backendRoot, '..');

const read = (...segments: string[]) => readFileSync(path.join(...segments), 'utf8');

describe('database setup', () => {
  it('declares the enhanced learning models in Prisma schema', () => {
    const schema = read(backendRoot, 'prisma', 'schema.prisma');

    expect(schema).toContain('model Document {');
    expect(schema).toContain('model Chapter {');
    expect(schema).toContain('model DocumentChunk {');
    expect(schema).toContain('model BookReadingSession {');
    expect(schema).toContain('model BookMessage {');
    expect(schema).toContain('model UserPreference {');
    expect(schema).toContain('embedding  Unsupported("vector(1536)")?');
    expect(schema).toContain('enum Level {');
  });

  it('creates pgvector extension and enhanced learning tables in migration SQL', () => {
    const migration = read(
      backendRoot,
      'prisma',
      'migrations',
      '20260307102000_enhanced_learning',
      'migration.sql'
    );

    expect(migration).toContain('CREATE EXTENSION IF NOT EXISTS vector;');
    expect(migration).toContain('CREATE TABLE "Document"');
    expect(migration).toContain('CREATE TABLE "Chapter"');
    expect(migration).toContain('CREATE TABLE "DocumentChunk"');
    expect(migration).toContain('"embedding" vector(1536)');
    expect(migration).toContain('USING ivfflat ("embedding" vector_cosine_ops)');
    expect(migration).toContain('CREATE TABLE "BookReadingSession"');
    expect(migration).toContain('CREATE TABLE "BookMessage"');
    expect(migration).toContain('CREATE TABLE "UserPreference"');
  });

  it('uses a pgvector-enabled Postgres image in compose environments', () => {
    const composeFiles = ['docker-compose.yml', 'docker-compose.dev.yml'];

    for (const file of composeFiles) {
      const compose = read(repoRoot, file);
      expect(compose).toContain('image: pgvector/pgvector:pg16');
    }
  });
});
