# Bug Report - Subject Switching & Localization

## Problem 1: Switching Subject Doesn't Create New Session
**Current Behavior**:
- User selects Physics, chats for a while
- User then selects Math
- **BUG**: Previous Physics chat is still there, not a new Math session

**Expected Behavior**:
- Each subject selection should create a NEW session
- Previous subject chat should not carry over

**Root Cause**:
- SessionChatPage doesn't clear/reset session when subject changes
- URL changes but session state persists

**Files to Fix**:
- src/pages/SessionChatPage.tsx
- src/stores/sessionStore.ts

## Problem 2: Mixed Chinese/English UI
**Screenshot Issue**: Shows "HIGH_SCHOOL" instead of "高中"

**Expected**: All UI text should be in Chinese

**Files to Fix**:
- src/components/level/LevelSelector.tsx (level labels)
- src/pages/SessionChatPage.tsx (level display)
- src/stores/usePreferencesStore.ts (default level)

## Acceptance Criteria
- [ ] Selecting a new subject creates a fresh session
- [ ] Previous chat is cleared when switching subjects
- [ ] All UI shows Chinese text (高中 not HIGH_SCHOOL)
- [ ] URL reflects new subject/session correctly
