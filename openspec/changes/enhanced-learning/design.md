# Technical Design - 增强学习功能

## 架构概述

```
┌─────────────────────────────────────────────────────────────┐
│                         Client                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  HomeSelection│  │ BookReader   │  │ StudyMode    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Server (Express)                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ Document    │ │ Reading     │ │ Study       │           │
│  │ Controller  │ │ Controller  │ │ Controller  │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
      ┌────────────┐  ┌────────────┐  ┌────────────┐
      │ PostgreSQL │  │   Redis    │  │  File      │
      │ + pgvector │  │  (BullMQ)  │  │  Storage   │
      └────────────┘  └────────────┘  └────────────┘
                                              │
                                              ▼
                                     ┌────────────────┐
                                     │ DeepSeek/OpenAI│
                                     │ (Embedding +   │
                                     │  Chat API)     │
                                     └────────────────┘
```

---

## 核心服务设计

### 1. DocumentService

```typescript
class DocumentService {
  // 上传文件到存储
  async uploadFile(file: Buffer, metadata: FileMetadata): Promise<Document>
  
  // 解析文档内容
  async parseDocument(documentId: string): Promise<ParsedContent>
  
  // 分块处理
  async chunkContent(content: string, options: ChunkOptions): Promise<Chunk[]>
  
  // 生成 Embedding
  async generateEmbeddings(chunks: Chunk[]): Promise<EmbeddedChunk[]>
  
  // 语义搜索
  async searchSimilar(documentId: string, query: string, topK: number): Promise<SearchResult[]>
}
```

### 2. ParsingService

```typescript
interface Parser {
  parse(filePath: string): Promise<ParsedContent>
}

class PDFParser implements Parser {
  async parse(filePath: string): Promise<ParsedContent> {
    // 使用 pdf-parse 提取文本
    // 返回结构化内容（带页码）
  }
}

class EPUBParser implements Parser {
  async parse(filePath: string): Promise<ParsedContent> {
    // 使用 epub2 提取章节
    // 返回带目录结构的内容
  }
}

class DOCXParser implements Parser {
  async parse(filePath: string): Promise<ParsedContent> {
    // 使用 mammoth 提取文本
  }
}
```

### 3. EmbeddingService

```typescript
class EmbeddingService {
  private client: OpenAI | DeepSeekClient
  
  async generateEmbedding(text: string): Promise<number[]> {
    // 调用 Embedding API
    // 返回 1536 维向量
  }
  
  async generateBatch(texts: string[]): Promise<number[][]> {
    // 批量生成，控制并发
  }
}
```

### 4. SocraticConversationService

```typescript
class SocraticConversationService {
  async generateQuestion(
    context: string,
    history: Message[],
    level: Level,
    options: {
      referencedText?: string
      style: 'reading' | 'study'
    }
  ): Promise<AsyncIterable<string>> {
    // 构建 Prompt
    // 调用流式 Chat API
    // 返回 SSE 流
  }
}
```

---

## 数据流设计

### 文档上传与解析流程

```
用户上传文件
    │
    ▼
┌─────────────────┐
│ 1. 验证文件类型 │ ──错误──▶ 返回 400
│ 2. 验证文件大小 │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ 3. 保存到磁盘   │
│ 4. 创建 DB 记录 │
│ status=PROCESSING│
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ 5. 添加到队列   │ ──异步处理──▶
└─────────────────┘
    │
    ▼
返回 documentId (202 Accepted)


异步处理队列:
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ 提取文本    │───▶│ 分块(chunk) │───▶│ 生成向量    │───▶│ 更新状态    │
│ (pdf/epub)  │    │ (1000字符)  │    │ (embedding) │    │ status=READY│
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                              │
                                                              ▼
                                                         通知用户完成
```

### 阅读对话流程

```
用户选择章节开始阅读
    │
    ▼
加载章节内容
    │
    ▼
用户点击"开始对话"或选中文字提问
    │
    ▼
┌─────────────────────────────────┐
│ 1. 获取当前章节内容 (context)   │
│ 2. 语义搜索相关内容             │
│ 3. 构建苏格拉底 Prompt         │
│ 4. 调用流式 Chat API           │
└─────────────────────────────────┘
    │
    ▼
SSE 流式返回 AI 回复
    │
    ▼
保存对话历史到数据库
```

