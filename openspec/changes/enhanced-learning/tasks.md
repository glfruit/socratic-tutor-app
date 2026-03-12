# Tasks - 增强学习功能开发

## 后端任务 (Backend)

### 数据库与模型 ✅ 完成
- [x] 1.1 安装 pgvector 扩展
- [x] 1.2 更新 schema.prisma 添加 Document/Chapter/DocumentChunk 模型
- [x] 1.3 更新 schema.prisma 添加 BookReadingSession/BookMessage 模型
- [x] 1.4 更新 schema.prisma 添加 UserPreference 模型
- [x] 1.5 运行数据库迁移

### 文件上传 ✅ 完成
- [x] 2.1 安装 multer 依赖
- [x] 2.2 创建文件上传中间件 (支持 EPUB/PDF/DOCX/TXT)
- [x] 2.3 创建文件存储服务 (本地/云存储)
- [x] 2.4 实现 POST /documents 接口
- [x] 2.5 实现文件类型验证
- [x] 2.6 实现文件大小限制 (50MB)

### 文档解析 ✅ 完成
- [x] 3.1 安装 pdf-parse 依赖
- [x] 3.2 安装 epub2 依赖
- [x] 3.3 安装 mammoth 依赖 (DOCX)
- [x] 3.4 创建 PDF 解析服务
- [x] 3.5 创建 EPUB 解析服务 (提取目录和内容)
- [x] 3.6 创建 DOCX/TXT 解析服务
- [x] 3.7 创建文本分块服务 (chunking)
- [ ] 3.8 实现后台解析队列 (bullmq)

### Embedding 与向量检索 ✅ 完成
- [x] 4.1 安装 pgvector prisma 扩展
- [x] 4.2 创建 Embedding 服务 (DeepSeek/OpenAI)
- [x] 4.3 实现文本批量 Embedding 生成
- [x] 4.4 实现向量存储到 PostgreSQL
- [x] 4.5 实现语义搜索接口 POST /documents/:id/search
- [x] 4.6 实现相似度阈值过滤

### 阅读会话 API ✅ 完成
- [x] 5.1 创建 BookReadingSession 控制器
- [x] 5.2 实现 POST /reading-sessions 接口
- [x] 5.3 实现 GET /reading-sessions/:id 接口
- [x] 5.4 实现 POST /reading-sessions/:id/messages 接口
- [x] 5.5 实现 SSE 流式响应
- [x] 5.6 实现进度更新 PATCH /reading-sessions/:id/progress
- [ ] 5.7 创建苏格拉底式对话 Prompt 模板

### 用户偏好 API
- [ ] 6.1 创建 UserPreference 控制器
- [ ] 6.2 实现 GET /preferences 接口
- [ ] 6.3 实现 PATCH /preferences 接口
- [ ] 6.4 实现水平选择枚举 (Level)

### 学习会话增强
- [ ] 7.1 修改 POST /sessions 支持 documentIds 参数
- [ ] 7.2 实现会话资料上传 POST /sessions/:id/upload
- [ ] 7.3 修改 AI 服务支持水平选择
- [ ] 7.4 实现基于水平的 Prompt 调整

### 测试 🟨 部分完成
- [x] 8.1 单元测试：文件上传 (documentService.test.ts)
- [ ] 8.2 单元测试：文档解析
- [ ] 8.3 单元测试：Embedding 生成
- [ ] 8.4 集成测试：完整阅读流程
- [ ] 8.5 E2E 测试：文件上传 → 解析 → 对话

### Sprint 2 / 2.5 后端重构 🟨 进行中
- [x] 9.1 拆分 `src/app.ts` 中的认证路由到独立模块 (`routes/auth.ts`)
- [x] 9.2 拆分学习路由到独立模块 (`routes/learning.ts`)
- [x] 9.3 拆分阅读路由到独立模块 (`routes/reading.ts`)
- [x] 9.4 抽离共享中间件与校验逻辑（认证、requestId、zod schema 组织）
- [x] 9.5 重构路由注册层，保留统一 `/api/v2` 挂载入口
- [ ] 9.6 为拆分后的路由补齐回归测试，确保行为与现状一致
- [ ] 9.7 验证 `app.ts` 仅保留应用装配、全局中间件、错误处理与路由挂载职责

---

## 前端任务 (Frontend)

### 主入口重构 🟨 进行中
- [x] 1.1 创建 HomeSelection 页面
- [x] 1.2 创建 ModeCard 组件 (学习/阅读)
- [x] 1.3 创建用户统计面板
- [x] 1.4 创建最近活动快捷入口
- [ ] 1.5 修改路由配置，登录后跳转到 HomeSelection

### 文档上传 🟢 完成
- [x] 2.1 创建 FileUpload 组件 (拖拽上传)
- [x] 2.2 创建 UploadProgress 组件
- [x] 2.3 创建 DocumentForm 组件 (元数据编辑)
- [x] 2.4 创建 UploadPage 页面
- [x] 2.5 实现文件类型图标
- [x] 2.6 实现上传状态管理

