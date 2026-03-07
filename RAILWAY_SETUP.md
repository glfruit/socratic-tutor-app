# Railway 配置指南（使用 DeepSeek）

## 设置 DeepSeek API Key

```bash
cd /Users/gorin/Projects/socratic-tutor-app/backend

# 设置 AI 提供商为 DeepSeek
railway variables set AI_PROVIDER=deepseek

# 设置 DeepSeek API Key
railway variables set DEEPSEEK_API_KEY="sk-your-deepseek-key"

# 可选：设置模型（默认 deepseek-chat）
railway variables set DEEPSEEK_MODEL=deepseek-chat
# 或推理模型：deepseek-reasoner
```

## 获取 DeepSeek API Key

1. 访问 https://platform.deepseek.com/api_keys
2. 注册/登录账号
3. 点击 "创建 API Key"
4. 复制以 `sk-` 开头的密钥

## 费用说明

- DeepSeek API 价格远低于 OpenAI
- deepseek-chat: ¥1/百万 tokens (输入) / ¥2/百万 tokens (输出)
- 新用户有 10元 免费额度

## 验证配置

```bash
# 查看所有变量
railway variables list

# 应该看到：
# - AI_PROVIDER=deepseek
# - DEEPSEEK_API_KEY=sk-...
# - DATABASE_URL=postgresql://...
# - REDIS_URL=redis://...
# - JWT_SECRET=...
# - JWT_REFRESH_SECRET=...
```

## 切换回 OpenAI（可选）

```bash
railway variables set AI_PROVIDER=openai
railway variables set OPENAI_API_KEY="sk-your-openai-key"
```
