# Socratic Tutor App

🎓 基于苏格拉底教学法的 AI 教育应用

[![Deploy Frontend](https://github.com/yourusername/socratic-tutor-app/actions/workflows/deploy-frontend.yml/badge.svg)](https://github.com/yourusername/socratic-tutor-app/actions/workflows/deploy-frontend.yml)
[![Deploy Backend](https://github.com/yourusername/socratic-tutor-app/actions/workflows/deploy-backend.yml/badge.svg)](https://github.com/yourusername/socratic-tutor-app/actions/workflows/deploy-backend.yml)

## 项目简介

Socratic Tutor App 是一个 AI 驱动的教育应用，通过苏格拉底式的提问引导学习者进行批判性思考，而非直接提供答案。支持多学科领域，具备学习进度追踪功能。

## ✨ 核心功能

- 🤖 **AI 苏格拉底导师** - 通过提问引导思考，而非直接给答案
- 📚 **多学科支持** - 数学、科学、人文学科等领域
- 💬 **流式对话响应** - 实时打字机效果
- 📊 **学习进度追踪** - 概念掌握度统计
- 🔐 **JWT 认证** - 安全的用户认证系统

## 🛠️ 技术栈

### 前端
- React 18 + TypeScript
- Tailwind CSS
- Zustand 状态管理
- Vite 构建工具
- Vitest 测试框架

### 后端
- Node.js + Express + TypeScript
- Prisma ORM
- PostgreSQL 数据库
- Redis 缓存
- OpenAI API

## 🚀 快速开始

### 本地开发

```bash
# 克隆仓库
git clone <repo-url>
cd socratic-tutor-app

# 安装依赖
npm install
cd backend && npm install && cd ..

# 配置环境变量
cp backend/.env.example backend/.env
# 编辑 backend/.env 填入你的配置

# 启动数据库
docker-compose up -d postgres redis

# 启动后端
cd backend && npm run dev

# 启动前端（新终端）
npm run dev
```

访问 http://localhost:5173

### 自动部署

本项目配置了 GitHub Actions 自动部署：

- **前端** → Vercel
- **后端** → Railway

详见 [DEPLOY.md](./DEPLOY.md)

## 📁 项目结构

```
socratic-tutor-app/
├── src/                    # 前端源代码
│   ├── components/         # React 组件
│   ├── pages/              # 页面组件
│   ├── services/           # API 服务
│   ├── stores/             # Zustand 状态
│   └── types/              # TypeScript 类型
├── backend/                # 后端源代码
│   ├── src/
│   │   ├── controllers/    # 控制器
│   │   ├── services/       # 业务逻辑
│   │   ├── middleware/     # 中间件
│   │   └── routes/         # 路由
│   ├── tests/              # 测试文件
│   └── prisma/             # 数据库模型
├── .github/workflows/      # CI/CD 配置
├── docker-compose.yml      # Docker 配置
└── DEPLOY.md              # 部署指南
```

## 🧪 测试

```bash
# 前端测试
npm run test
npm run test:coverage

# 后端测试
cd backend
npm run test
npm run test:coverage
```

**测试覆盖率**: 前后端均 >96%

## 📚 相关文档

- [设计文档](./design.md)
- [部署指南](./DEPLOY.md)
- [API 规范](./specs/)

## 🔒 安全

- JWT + Refresh Token 双令牌认证
- bcrypt 密码加密
- Helmet HTTP 安全头部
- CORS 跨域限制
- 输入验证（Zod Schema）

## 📄 开源协议

MIT License