### 文档列表 🟢 完成
- [x] 3.1 创建 DocumentList 页面
- [x] 3.2 创建 DocumentCard 组件
- [x] 3.3 实现筛选功能 (类型/状态)
- [x] 3.4 实现搜索功能
- [ ] 3.5 实现分页加载
- [ ] 3.6 实现删除确认弹窗

### 电子书阅读器 🟢 完成
- [x] 4.1 创建 BookReader 页面布局
- [x] 4.2 创建 ChapterSidebar 组件
- [x] 4.3 创建 ReadingArea 组件 (文本渲染)
- [x] 4.4 创建 AIChatPanel 组件 (侧边对话)
- [ ] 4.5 创建 TextSelectionToolbar (选中文字操作) - 已存在
- [ ] 4.6 创建 ProgressBar 组件
- [ ] 4.7 实现章节跳转
- [ ] 4.8 实现阅读进度保存
- [ ] 4.9 实现 SSE 流式消息显示

### 学科水平选择 🟢 完成
- [x] 5.1 创建 LevelSelector 组件
- [x] 5.2 创建水平说明卡片
- [x] 5.3 在学习流程中集成水平选择
- [ ] 5.4 创建设置页面修改默认水平

### 资料上传 🟨 部分完成
- [x] 6.1 创建 SessionMaterialUpload 组件
- [ ] 6.2 在学习会话界面添加上传按钮
- [ ] 6.3 显示已上传资料列表
- [ ] 6.4 实现资料删除功能

### 状态管理
- [ ] 7.1 创建 useDocumentsStore (Zustand)
- [ ] 7.2 创建 useReadingStore
- [ ] 7.3 创建 usePreferencesStore
- [ ] 7.4 更新 useAuthStore 添加偏好信息

### API 服务
- [ ] 8.1 更新 api.ts 添加新接口
- [ ] 8.2 创建 documentService.ts
- [ ] 8.3 创建 readingService.ts
- [ ] 8.4 创建 preferenceService.ts

### 测试
- [ ] 9.1 组件测试：FileUpload
- [ ] 9.2 组件测试：BookReader
- [ ] 9.3 集成测试：上传 → 阅读流程
- [ ] 9.4 E2E 测试：完整用户场景

### Sprint 2 / 2.5 前端定向重构（Impeccable）🟨 进行中
- [x] 10.1 使用 `impeccable-frontend-design` 为首页双入口页建立新的视觉方向与信息层级（`src/app/page.tsx`）
- [ ] 10.2 清理用户界面中的工程文案与任务编号泄露（如 Sprint/FIX 标签）
- [ ] 10.3 重构阅读会话主界面，使阅读内容成为主角并弱化通用 AI chat 工作台感（`src/app/reading/session/[id]/page.tsx`）
- [ ] 10.4 统一阅读器核心组件视觉语言与交互层级（`Sidebar` / `ChapterContent` / `ReadingChat` / `StrategySelector`）
- [ ] 10.5 重构学习入口链路视觉层级（`subjects` / `assessment` / `learning session`），强化"学习旅程"而非通用问卷/聊天页感
- [ ] 10.6 在不改变核心业务行为的前提下，建立更明确的页面级设计 token / typography / spacing 规则
- [ ] 10.7 为关键页面补充视觉回归检查与必要测试，确保重构不破坏现有流程

---

## 开发顺序

### Week 1
| 天数 | 后端 | 前端 |
|------|------|------|
| Day 1 | 数据库设计 + 迁移 | 项目结构 + 路由 |
| Day 2 | 文件上传 API | 上传组件 |
| Day 3 | 文档解析服务 | 文档列表 |
| Day 4 | Embedding + 向量检索 | HomeSelection |
| Day 5 | 阅读会话 API | 阅读器基础 |

### Week 2
| 天数 | 后端 | 前端 |
|------|------|------|
| Day 6 | AI 对话集成 | AI 聊天面板 |
| Day 7 | 用户偏好 API | 水平选择 |
| Day 8 | 学习会话增强 | 资料上传 |
| Day 9 | 测试 + Bugfix | 测试 + Bugfix |
| Day 10 | 文档 + 部署 | 优化 + 部署 |

---

## 依赖清单

### 后端新增依赖
```json
{
  "multer": "^1.4.5-lts.1",
  "pdf-parse": "^1.1.1",
  "epub2": "^3.0.2",
  "mammoth": "^1.6.0",
  "bullmq": "^5.0.0",
  "ioredis": "^5.3.2"
}
```

### 前端新增依赖
```json
{
  "react-dropzone": "^14.2.3",
  "react-reader": "^2.0.0",
  "@types/react-pdf": "^7.0.0"
}
```

---

## 验收标准

- [ ] 用户可以上传 EPUB/PDF 并成功解析
- [ ] 用户可以基于上传的书籍进行苏格拉底对话
- [ ] 用户可以选择学习水平
- [ ] 学习会话可以上传参考资料
- [ ] 所有功能有 >80% 测试覆盖率
- [ ] Lighthouse 性能评分 >90
- [ ] 代码通过 ESLint + Prettier 检查
