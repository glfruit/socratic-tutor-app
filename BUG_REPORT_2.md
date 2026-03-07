# Critical Bug Report - Production Issues

## Bug 1: Login Page Input Still Black Background
**Current State**: 
- LoginPage has `className="light"` on root div
- Input has `forceLight` prop
- BUT background still appears black to user

**Root Cause Suspected**:
- `dark` class on <html> element may be overriding `light` class
- Tailwind dark mode strategy interfering
- Need to force light mode at html/body level for auth pages

**Required Fix**:
- Use `useEffect` to remove `dark` class from document.documentElement on auth pages
- OR use CSS to force light theme for auth pages
- Ensure input background is white/light, text is dark

## Bug 2: AI Dialogue Not Working - Still Mock Response
**Current State**:
- Frontend calls API
- Backend has MessageService + AIService implemented
- BUT user still sees: "如果从已知条件出发，你会如何拆解xxxx"

**Diagnostic Steps Needed**:
1. Check if frontend API call actually reaches backend
2. Check backend logs for errors
3. Check if DEEPSEEK_API_KEY is set in environment
4. Check if AIService throws error and falls back
5. Add comprehensive logging

**Implementation Gaps to Check**:
- Is `sessionService.sendMessage` calling real API or mock?
- Is backend `/sessions/:id/messages` endpoint working?
- Is AIService properly instantiated in container?
- Are environment variables loaded?

## Acceptance Criteria
- [ ] Login inputs clearly visible (white bg, dark text)
- [ ] Real AI dialogue works with contextual Socratic questions
- [ ] Error messages shown if AI fails (not silent mock fallback)
- [ ] Console/network tab shows actual API calls

## Files to Investigate
Frontend:
- src/pages/LoginPage.tsx
- src/pages/RegisterPage.tsx
- src/components/common/Input.tsx
- src/services/sessionService.ts
- src/stores/sessionStore.ts

Backend:
- backend/src/services/messageService.ts
- backend/src/services/aiService.ts
- backend/src/config/container.ts
- backend/src/config/env.ts
- backend/.env

Priority: CRITICAL
