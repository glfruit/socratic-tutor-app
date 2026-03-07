# Bug Report - Subject Switching Still Not Working

## Problem
When user switches from one subject to another, the previous conversation is still displayed.

**Steps to Reproduce**:
1. Go to Subjects page
2. Select "物理" (Physics) - enters SessionChatPage with subject=物理
3. Send some messages - conversation appears
4. Click back to Subjects
5. Select "数学" (Math) - enters SessionChatPage with subject=数学
6. **BUG**: Previous Physics messages are still showing!

**Current Code Analysis**:
- SessionChatPage.tsx has useEffect to detect subject change
- It calls resetSession() when subject changes
- But messages persist in the UI

**Root Cause Suspected**:
1. resetSession() may not be clearing messages properly
2. Or the useEffect logic has timing issues
3. Or Zustand state persists across navigation

**Required Fix**:
1. Ensure resetSession() truly clears messages array
2. Add explicit messages clearing when subject changes
3. Force component re-mount or state reset
4. Add console logs to verify the reset is happening

**Files to Fix**:
- src/stores/sessionStore.ts (resetSession function)
- src/pages/SessionChatPage.tsx (subject change detection)

**Testing Verification**:
- [ ] Switch from Physics to Math
- [ ] Physics messages should NOT appear
- [ ] Math chat should start fresh (empty or with welcome message)
- [ ] Console should show "resetting session" or similar log
