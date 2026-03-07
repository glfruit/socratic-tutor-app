# Functional Specification - 增强学习功能

## 1. 用户流程

### 1.1 登录后主界面
```
┌─────────────────────────────────────┐
│         Socratic Tutor              │
├─────────────────────────────────────┤
│                                     │
│    ┌─────────┐    ┌─────────┐      │
│    │  📚     │    │  📖     │      │
│    │  学习   │    │  阅读   │      │
│    │         │    │         │      │
│    │学科学习 │    │电子书籍 │      │
│    └─────────┘    └─────────┘      │
│                                     │
└─────────────────────────────────────┘
```

### 1.2 学习路径
```
选择"学习" → 选择学科 → 选择水平(小学/初中/高中/大学) → 上传资料(可选) → 开始学习
```

### 1.3 阅读路径
```
选择"阅读" → 上传电子书 → 解析中 → 选择章节 → 苏格拉底式阅读
```

---

## 2. 功能模块详解

### 2.1 主入口模块 (HomeSelection)
**需求**:
- 登录后默认跳转到选择界面
- 两个大卡片：学习和阅读
- 显示用户学习统计（总时长、完成书籍等）

### 2.2 电子书上传模块 (BookUpload)
**需求**:
- 支持格式: EPUB, PDF
- 最大文件大小: 50MB
- 拖拽上传 + 点击上传
- 上传进度条
- 元数据编辑：标题、作者、描述
- 文件存储路径：`/uploads/books/{userId}/{bookId}/`

**解析流程**:
1. 上传文件 → 保存到磁盘
2. 提取文本内容 (PDF: pdf-parse, EPUB: epub2)
3. 分章节解析 (EPUB 有目录, PDF 按页)
4. 生成文本块 (chunking)
5. 生成 Embedding (DeepSeek/OpenAI)
6. 存入 pgvector
7. 状态变更为 READY

### 2.3 电子书阅读模块 (BookReader)
**需求**:
- 章节列表侧边栏
- 文本阅读区域
- "开始苏格拉底对话" 按钮
- 选中文字添加笔记/高亮
- 阅读进度保存

**苏格拉底对话模式**:
- 基于当前章节内容提问
- 不直接给答案，引导思考
- 支持追问和提示
- 对话历史保存

### 2.4 学科水平选择模块 (LevelSelection)
**需求**:
- 水平选项：小学/初中/高中/大学/研究生
- 不同水平影响：
  - AI 提问深度
  - 使用词汇复杂度
  - 概念解释详细程度

### 2.5 资料上传模块 (MaterialUpload)
**需求**:
- 在学习会话中上传参考资料
- 支持格式: PDF, DOCX, TXT, Markdown
- 解析并加入当前会话的 RAG 上下文
- 只影响当前会话，不保存到全局

---

## 3. 数据库模型

### Document (电子书/资料)
```prisma
model Document {
  id          String   @id @default(uuid())
  userId      String
  type        DocumentType  // BOOK, MATERIAL
  title       String
  author      String?
  description String?
  filename    String
  filePath    String
  fileType    String   // epub, pdf, txt, docx
  fileSize    Int
  status      DocumentStatus @default(PROCESSING)
  chapters    Chapter[]
  chunks      DocumentChunk[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Chapter {
  id         String   @id @default(uuid())
  documentId String
  title      String
  orderIndex Int
  content    String   @db.Text
  chunks     DocumentChunk[]
}

model DocumentChunk {
  id         String   @id @default(uuid())
  documentId String
  chapterId  String?
  content    String   @db.Text
  embedding  Unsupported("vector(1536)")?
  metadata   Json?
}
```

### BookReadingSession (阅读会话)
```prisma
model BookReadingSession {
  id         String   @id @default(uuid())
  userId     String
  documentId String
  chapterId  String?
  status     ReadingStatus @default(ACTIVE)
  progress   Float    @default(0)  // 0-100
  messages   BookMessage[]
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model BookMessage {
  id        String   @id @default(uuid())
  sessionId String
  role      MessageRole
  content   String   @db.Text
  metadata  Json?    // 引用的文本位置等
  createdAt DateTime @default(now())
}
```

### UserLevel (用户学习水平)
```prisma
model UserPreference {
  id          String   @id @default(uuid())
  userId      String   @unique
  level       Level    @default(HIGH_SCHOOL)  // 默认高中
  subjects    String[] // 感兴趣的学科
  aiModel     String   @default("deepseek-chat")
}

enum Level {
  ELEMENTARY    // 小学
  MIDDLE_SCHOOL // 初中
  HIGH_SCHOOL   // 高中
  UNIVERSITY    // 大学
  GRADUATE      // 研究生
}
```

---

## 4. AI Prompt 设计

### 4.1 苏格拉底式阅读 Prompt
```
你是一位苏格拉底式导师，正在引导学生阅读《{bookTitle}》的《{chapterTitle}》章节。

**角色设定**:
- 不要直接给出答案
- 通过提问引导学生自己发现
- 根据学生的回答调整深度
- 适时给予提示而非答案

**当前阅读内容**:
{context}

**对话历史**:
{history}

**学生最新回复**:
{studentMessage}

请用苏格拉底式方法回应：
1. 肯定学生的思考
2. 提出深入的问题
3. 如果学生困惑，给出提示而非答案
```

### 4.2 学科学习 Prompt (按水平)
```
你是一位{level}水平的{subject}导师。

**水平设定**:
- 小学：使用简单语言，多用比喻
- 初中：逐步引入概念，解释术语
- 高中：深入原理，联系实际
- 大学：理论深度，批判性思维
- 研究生：前沿视角，研究性问题

**当前主题**: {topic}
**参考资料**: {materials}

请用苏格拉底式方法提问...
```

---

## 5. UI/UX 设计要点

### 5.1 主选择界面
- 两个大卡片，图标醒目
- 悬停动画效果
- 底部显示快捷入口（最近学习/最近阅读）

### 5.2 电子书阅读器
- 左侧：章节列表（可折叠）
- 中间：阅读区域（类似 Kindle）
- 右侧：AI 对话面板（可折叠）
- 底部：进度条 + 操作按钮

### 5.3 上传界面
- 拖拽区域大且明显
- 文件类型图标提示
- 解析进度动画
- 错误提示友好

---

## 6. 错误处理

| 场景 | 处理方式 |
|------|----------|
| 文件过大 | 提示最大 50MB，建议压缩 |
| 格式不支持 | 提示支持格式，提供转换建议 |
| 解析失败 | 显示错误日志，允许重试 |
| Embedding 失败 | 后台重试 3 次，失败人工介入 |
| AI API 失败 | 降级到本地提示，通知用户 |
