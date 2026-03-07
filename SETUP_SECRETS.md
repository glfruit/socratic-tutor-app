# GitHub Secrets 配置脚本

## 获取 Vercel Token

1. 访问 https://vercel.com/account/tokens
2. 点击 "Create Token"
3. 名称填: `socratic-tutor-app-github`
4. 复制生成的 token

## 获取 Vercel Project ID 和 Org ID

在项目目录运行:
```bash
cd /Users/gorin/Projects/socratic-tutor-app
cat .vercel/project.json
```

输出示例:
```json
{
  "orgId": "your-org-id",
  "projectId": "your-project-id"
}
```

## 获取 Railway Token

1. 访问 https://railway.app/account/tokens
2. 点击 "New Token"
3. 名称填: `socratic-tutor-app-github`
4. 复制生成的 token

## 设置 GitHub Secrets

访问: https://github.com/glfruit/socratic-tutor-app/settings/secrets/actions

添加以下 Secrets:

| Secret Name | Value |
|-------------|-------|
| `VERCEL_TOKEN` | 从 Vercel 复制的 token |
| `VERCEL_ORG_ID` | 从 project.json 获取的 orgId |
| `VERCEL_PROJECT_ID` | 从 project.json 获取的 projectId |
| `RAILWAY_TOKEN` | 从 Railway 复制的 token |

## 初始化 Railway 项目

```bash
# 安装 Railway CLI
npm install -g @railway/cli

# 登录
railway login

# 初始化项目
cd /Users/gorin/Projects/socratic-tutor-app/backend
railway init --name socratic-tutor-api

# 添加数据库
railway add --database postgres
railway add --database redis

# 设置环境变量
railway variables set JWT_SECRET="$(openssl rand -base64 32)"
railway variables set JWT_REFRESH_SECRET="$(openssl rand -base64 32)"
railway variables set OPENAI_API_KEY="your-openai-key"
```

## 触发部署

配置完成后，推送代码即可触发自动部署:
```bash
git push origin main
```

## 查看部署状态

- GitHub Actions: https://github.com/glfruit/socratic-tutor-app/actions
- Vercel Dashboard: https://vercel.com/dashboard
- Railway Dashboard: https://railway.app/dashboard
