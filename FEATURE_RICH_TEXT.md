# Feature Request - Markdown Rendering & Rich Text Input

## Task 1: Render Markdown in AI Responses
**Current**: AI responses show raw markdown like `**bold**`, `### heading`, `- list`
**Expected**: Properly formatted text with bold, headers, lists, etc.

**Implementation**:
- Install react-markdown or similar library
- Create MarkdownMessage component to render AI responses
- Support basic markdown: bold, italic, headings, lists, code blocks
- Render in MessageBubble component for assistant messages

**Files**:
- src/components/dialogue/MessageBubble.tsx
- New: src/components/dialogue/MarkdownMessage.tsx

## Task 2: Rich Text Input with Math Support
**Current**: Plain textarea input
**Expected**: TipTap editor with math/physics/chemistry formula support

**Implementation**:
- Install TipTap editor (@tiptap/react, @tiptap/starter-kit)
- Install math extensions for formulas
- Replace textarea in MessageInput with TipTap editor
- Support: bold, italic, lists, math formulas (LaTeX)
- Allow inserting special characters (Greek letters, operators)

**Files**:
- src/components/dialogue/MessageInput.tsx
- New: src/components/dialogue/RichTextEditor.tsx

## Acceptance Criteria
- [ ] AI responses render markdown properly (bold, lists, headings)
- [ ] Input supports rich text formatting
- [ ] Math formulas display correctly (KaTeX or MathJax)
- [ ] Works for physics/chemistry/math symbols
- [ ] Mobile-friendly interface

## Dependencies
```bash
npm install react-markdown
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder
npm install @tiptap/extension-mathematics katex
```

## Priority
HIGH - Essential for STEM subjects
