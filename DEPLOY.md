# Socratic Tutor App - 自动部署指南

## 🚀 快速开始

本项目配置了 GitHub Actions 自动部署工作流，实现前端到 Vercel、后端到 Railway 的自动化部署。

## 📋 前置要求

1. **GitHub 账号**（已创建仓库）
2. **Vercel 账号**（部署前端）
3. **Railway 账号**（部署后端 + 数据库）
4. **OpenAI API Key**（AI对话功能）

## 🔧 环境配置

### 1. Vercel 配置（前端）

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录 Vercel
vercel login

# 链接项目
cd /path/to/socratic-tutor-app
vercel link

# 获取项目信息
vercel project list
```

获取以下信息填入 GitHub Secrets：
- `VERCEL_TOKEN`: 在 https://vercel.com/account/tokens 创建
- `VERCEL_ORG_ID`: 运行 `vercel team list` 获取
- `VERCEL_PROJECT_ID`: 运行 `vercel project list` 获取

### 2. Railway 配置（后端）

```bash
# 安装 Railway CLI
npm install -g @railway/cli

# 登录 Railway
railway login

# 初始化项目
cd backend
railway init --name socratic-tutor-api

# 添加数据库服务
railway add --database postgres
railway add --database redis

# 设置环境变量
railway variables set JWT_SECRET="your-jwt-secret"
railway variables set OPENAI_API_KEY="sk-your-openai-key"

# 获取项目信息用于 GitHub Actions
railway project list
```

获取 Railway Token：
- 访问 https://railway.app/account/tokens
- 创建 Token 并填入 GitHub Secrets: `RAILWAY_TOKEN`

### 3. GitHub Secrets 配置

在 GitHub 仓库页面 → Settings → Secrets and variables → Actions → New repository secret：

| Secret Name | 说明 | 获取方式 |
|-------------|------|----------|
| `VERCEL_TOKEN` | Vercel 访问令牌 | https://vercel.com/account/tokens |
| `VERCEL_ORG_ID` | Vercel 组织 ID | `vercel team list` |
| `VERCEL_PROJECT_ID` | Vercel 项目 ID | `vercel project list` |
| `RAILWAY_TOKEN` | Railway 访问令牌 | https://railway.app/account/tokens |

## 🔄 部署流程

### 自动触发

当代码推送到 `main` 分支时：

1. **测试阶段**: 运行单元测试和代码检查
2. **构建阶段**: 构建生产版本
3. **部署阶段**: 自动部署到对应平台

### 文件变更触发

- 前端文件变更 (`src/**`, `package.json` 等) → 触发前端部署
- 后端文件变更 (`backend/**`) → 触发后端部署

## 📁 工作流文件

| 文件 | 功能 |
|------|------|
| `.github/workflows/deploy-frontend.yml` | 前端部署到 Vercel |
| `.github/workflows/deploy-backend.yml` | 后端部署到 Railway |

## 🌐 访问地址

部署完成后，应用将可通过以下地址访问：

- **前端**: `https://socratic-tutor-app.vercel.app` (示例)
- **后端 API**: `https://socratic-tutor-api.up.railway.app` (示例)

## 🛠️ 手动部署

如需手动部署：

### 前端
```bash
npm run build
vercel --prod
```

### 后端
```bash
cd backend
railway up
```

## 📝 环境变量

### 前端 (.env)
```
VITE_API_URL=https://your-backend-url.up.railway.app/api/v1
```

### 后端 (Railway Variables)
```
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
OPENAI_API_KEY=sk-...
PORT=4000
```

## 🔍 故障排查

### 部署失败检查清单

1. **检查 GitHub Secrets 是否配置正确**
2. **检查 Vercel/Railway 项目是否已创建**
3. **检查测试是否通过**（部署前会自动运行测试）
4. **查看 GitHub Actions 日志**（Actions 标签页）

### 常见问题

**Q: 前端无法连接后端 API?**
A: 检查 `VITE_API_URL` 环境变量是否指向正确的后端地址。

**Q: 后端数据库连接失败?**
A: 在 Railway 控制台检查 PostgreSQL 服务是否运行，以及 `DATABASE_URL` 是否正确。

**Q: AI 对话功能不工作?**
A: 检查 `OPENAI_API_KEY` 是否已设置，以及 API 额度是否充足。

## 📚 相关文档

- [Vercel 文档](https://vercel.com/docs)
- [Railway 文档](https://docs.railway.app/)
- [项目设计文档](./design.md)
