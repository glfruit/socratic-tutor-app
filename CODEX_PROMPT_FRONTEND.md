You are implementing frontend features for a Socratic Tutor application. This is an enhanced learning system with document upload, ebook reading, and Socratic dialogue.

## Project Location
/Users/gorin/Projects/socratic-tutor-app

## Spec Files (READ THESE FIRST)
- /Users/gorin/Projects/socratic-tutor-app/openspec/changes/enhanced-learning/functional.md
- /Users/gorin/Projects/socratic-tutor-app/openspec/changes/enhanced-learning/specs/api-spec.md
- /Users/gorin/Projects/socratic-tutor-app/openspec/changes/enhanced-learning/design.md
- /Users/gorin/Projects/socratic-tutor-app/openspec/changes/enhanced-learning/tasks.md

## Your Implementation Tasks

### Phase 1: Main Entry Redesign
1. Create src/pages/HomeSelectionPage.tsx - Two cards: Study & Read
2. Create src/components/home/ModeCard.tsx - Large clickable card with icon
3. Create src/components/home/StatsPanel.tsx - Show user statistics
4. Update routing: Login -> HomeSelection instead of Dashboard

### Phase 2: Document Upload
1. Create src/components/upload/FileUpload.tsx - Drag & drop upload
2. Create src/components/upload/UploadProgress.tsx - Progress bar
3. Create src/components/upload/DocumentForm.tsx - Metadata editing
4. Create src/pages/UploadPage.tsx
5. Install: npm install react-dropzone

### Phase 3: Document Library
1. Create src/pages/DocumentLibraryPage.tsx
2. Create src/components/documents/DocumentCard.tsx
3. Create src/components/documents/DocumentList.tsx
4. Implement filters (type, status) and search

### Phase 4: E-book Reader
1. Create src/pages/BookReaderPage.tsx - Three-panel layout
2. Create src/components/reader/ChapterSidebar.tsx - Chapter list
3. Create src/components/reader/ReadingArea.tsx - Text display
4. Create src/components/reader/AIChatPanel.tsx - Socratic dialogue
5. Create src/components/reader/TextSelectionToolbar.tsx - Highlight/ask
6. Implement SSE streaming for AI responses

### Phase 5: Level Selection
1. Create src/components/level/LevelSelector.tsx - 5 levels
2. Create src/components/level/LevelCard.tsx
3. Integrate into study flow
4. Create settings page for default level

### Phase 6: State Management
1. Create src/stores/useDocumentsStore.ts (Zustand)
2. Create src/stores/useReadingStore.ts
3. Create src/stores/usePreferencesStore.ts
4. Update API services in src/services/

## Key Requirements
- React + TypeScript + Vite + TailwindCSS
- Use existing component patterns (check src/components/common/)
- Write tests (React Testing Library)
- Follow existing UI design system
- Support dark/light mode
- Responsive design

## API Base URL
http://localhost:10003/api/v2 (use VITE_API_URL env)

## Start
1. Read spec files
2. Check existing code in src/
3. Implement step by step
4. Run npm run test to verify
5. Commit when done

When finished, notify: openclaw system event --text "Frontend implementation complete" --mode now
