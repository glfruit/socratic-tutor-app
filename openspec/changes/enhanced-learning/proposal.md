# Socratic Tutor 功能升级项目

## 项目概述

**项目名称**: Socratic Tutor - 电子书阅读与学科学习升级  
**目标**: 实现类似 `book-reader-notes` 技能的电子书上传与苏格拉底式阅读功能，同时升级学科学习模块支持水平选择和资料上传  
**交付模式**: 混合外包 (Phase 3 外包给 Codex)  
**预计工期**: 2 周

---

## 核心需求

### 1. 双入口主界面重构
- 用户登录后显示选择界面：「开始学习」或「开始阅读」
- 「学习」→ 学科学习模块
- 「阅读」→ 电子书阅读模块

### 2. 电子书阅读功能 (类似 book-reader-notes)
- 支持 EPUB/PDF 格式上传
- 自动解析目录结构
- 基于内容的苏格拉底式问答
- 阅读进度追踪
- 笔记/高亮功能

### 3. 学科学习升级
- 支持上传教科书/参考资料
- 水平选择：小学/初中/高中/大学/研究生
- 根据水平调整提问深度

### 4. 通用功能
- 文件上传与管理
- RAG (Retrieval-Augmented Generation) 架构
- 向量检索与语义搜索

---

## 技术栈确认

- **前端**: React + TypeScript + Vite + TailwindCSS
- **后端**: Node.js + Express + TypeScript + Prisma
- **数据库**: PostgreSQL + pgvector (向量扩展)
- **缓存**: Redis
- **AI**: DeepSeek/OpenAI API (Embedding + Chat)
- **文件存储**: 本地存储 (开发) / 云存储 (生产)

---

## 开发阶段

| 阶段 | 任务 | 工期 | 交付物 |
|------|------|------|--------|
| Phase 1 | 数据库设计与 API 规范 | 2天 | schema.prisma, api-spec.md |
| Phase 2 | 后端开发 | 5天 | 完整 REST API |
| Phase 3 | 前端开发 | 5天 | UI 组件与页面 |
| Phase 4 | 集成测试 | 2天 | 测试报告 |
| Phase 5 | 部署与文档 | 1天 | DEPLOY.md |

---

## 外包分工

- **Backend**: Codex 实现 API + 数据库 + RAG 逻辑
- **Frontend**: Codex 实现 UI 组件 + 页面 + 状态管理
- **QA**: 内部 QA Lead 审查

---

## 关键约束

- 代码覆盖率 > 80%
- 使用 TDD 开发
- 遵循现有代码风格
- 支持 TypeScript 严格模式
