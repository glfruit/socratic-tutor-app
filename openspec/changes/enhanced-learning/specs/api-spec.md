# API Specification - 增强学习功能

## Base URL
```
/api/v2
```

## Authentication
所有 API 需要 Bearer Token:
```
Authorization: Bearer {accessToken}
```

---

## 1. 主入口

### GET /home
获取首页数据（学习/阅读统计）

**Response**:
```json
{
  "user": {
    "id": "string",
    "name": "string",
    "level": "HIGH_SCHOOL"
  },
  "stats": {
    "totalStudyMinutes": 120,
    "completedBooks": 3,
    "currentStreak": 5
  },
  "recent": {
    "learning": [...],
    "reading": [...]
  }
}
```

---

## 2. 文档管理

### POST /documents
上传文档

**Request** (multipart/form-data):
```
file: File (EPUB, PDF, TXT, DOCX)
type: "BOOK" | "MATERIAL"
title?: string
description?: string
```

**Response**:
```json
{
  "id": "string",
  "status": "PROCESSING",
  "title": "string",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### GET /documents
获取文档列表

**Query**:
```
type?: "BOOK" | "MATERIAL"
status?: "PROCESSING" | "READY" | "ERROR"
page?: number
default: 1
```

**Response**:
```json
{
  "items": [
    {
      "id": "string",
      "type": "BOOK",
      "title": "string",
      "author": "string?",
      "status": "READY",
      "progress": 45.5,
      "coverUrl": "string?",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100
  }
}
```

### GET /documents/:id
获取文档详情

**Response**:
```json
{
  "id": "string",
  "type": "BOOK",
  "title": "string",
  "author": "string?",
  "description": "string?",
  "chapters": [
    {
      "id": "string",
      "title": "string",
      "orderIndex": 0
    }
  ],
  "status": "READY",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### DELETE /documents/:id
删除文档

**Response**: 204 No Content

---

## 3. 阅读会话

### POST /reading-sessions
创建阅读会话

**Request**:
```json
{
  "documentId": "string",
  "chapterId"?: "string"
}
```

**Response**:
```json
{
  "id": "string",
  "document": {
    "id": "string",
    "title": "string"
  },
  "currentChapter": {
    "id": "string",
    "title": "string",
    "content": "string"
  },
  "progress": 0,
  "status": "ACTIVE",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### GET /reading-sessions/:id
获取会话详情

**Response**:
```json
{
  "id": "string",
  "document": {...},
  "currentChapter": {...},
  "messages": [
    {
      "id": "string",
      "role": "ASSISTANT" | "USER",
      "content": "string",
      "metadata": {
        "referencedText"?: "string",
        "pageNumber"?: 10
      },
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "progress": 45.5,
  "status": "ACTIVE"
}
```

### POST /reading-sessions/:id/messages
发送消息（苏格拉底对话）

**Request**:
```json
{
  "content": "string",
  "context"?: {
    "selectedText": "string",
    "pageNumber": 10
  }
}
```

**Response** (流式 SSE):
```
data: {"chunk": "思考是..."}

data: {"chunk": "非常重要的..."}

data: {"done": true, "messageId": "string"}
```

### PATCH /reading-sessions/:id/progress
更新阅读进度

**Request**:
```json
{
  "chapterId": "string",
  "progress": 45.5  // 百分比
}
```

---

## 4. 向量检索 (RAG)

### POST /documents/:id/search
在文档中语义搜索

**Request**:
```json
{
  "query": "string",
  "topK": 5,
  "chapterId"?: "string"
}
```

**Response**:
```json
{
  "results": [
    {
      "content": "string",
      "chapterId": "string",
      "chapterTitle": "string",
      "score": 0.95,
      "metadata": {
        "pageNumber": 10
      }
    }
  ]
}
```

---

## 5. 用户偏好

### GET /preferences
获取用户偏好设置

**Response**:
```json
{
  "level": "HIGH_SCHOOL",
  "subjects": ["数学", "物理"],
  "aiModel": "deepseek-chat",
  "theme": "light"
}
```

### PATCH /preferences
更新偏好

**Request**:
```json
{
  "level"?: "UNIVERSITY",
  "subjects"?: ["数学", "化学"],
  "aiModel"?: "gpt-4"
}
```

---

## 6. 学习会话增强

### POST /sessions
创建学习会话（增强版）

**Request**:
```json
{
  "subject": "string",
  "topic"?: "string",
  "level"?: "HIGH_SCHOOL",  // 可覆盖默认水平
  "documentIds"?: ["string"]  // 上传的参考资料
}
```

### POST /sessions/:id/upload
在学习会话中上传临时资料

**Request** (multipart/form-data):
```
file: File
```

**Response**:
```json
{
  "id": "string",
  "filename": "string",
  "status": "PROCESSING"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "INVALID_REQUEST",
  "message": "Invalid file format. Supported: EPUB, PDF",
  "details": {...}
}
```

### 413 Payload Too Large
```json
{
  "error": "FILE_TOO_LARGE",
  "message": "File size exceeds 50MB limit",
  "maxSize": 52428800
}
```

### 422 Processing Error
```json
{
  "error": "PROCESSING_FAILED",
  "message": "Failed to parse PDF",
  "documentId": "string"
}
```

---

## WebSocket (可选)

### 文档解析进度
```
ws://api/documents/:id/progress
```

**Events**:
```json
{"type": "parsing", "progress": 45}
{"type": "chunking", "progress": 60}
{"type": "embedding", "progress": 80}
{"type": "complete"}
{"type": "error", "message": "..."}
```
