# Bug Report - Message Input Not Clearing

## Problem
After sending a message in the chat interface:
- The text in the input box is NOT cleared
- Happens both when clicking send button AND pressing Enter key
- Message is sent successfully (AI responds)
- But input field retains the text

## Expected Behavior
Input field should be cleared immediately after message is sent successfully

## Files to Fix
- src/components/dialogue/MessageInput.tsx
- src/stores/sessionStore.ts (sendMessage return value)

## Acceptance Criteria
- [ ] Input clears when message sent successfully
- [ ] Input does NOT clear if send fails (so user can retry)
- [ ] Works for both button click and Enter key
