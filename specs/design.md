# 技术设计方案 (Technical Design)

## 1. 系统架构

### 1.1 整体架构
```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                         │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│   │  Pages   │  │Components│  │  Hooks   │  │ Services │        │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
└─────────────────────────────────────────────────────────────────┘
                              │ HTTP/WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend (Express)                          │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│   │ Controllers│ │ Services │ │Middleware│ │   AI     │        │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │PostgreSQL│   │  Redis   │   │ OpenAI   │
        │          │   │          │   │   API    │
        └──────────┘   └──────────┘   └──────────┘
```

### 1.2 技术栈详情

| 层级 | 技术 | 版本 |
|------|------|------|
| 前端框架 | React | 18.x |
| 语言 | TypeScript | 5.x |
| 样式 | Tailwind CSS | 3.x |
| 状态管理 | Zustand | 4.x |
| HTTP客户端 | Axios | 1.x |
| 后端框架 | Express | 4.x |
| 数据库 | PostgreSQL | 15.x |
| 缓存 | Redis | 7.x |
| ORM | Prisma | 5.x |
| 认证 | JWT | - |
| AI | OpenAI API | GPT-4 |

---

## 2. 前端设计

### 2.1 目录结构
```
frontend/
├── src/
│   ├── components/       # 可复用组件
│   │   ├── common/       # 通用组件 (Button, Input, Modal)
│   │   ├── dialogue/     # 对话相关组件
│   │   ├── dashboard/   # 仪表盘组件
│   │   └── layout/       # 布局组件
│   ├── pages/            # 页面组件
│   ├── hooks/            # 自定义Hooks
│   ├── services/         # API服务
│   ├── stores/           # Zustand状态管理
│   ├── types/            # TypeScript类型
│   ├── utils/            # 工具函数
│   ├── App.tsx
│   └── main.tsx
├── public/
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

### 2.2 状态管理 (Zustand)

```typescript
// stores/authStore.ts
interface AuthState {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

// stores/sessionStore.ts
interface SessionState {
  currentSession: Session | null;
  messages: Message[];
  isStreaming: boolean;
  sendMessage: (content: string) => Promise<void>;
  setStreaming: (status: boolean) => void;
}
```

### 2.3 API服务层

```typescript
// services/api.ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = authStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      authStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
```

---

## 3. 后端设计

### 3.1 目录结构
```
backend/
├── src/
│   ├── controllers/      # 路由控制器
│   ├── services/         # 业务逻辑
│   ├── middleware/       # 中间件
│   ├── routes/           # 路由定义
│   ├── types/            # 类型定义
│   ├── utils/            # 工具函数
│   ├── config/           # 配置文件
│   ├── prisma/           # 数据库模型
│   └── index.ts          # 入口文件
├── package.json
├── tsconfig.json
└── .env.example
```

### 3.2 数据库设计 (Prisma)

```prisma
// schema.prisma

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash  String?
  name          String
  role          Role      @default(STUDENT)
  preferences   Json      @default("{}")
  sessions      Session[]
  learningRecords LearningRecord[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Session {
  id        String    @id @default(uuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id])
  subject   String
  topic     String?
  title     String
  status    SessionStatus @default(ACTIVE)
  messages  Message[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Message {
  id         String    @id @default(uuid())
  sessionId  String
  session    Session   @relation(fields: [sessionId], references: [id])
  role       MessageRole
  content    String    @db.Text
  metadata   Json?
  createdAt  DateTime  @default(now())
}

model LearningRecord {
  id           String        @id @default(uuid())
  userId       String
  user         User          @relation(fields: [userId], references: [id])
  concept      String
  masteryLevel MasteryLevel  @default(BEGINNER)
  lastPracticed DateTime     @default(now())
  
  @@unique([userId, concept])
}

enum Role {
  GUEST
  STUDENT
  TEACHER
  ADMIN
}

enum SessionStatus {
  ACTIVE
  PAUSED
  ARCHIVED
}

enum MessageRole {
  USER
  ASSISTANT
}

enum MasteryLevel {
  BEGINNER
  UNDERSTANDING
  PROFICIENT
  MASTERY
}
```

### 3.3 AI服务设计

```typescript
// services/aiService.ts

interface SocraticPrompt {
  subject: string;
  topic: string;
  conversationHistory: Message[];
  userInput: string;
}

class AIService {
  private client: OpenAI;
  
  async generateResponse(prompt: SocraticPrompt): Promise<string> {
    const systemPrompt = this.buildSocraticSystemPrompt(prompt.subject, prompt.topic);
    const messages = [
      { role: 'system', content: systemPrompt },
      ...prompt.conversationHistory.map(m => ({
        role: m.role,
        content: m.content
      })),
      { role: 'user', content: prompt.userInput }
    ];
    
    const response = await this.client.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });
    
    return response.choices[0].message.content;
  }
  
  private buildSocraticSystemPrompt(subject: string, topic: string): string {
    return `你是苏格拉底式的导师，擅长通过提问引导学习者思考。
    
学科: ${subject}
主题: ${topic}

核心原则:
1. 永远不要直接给出答案，而是通过提问引导
2. 使用苏格拉底提问法: 澄清问题、假设探索、追问原因
3. 保持问题与回答的比例 > 3:1
4. 当用户明确要求答案时，委婉拒绝并提供思考方向
5. 适时提供提示词帮助用户思考`;
  }
}
```

---

## 4. 缓存策略

### 4.1 Redis使用场景

| 数据类型 | TTL | 场景 |
|----------|-----|------|
| Session会话 | 1小时 | 存储活跃对话上下文 |
| 用户Token | 15分钟 | JWT黑名单 |
| 学科知识 | 24小时 | 主题知识点缓存 |
| API限流 | 1分钟 | 请求频率控制 |

### 4.2 缓存键设计
```
socratic:session:{sessionId}     # 会话上下文
socratic:subject:{subjectId}    # 学科知识点
socratic:rate:{userId}          # 限流计数器
```

---

## 5. 安全性设计

### 5.1 认证授权
- JWT Access Token (15分钟)
- JWT Refresh Token (7天)
- 密码bcrypt加密 (salt rounds: 12)
- CORS配置 (仅允许已知域名)

### 5.2 输入验证
- Zod schemas for request validation
- SQL注入防护 (Prisma ORM)
- XSS防护 (React转义)

### 5.3 速率限制
- 接口级限流 (Redis实现)
- AI调用限流 (保护API配额)

---

## 6. 部署设计

### 6.1 Docker Compose
```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=postgresql://...
      - REDIS_URL=redis://...
      - OPENAI_API_KEY=...
    depends_on:
      - postgres
      - redis
  postgres:
    image: postgres:15
    volumes:
      - pgdata:/var/lib/postgresql/data
  redis:
    image: redis:7
volumes:
  pgdata:
```

### 6.2 环境变量
```
# Backend
DATABASE_URL=postgresql://user:pass@localhost:5432/socratic
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
OPENAI_API_KEY=sk-...
PORT=4000

# Frontend
VITE_API_URL=http://localhost:4000/api/v1
```

---

## 7. 性能优化

### 7.1 前端优化
- Code splitting (React.lazy)
- 图片懒加载
- 虚拟列表 (消息过多时)

### 7.2 后端优化
- 数据库索引优化
- 连接池配置
- AI响应流式输出 (减少首字节时间)
- 缓存热点数据

---

## 8. 监控与日志

### 8.1 日志
- 结构化JSON日志
- 日志级别: error, warn, info, debug
- 关键操作审计日志

### 8.2 监控指标
- API响应时间 (P50, P95, P99)
- AI调用成功率
- 活跃用户数
- 错误率
