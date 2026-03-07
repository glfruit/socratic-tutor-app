#!/bin/bash
# setup-deployment.sh - 一键配置部署环境
# 由 Dev Squad 生成

set -e

echo "🚀 Socratic Tutor App 部署配置脚本"
echo "===================================="
echo ""

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查依赖
check_dependency() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 未安装${NC}"
        return 1
    else
        echo -e "${GREEN}✅ $1 已安装${NC}"
        return 0
    fi
}

echo "📋 检查依赖..."
check_dependency "node" || { echo "请先安装 Node.js: https://nodejs.org"; exit 1; }
check_dependency "npm" || { echo "请先安装 npm"; exit 1; }
check_dependency "git" || { echo "请先安装 Git"; exit 1; }

echo ""
echo "📦 安装 CLI 工具..."

# 安装 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "安装 Vercel CLI..."
    npm install -g vercel@latest
else
    echo -e "${GREEN}✅ Vercel CLI 已安装${NC}"
fi

# 安装 Railway CLI
if ! command -v railway &> /dev/null; then
    echo "安装 Railway CLI..."
    npm install -g @railway/cli
else
    echo -e "${GREEN}✅ Railway CLI 已安装${NC}"
fi

echo ""
echo "🔐 步骤 1/4: Vercel 登录"
echo "------------------------"
echo "请在浏览器中完成 Vercel 登录..."
vercel login

echo ""
echo "📁 步骤 2/4: 初始化 Vercel 项目"
echo "-------------------------------"
cd "$(dirname "$0")"
echo "y" | vercel link --yes

# 获取 Vercel 项目信息
if [ -f ".vercel/project.json" ]; then
    ORG_ID=$(cat .vercel/project.json | grep -o '"orgId"[^,]*' | cut -d'"' -f4)
    PROJECT_ID=$(cat .vercel/project.json | grep -o '"projectId"[^,]*' | cut -d'"' -f4)
    
    echo ""
    echo -e "${GREEN}✅ Vercel 项目已创建${NC}"
    echo "Org ID: $ORG_ID"
    echo "Project ID: $PROJECT_ID"
else
    echo -e "${RED}❌ Vercel 项目配置失败${NC}"
    exit 1
fi

echo ""
echo "🔐 步骤 3/4: Railway 登录"
echo "-------------------------"
echo "请在浏览器中完成 Railway 登录..."
railway login

echo ""
echo "📁 步骤 4/4: 初始化 Railway 项目"
echo "--------------------------------"
cd backend
railway init --name socratic-tutor-api

echo ""
echo "🗄️ 添加数据库服务..."
railway add --database postgres || echo "PostgreSQL 可能已存在"
railway add --database redis || echo "Redis 可能已存在"

echo ""
echo "⚙️ 配置环境变量..."
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

railway variables set JWT_SECRET="$JWT_SECRET"
railway variables set JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET"

echo ""
echo -e "${YELLOW}⚠️ 请设置 OPENAI_API_KEY:${NC}"
echo "运行: cd backend && railway variables set OPENAI_API_KEY='sk-your-key'"

cd ..

echo ""
echo "📝 生成 GitHub Secrets 配置指南..."
cat > GITHUB_SECRETS.txt << EOF
===============================================
GitHub Secrets 配置信息
===============================================

请访问: https://github.com/glfruit/socratic-tutor-app/settings/secrets/actions

添加以下 Secrets:

1. VERCEL_TOKEN
   - 访问: https://vercel.com/account/tokens
   - 创建新 Token 并复制

2. VERCEL_ORG_ID
   值: $ORG_ID

3. VERCEL_PROJECT_ID
   值: $PROJECT_ID

4. RAILWAY_TOKEN
   - 访问: https://railway.app/account/tokens
   - 创建新 Token 并复制

===============================================
完成后，推送代码即可触发自动部署:
   git push origin main
===============================================
EOF

echo ""
echo -e "${GREEN}✅ 配置完成！${NC}"
echo ""
echo "📄 配置信息已保存到 GITHUB_SECRETS.txt"
echo ""
echo "🚀 下一步:"
echo "1. 按 GITHUB_SECRETS.txt 配置 GitHub Secrets"
echo "2. 设置 OPENAI_API_KEY: cd backend && railway variables set OPENAI_API_KEY='sk-your-key'"
echo "3. 推送代码: git push origin main"
echo ""

# 显示 GITHUB_SECRETS.txt 内容
cat GITHUB_SECRETS.txt
