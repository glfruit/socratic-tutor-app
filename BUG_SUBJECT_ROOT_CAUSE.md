# Critical Bug - Subject Switching Logic Error

## Problem Analysis
From user console logs:
```
[SessionChatPage] Entered fresh session route, resetting session
[sessionStore] Resetting session {loadRequestId: 8}
[sessionStore] Loading session {sessionId: 'e15902f6...', requestId: 9}  ← BUG!
```

The session is reset, but then immediately loads old session again.

## Root Cause
SessionChatPage has this useEffect:
```javascript
useEffect(() => {
  if (id && id !== "new") {
    void loadSession(id);  // ← Loads old session when id is not "new"
    return;
  }
  resetSession();
}, [id, loadSession, resetSession]);
```

When user:
1. Clicks "化学" in SubjectsPage → navigates to `/sessions/new?subject=化学` ✓
2. Chat happens, URL becomes `/sessions/e15902f6...?subject=化学`
3. User clicks back → `/subjects`
4. User clicks "数学" → SubjectsPage navigates to `/sessions/new?subject=数学` ✓
5. BUT SessionChatPage sees id="new", calls resetSession()
6. THEN another effect runs and navigates to `/sessions/e15902f6...?subject=数学` (with OLD session ID!)
7. useEffect sees id is not "new", loads OLD session messages

## The Real Problem
The `useEffect` that navigates from `/sessions/new` to `/sessions/${currentSessionId}` is running when subject changes:
```javascript
useEffect(() => {
  if (id === "new" && currentSessionId) {
    navigate(`/sessions/${currentSessionId}?subject=...`)  // ← Keeps using old currentSessionId!
  }
}, [currentSessionId, ...]);
```

When subject changes, `currentSessionId` is still the OLD session ID from previous subject.

## Required Fix
1. When subject changes, clear currentSessionId BEFORE any navigation happens
2. Only navigate to `/sessions/${id}` after confirming the session belongs to current subject
3. Add subject validation before loading session

## Files to Fix
- src/pages/SessionChatPage.tsx
- src/stores/sessionStore.ts

## Acceptance Criteria
- [ ] Switching subject creates completely fresh session
- [ ] Old messages never appear when switching subjects
- [ ] URL correctly shows `/sessions/new` then new session ID
