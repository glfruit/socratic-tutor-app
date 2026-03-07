# Critical Bug Report - Socratic Tutor

## Bug 1: Login Page Input Background is Black
**Location**: `src/components/common/Input.tsx`, `src/pages/LoginPage.tsx`
**Problem**: 
- Input has `dark:bg-slate-900` which makes background black in dark mode
- Login page doesn't enforce light theme
- Input appears with black background which is ugly
**Expected**: Clean white/light background for login/register inputs

**Fix Options**:
1. Force light theme on Login/Register pages by adding `className="light"` to root element
2. Or override dark mode styles specifically for auth pages
3. Or remove dark mode support from auth pages entirely

## Bug 2: Socratic Dialogue Not Working - Only Mock Response
**Location**: `src/services/sessionService.ts`, Backend AI integration
**Problem**:
- `sendMessage` API call fails and falls back to catch block
- Returns hardcoded mock: "如果从已知条件出发，你会如何拆解..."
- No real AI dialogue, just repeats the same template
- Backend AI service not properly configured or called

**Expected Behavior**:
- Real Socratic dialogue with AI
- Questions should be contextual to the subject (physics, thermodynamics)
- Progressive questioning that guides student thinking
- Different responses based on conversation history

**Root Cause Investigation Needed**:
1. Is backend `/sessions/:id/messages` endpoint working?
2. Is AI service (DeepSeek/OpenAI) properly configured?
3. Are environment variables set correctly?
4. Is the request format correct?

**Acceptance Criteria**:
- [ ] Login inputs have proper light background
- [ ] Real AI dialogue works (not mock fallback)
- [ ] Questions are contextual and Socratic in style
- [ ] Conversation history influences AI responses
- [ ] Error handling shows proper messages if AI fails

## Priority: CRITICAL
Core functionality (AI dialogue) is not working.