---

## 数据库设计

### 向量存储

使用 pgvector 扩展：

```sql
-- 启用扩展
CREATE EXTENSION IF NOT EXISTS vector;

-- 创建向量列
ALTER TABLE "DocumentChunk" ADD COLUMN embedding vector(1536);

-- 创建相似度搜索索引
CREATE INDEX ON "DocumentChunk" 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 相似度查询
SELECT content, 1 - (embedding <=> query_embedding) AS similarity
FROM "DocumentChunk"
WHERE documentId = 'xxx'
ORDER BY embedding <=> query_embedding
LIMIT 5;
```

### 索引策略

| 表 | 索引 | 用途 |
|---|------|------|
| Document | (userId, type) | 用户文档列表查询 |
| Document | (status) | 筛选处理状态 |
| Chapter | (documentId, orderIndex) | 章节排序 |
| DocumentChunk | (documentId) | 文档内搜索 |
| DocumentChunk | embedding vector_cosine_ops | 语义搜索 |
| BookReadingSession | (userId, status) | 用户活跃会话 |
| BookMessage | (sessionId, createdAt) | 消息历史 |

---

## API 设计原则

### 文件上传
```typescript
// 使用 multer 中间件
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.epub', '.docx', '.txt']
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, allowed.includes(ext))
  }
})

app.post('/documents', upload.single('file'), documentController.upload)
```

### SSE 流式响应
```typescript
app.post('/reading-sessions/:id/messages', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  
  const stream = await socraticService.generateQuestion(...)
  
  for await (const chunk of stream) {
    res.write(`data: ${JSON.stringify({ chunk })}\n\n`)
  }
  
  res.write(`data: ${JSON.stringify({ done: true })}\n\n`)
  res.end()
})
```

---

## 前端状态设计

### Zustand Store 结构

```typescript
// useDocumentsStore.ts
interface DocumentsState {
  documents: Document[]
  uploadProgress: Record<string, number>
  
  uploadFile: (file: File, metadata: Metadata) => Promise<void>
  fetchDocuments: (filters?: Filters) => Promise<void>
  deleteDocument: (id: string) => Promise<void>
}

// useReadingStore.ts
interface ReadingState {
  currentSession: ReadingSession | null
  messages: Message[]
  isGenerating: boolean
  
  startSession: (documentId: string) => Promise<void>
  sendMessage: (content: string) => Promise<void>
  updateProgress: (progress: number) => Promise<void>
}

// usePreferencesStore.ts
interface PreferencesState {
  level: Level
  subjects: string[]
  
  setLevel: (level: Level) => Promise<void>
  setSubjects: (subjects: string[]) => Promise<void>
}
```

---

## 错误处理策略

| 错误类型 | 处理方式 | 用户反馈 |
|---------|---------|---------|
| 文件过大 | 前端预检查 | "文件超过50MB，请压缩后重试" |
| 格式不支持 | 前端 + 后端检查 | "仅支持 EPUB, PDF, DOCX, TXT" |
| 解析失败 | 队列重试 3 次 | "解析失败，请检查文件是否损坏" |
| Embedding 失败 | 后台重试 + 告警 | "正在处理中，请稍候..." |
| AI API 失败 | 降级本地提示 | "AI服务暂时不可用，请稍后重试" |

---

## 安全考虑

1. **文件上传**
   - 限制文件类型 (白名单)
   - 限制文件大小
   - 存储路径隔离 (按 userId)
   - 病毒扫描 (可选)

2. **内容安全**
   - 用户只能访问自己的文档
   - API 权限校验 middleware
   - SQL 注入防护 (Prisma 默认防护)

3. **AI 内容**
   - 敏感词过滤
   - 内容审核 (可选)

---

## 性能优化

1. **Embedding 生成**
   - 批量处理 (每批 10-20 条)
   - 队列异步处理
   - 缓存已生成的向量

2. **文件存储**
   - 大文件分片上传 (可选)
   - CDN 加速 (生产环境)

3. **数据库**
   - 向量索引 (IVFFlat)
   - 查询分页
   - 连接池

4. **前端**
   - 虚拟滚动 (长文档列表)
   - 懒加载 (章节内容)
   - 防抖搜索
