CREATE EXTENSION IF NOT EXISTS vector;

CREATE TYPE "DocumentType" AS ENUM ('BOOK', 'MATERIAL');
CREATE TYPE "DocumentStatus" AS ENUM ('PROCESSING', 'READY', 'ERROR');
CREATE TYPE "ReadingSessionStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ARCHIVED');
CREATE TYPE "BookMessageRole" AS ENUM ('USER', 'ASSISTANT');
CREATE TYPE "Level" AS ENUM ('ELEMENTARY', 'MIDDLE_SCHOOL', 'HIGH_SCHOOL', 'UNIVERSITY', 'GRADUATE');

CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PROCESSING',
    "title" TEXT NOT NULL,
    "author" TEXT,
    "description" TEXT,
    "originalName" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "coverUrl" TEXT,
    "errorMessage" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Chapter" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "startPage" INTEGER,
    "endPage" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chapter_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DocumentChunk" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "chapterId" TEXT,
    "content" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "tokenCount" INTEGER,
    "metadata" JSONB,
    "embedding" vector(1536),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentChunk_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BookReadingSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "currentChapterId" TEXT,
    "status" "ReadingSessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookReadingSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BookMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" "BookMessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "level" "Level" NOT NULL DEFAULT 'HIGH_SCHOOL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserPreference_userId_key" ON "UserPreference"("userId");
CREATE INDEX "Document_userId_type_idx" ON "Document"("userId", "type");
CREATE INDEX "Document_status_idx" ON "Document"("status");
CREATE INDEX "Chapter_documentId_orderIndex_idx" ON "Chapter"("documentId", "orderIndex");
CREATE INDEX "DocumentChunk_documentId_idx" ON "DocumentChunk"("documentId");
CREATE INDEX "DocumentChunk_chapterId_idx" ON "DocumentChunk"("chapterId");
CREATE INDEX "BookReadingSession_userId_status_idx" ON "BookReadingSession"("userId", "status");
CREATE INDEX "BookMessage_sessionId_createdAt_idx" ON "BookMessage"("sessionId", "createdAt");
CREATE INDEX "DocumentChunk_embedding_idx"
ON "DocumentChunk" USING ivfflat ("embedding" vector_cosine_ops)
WITH (lists = 100);

ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DocumentChunk" ADD CONSTRAINT "DocumentChunk_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DocumentChunk" ADD CONSTRAINT "DocumentChunk_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BookReadingSession" ADD CONSTRAINT "BookReadingSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BookReadingSession" ADD CONSTRAINT "BookReadingSession_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BookReadingSession" ADD CONSTRAINT "BookReadingSession_currentChapterId_fkey" FOREIGN KEY ("currentChapterId") REFERENCES "Chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BookMessage" ADD CONSTRAINT "BookMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "BookReadingSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
