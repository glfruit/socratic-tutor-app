# Brainstorming Session - Socratic Tutor v2.0

## Participants: PM Lead (Dev-TL) + Spec Architect (Codex)

## 当前系统痛点分析

### 1. 状态管理问题
**问题**: 
- 多个 Zustand stores (sessionStore, readingStore, authStore, preferencesStore)
- 跨 store 依赖关系混乱
- 竞态条件导致学科切换 bug

**讨论**:
Q: 应该保留 Zustand 还是换 Redux Toolkit?
A: Zustand 本身没问题，但应该：
- 合并相关 stores（session + reading）
- 明确每个 store 的职责边界
- 添加严格的类型约束

### 2. 路由设计缺陷
**问题**:
- `/sessions/:id` 和 `/sessions/new` 共存导致逻辑复杂
- subject 作为 query param，但 session 又绑定 subject
- 切换学科时 session 状态混乱

**讨论**:
Q: 如何重新设计路由？
A: 两个方案：

方案 A - 学科优先:
```
/subjects/:subject/sessions/:id
/subjects/:subject/new
```

方案 B - 会话类型分离:
```
/learn/:subject/:sessionId?
/read/:documentId/:sessionId?
```

推荐 **方案 B** - 更清晰的功能分离

### 3. AI 对话质量
**问题**:
- 当前只是简单的 Q&A，没有真正的苏格拉底式追问
- 缺乏上下文记忆（对话历史只存几条）
- 没有根据用户回答调整问题深度

**讨论**:
Q: 如何实现真正的苏格拉底对话？
A: 需要：
- 对话状态机（开场 → 探索 → 深入 → 总结）
- 用户理解度评估（需要 backend 支持）
- 动态生成追问（基于用户回答的困惑点）

### 4. TipTap 富文本编辑器
**问题**:
- Bundle 大小 1MB+
- 数学公式支持复杂
- 移动端体验差

**讨论**:
Q: 是否保留 TipTap？
A: **v2.0 暂时移除**，原因：
- 核心功能是苏格拉底对话，不是文档编辑
- 简单 Markdown 输入足够（`react-markdown` 渲染输出）
- 公式输入可以用专门的公式组件（KaTeX 内联）
- 后续版本需要时再添加

### 5. 文档上传 & RAG
**问题**:
- Codex 实现了一半，但 frontend/backend 集成不完整
- pgvector 配置复杂

**讨论**:
Q: v2.0 是否保留文档上传？
A: **保留但简化**，MVP 阶段：
- 只支持文本/TXT 文件（避免 PDF 解析复杂性）
- 不需要向量检索（简单的全文搜索即可）
- 文档作为会话的 "参考资料"，不是独立功能

---

## v2.0 核心设计决策

### 架构原则
1. **简单优先** - 删除非核心功能
2. **类型安全** - 前后端共享 TypeScript types
3. **错误可见** - 所有错误都显示给用户
4. **测试覆盖** - 核心流程必须有 E2E 测试

### 技术栈
- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **State**: Zustand（合并后的单一 store）
- **Backend**: Node.js + Express + Prisma + PostgreSQL
- **AI**: DeepSeek API (primary) + OpenAI fallback

### 功能范围 (MVP)
1. ✅ 用户认证
2. ✅ 学科列表
3. ✅ 水平选择（小学/初中/高中/大学/研究生）
4. ✅ 苏格拉底对话（真正的追问式）
5. ✅ 简单文档上传（TXT only）
6. ✅ 学习进度追踪

### 明确不做 (v2.0)
1. ❌ TipTap 富文本编辑器
2. ❌ PDF/EPUB 解析
3. ❌ 向量检索（RAG）
4. ❌ 复杂的状态图表

---

## 下一步

1. PM Lead 确认设计决策
2. 编写详细的 API Spec
3. 编写 UI/UX Spec
4. 启动开发

## 待讨论问题

1. 是否需要一个 "学习路径" 功能（按知识点顺序学习）？
2. 用户回答的 "理解度" 如何评估？（简单规则 vs AI 评估）
3. 对话历史保存多少轮？（10轮 vs 全部 vs 摘要）
4. 是否支持语音输入/输出？

请在这些问题上做出决策，然后进入详细设计阶段。
