You are implementing backend features for a Socratic Tutor application. This is an enhanced learning system with document upload and RAG capabilities.

## Project Location
/Users/gorin/Projects/socratic-tutor-app/backend

## Spec Files (READ THESE FIRST)
- /Users/gorin/Projects/socratic-tutor-app/openspec/changes/enhanced-learning/functional.md
- /Users/gorin/Projects/socratic-tutor-app/openspec/changes/enhanced-learning/specs/api-spec.md
- /Users/gorin/Projects/socratic-tutor-app/openspec/changes/enhanced-learning/design.md
- /Users/gorin/Projects/socratic-tutor-app/openspec/changes/enhanced-learning/tasks.md

## Your Implementation Tasks

### Phase 1: Database Schema
1. Read current prisma/schema.prisma
2. Add Document, Chapter, DocumentChunk models with pgvector support
3. Add BookReadingSession, BookMessage models
4. Add UserPreference model with Level enum (ELEMENTARY, MIDDLE_SCHOOL, HIGH_SCHOOL, UNIVERSITY, GRADUATE)
5. Run migration

### Phase 2: Services
1. Create src/services/documentService.ts - handle file operations
2. Create src/services/parsingService.ts - parse PDF/EPUB/DOCX/TXT
3. Create src/services/embeddingService.ts - generate embeddings via DeepSeek API
4. Create src/services/socraticConversationService.ts - Socratic dialogue with AI

### Phase 3: Controllers & Routes
1. Create documentController with upload, list, get, delete
2. Create readingController with session management and SSE streaming
3. Create preferenceController for user settings
4. Add routes to app.ts

### Phase 4: Background Jobs
1. Create documentProcessingJob.ts using bullmq
2. Implement parsing queue with retry logic

## Key Requirements
- Use TypeScript strict mode
- Write tests first (TDD)
- Test coverage > 80%
- Follow existing code patterns in src/
- Support pgvector for vector storage
- File upload limit: 50MB
- Supported formats: PDF, EPUB, DOCX, TXT

## Dependencies
npm install multer pdf-parse epub2 mammoth bullmq
npm install -D @types/multer

## Start
1. Read spec files
2. Check existing code structure
3. Implement step by step with tests
4. Commit when done

When finished, notify: openclaw system event --text "Backend implementation complete" --mode now
