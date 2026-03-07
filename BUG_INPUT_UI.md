# Bug Report - Input Not Clearing + Dark Background

## Problem 1: Input Text Not Clearing After Send
**Screenshot Evidence**: Message "从数学定义" sent (visible in chat bubble), but same text still shows in input field at bottom.

**Current Code Flow**:
1. User types message
2. Clicks send or presses Enter
3. Message appears in chat
4. **BUG**: Input field still shows the text

**Expected**: Input should be empty after successful send

**Files to Check**:
- src/components/dialogue/MessageInput.tsx
- src/stores/sessionStore.ts

## Problem 2: Input Background is Dark/Black
**Screenshot Evidence**: Input area has dark background instead of light

**Expected**: Light/white background for input area

**Possible Causes**:
- Dark mode class applied to parent container
- Missing bg-white or forceLight styles
- CSS specificity issues

**Files to Check**:
- src/components/dialogue/MessageInput.tsx (textarea styles)
- Parent container styles

## Acceptance Criteria
- [ ] Input clears immediately after message sent
- [ ] Input has light/white background
- [ ] Text in input is clearly visible (dark color)
- [ ] Works for both button click and Enter key

## Priority
URGENT - Core UX broken
