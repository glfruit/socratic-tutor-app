# 功能规格 (Functional Specification)

## 1. 项目概述

**项目名称**: Socratic Tutor App  
**项目类型**: AI教育应用  
**核心功能**: 通过苏格拉底对话式教学方法，AI导师通过引导性问题帮助学习者自主发现知识，而非直接给出答案。  
**目标用户**: 学生、终身学习者、教育工作者

---

## 2. 用户角色与权限

| 角色 | 权限 |
|------|------|
| Guest (访客) | 仅可体验单轮对话，无法保存会话 |
| Student (学生) | 完整对话功能、学习进度追踪、查看历史会话 |
| Teacher (教师) | 学生所有权限 + 创建课程、查看学生进度、定制问题集 |
| Admin (管理员) | 系统管理、用户管理、数据分析 |

---

## 3. 核心功能模块

### 3.1 对话系统 (Dialogue System)

#### 3.1.1 苏格拉底对话引擎
- **多轮对话**: 支持至少10轮上下文记忆
- **问题生成策略**:
  - 引导式提问 (Socratic questioning)
  - 追问 (Probing questions)
  - 澄清问题 (Clarifying questions)
  - 假设探索 (Hypothetical exploration)
- **回答响应**: 当学习者明确要求答案时，提示引导方向而非直接给出
- **风格保持**: 问题与回答比例 > 3:1

#### 3.1.2 对话管理
- 创建新对话会话
- 暂停/恢复会话
- 会话归档
- 删除会话
- 会话标题自动生成

### 3.2 学科领域支持 (Subject Domains)

#### 3.2.1 内置学科
| 学科 | 细分领域 |
|------|----------|
| 数学 | 代数、几何、微积分、概率统计 |
| 科学 | 物理、化学、生物 |
| 人文 | 哲学、文学、历史 |

#### 3.2.2 自定义学科
- 教师可上传自定义问题集
- 支持Markdown格式
- 支持上传PDF参考材料

### 3.3 学习进度追踪 (Learning Progress)

#### 3.3.1 指标体系
- **会话统计**: 总对话轮次、会话时长、活跃天数
- **概念掌握度**: 按知识点标记掌握程度 (初学/理解/熟练/精通)
- **学习路径**: 推荐下一步学习内容

#### 3.3.2 数据展示
- 学习仪表盘
- 进度时间线
- 能力雷达图

### 3.4 用户管理 (User Management)

#### 3.4.1 认证系统
- 邮箱/密码注册登录
- OAuth第三方登录 (Google, GitHub)
- JWT token刷新机制
- 密码重置

#### 3.4.2 用户资料
- 基本信息编辑
- 学习目标设置
- 偏好设置 (主题、语言、对话风格)

---

## 4. 数据模型

### 4.1 用户 (User)
```
- id: UUID (PK)
- email: string (unique)
- password_hash: string
- name: string
- role: enum (guest, student, teacher, admin)
- preferences: JSON
- created_at: timestamp
- updated_at: timestamp
```

### 4.2 对话会话 (Session)
```
- id: UUID (PK)
- user_id: UUID (FK)
- subject: string
- title: string (auto-generated)
- status: enum (active, paused, archived)
- created_at: timestamp
- updated_at: timestamp
```

### 4.3 对话消息 (Message)
```
- id: UUID (PK)
- session_id: UUID (FK)
- role: enum (user, assistant)
- content: text
- metadata: JSON (thinking_process, references)
- created_at: timestamp
```

### 4.4 学习记录 (LearningRecord)
```
- id: UUID (PK)
- user_id: UUID (FK)
- concept: string
- mastery_level: enum (beginner, understanding, proficient, mastery)
- last_practiced: timestamp
```

---

## 5. 边界情况处理

| 场景 | 处理方案 |
|------|----------|
| 用户请求直接答案 | 委婉拒绝，提供引导式提示 |
| 超出学科范围 | 提示当前学科限制，建议切换 |
| 超长输入 | 限制5000字符，提示截断 |
| 敏感内容 | 拒绝回答，记录日志 |
| 会话中断 | 自动保存，支持恢复 |
| API超时 | 重试3次，提示稍后重试 |

---

## 6. 非功能性需求

| 指标 | 要求 |
|------|------|
| 响应延迟 | < 2秒 (P95) |
| 可用性 | 99.9% |
| 并发支持 | 1000+ 活跃用户 |
| 数据保留 | 免费用户30天，会员永久 |

---

## 7. 验收标准

- [ ] 用户可以注册、登录、登出
- [ ] 对话系统保持苏格拉底风格 (问题:回答 > 3:1)
- [ ] 支持至少10轮上下文记忆
- [ ] 学习进度正确记录和展示
- [ ] 响应延迟 < 2秒
- [ ] 移动端响应式布局正常
- [ ] 所有边界情况有明确处理
