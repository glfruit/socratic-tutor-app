# API接口规格 (API Specification)

## 1. 基础信息

- **Base URL**: `/api/v1`
- **认证方式**: Bearer Token (JWT)
- **Content-Type**: `application/json`
- **响应格式**: 统一JSON封装

### 响应格式
```json
{
  "success": true,
  "data": { },
  "error": null
}
```

---

## 2. 认证接口

### 2.1 用户注册
```
POST /auth/register
```

**请求体**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "张三",
  "role": "student"
}
```

**响应** (201):
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "...", "name": "...", "role": "student" },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

### 2.2 用户登录
```
POST /auth/login
```

**请求体**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### 2.3 刷新Token
```
POST /auth/refresh
```

**请求体**:
```json
{
  "refreshToken": "eyJ..."
}
```

### 2.4 OAuth登录
```
GET /auth/oauth/:provider
```
- `provider`: google, github

**重定向**至OAuth授权页面，授权后回调 `/auth/oauth/callback`

---

## 3. 用户接口

### 3.1 获取当前用户信息
```
GET /users/me
```

**响应** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "张三",
    "role": "student",
    "preferences": { "theme": "dark", "language": "zh-CN" },
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### 3.2 更新用户信息
```
PATCH /users/me
```

**请求体**:
```json
{
  "name": "新名字",
  "preferences": { "theme": "light" }
}
```

---

## 4. 对话接口

### 4.1 创建新会话
```
POST /sessions
```

**请求体**:
```json
{
  "subject": "math",
  "topic": "quadratic_equations",
  "title": "二次方程求解"
}
```

**响应** (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "subject": "math",
    "topic": "quadratic_equations",
    "title": "二次方程求解",
    "status": "active",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### 4.2 发送消息
```
POST /sessions/:sessionId/messages
```

**请求体**:
```json
{
  "content": "我不明白为什么需要用配方法",
  "stream": false
}
```

**响应** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "role": "assistant",
    "content": "很好，你提到了配方法。请问：你认为\"配\"是什么意思？",
    "metadata": {
      "questionType": "clarifying",
      "hints": ["配", "完全平方"]
    },
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### 4.3 流式响应 (Server-Sent Events)
```
POST /sessions/:sessionId/messages/stream
```

**请求**: 同上 `stream: true`

**响应**: SSE流
```
data: {"type": "message", "content": "很好，"}
data: {"type": "message", "content": "你认为"}
data: {"type": "message", "content": "\"配\"是什"}
data: {"type": "message", "content": "么意思？"}
data: {"type": "done", "questionType": "clarifying"}
```

### 4.4 获取会话列表
```
GET /sessions
```

**查询参数**:
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| status | string | active | active, paused, archived |
| subject | string | - | 按学科筛选 |
| page | number | 1 | 页码 |
| limit | number | 20 | 每页数量 |

### 4.5 获取会话详情
```
GET /sessions/:sessionId
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "subject": "math",
    "title": "二次方程求解",
    "status": "active",
    "messages": [
      { "id": "uuid", "role": "user", "content": "...", "createdAt": "..." },
      { "id": "uuid", "role": "assistant", "content": "...", "createdAt": "..." }
    ],
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### 4.6 更新会话状态
```
PATCH /sessions/:sessionId
```

**请求体**:
```json
{
  "status": "paused"
}
```

### 4.7 删除会话
```
DELETE /sessions/:sessionId
```

---

## 5. 学习进度接口

### 5.1 获取学习仪表盘
```
GET /progress/dashboard
```

**响应**:
```json
{
  "success": true,
  "data": {
    "totalSessions": 45,
    "totalMessages": 892,
    "activeDays": 12,
    "masteryOverview": {
      "math": { "beginner": 3, "understanding": 5, "proficient": 2, "mastery": 1 },
      "science": { "beginner": 2, "understanding": 3, "proficient": 1, "mastery": 0 }
    },
    "recentSessions": [...]
  }
}
```

### 5.2 获取概念掌握度
```
GET /progress/concepts
```

### 5.3 更新概念掌握度
```
POST /progress/concepts/:conceptId/mastery
```

**请求体**:
```json
{
  "masteryLevel": "proficient"
}
```

---

## 6. 学科接口

### 6.1 获取学科列表
```
GET /subjects
```

**响应**:
```json
{
  "success": true,
  "data": [
    { "id": "math", "name": "数学", "topics": ["algebra", "geometry", "calculus"] },
    { "id": "science", "name": "科学", "topics": ["physics", "chemistry", "biology"] },
    { "id": "humanities", "name": "人文", "topics": ["philosophy", "literature", "history"] }
  ]
}
```

### 6.2 获取知识点
```
GET /subjects/:subjectId/topics
```

---

## 7. 错误码

| 错误码 | 说明 |
|--------|------|
| 400 | 请求参数错误 |
| 401 | 未认证 / Token过期 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |
| 503 | AI服务不可用 |

### 错误响应格式
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "AI_SERVICE_UNAVAILABLE",
    "message": "AI服务暂时不可用，请稍后重试"
  }
}
```

---

## 8. 速率限制

| 端点 | 限制 |
|------|------|
| `/auth/*` | 10次/分钟 |
| `/sessions/*` | 60次/分钟 |
| `/messages/*` | 30次/分钟 |

---

## 9. WebSocket (可选)

用于实时对话:
```
WS /ws/sessions/:sessionId
```

事件:
- `message`: 收到新消息
- `typing`: 对手正在输入
- `error`: 错误事件
