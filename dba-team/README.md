# DBA多AI协作系统

[English](./README_EN.md) | 中文

基于 OpenClaw 的多AI数据库专家协作系统，模拟DBA团队的工作方式，协调多个数据库专家完成各类DBA任务。

## 特性

- 🤖 **多专家协作** - 17种数据库专家，满足各种数据库需求
- 🧠 **记忆机制** - 记住用户环境配置和历史任务
- 📚 **知识库** - 内置14个常用数据库的官方文档索引
- ⚙️ **自动化工作流** - 支持定时巡检、健康报告等自动化任务
- 🔄 **横向协作** - 跨库任务自动协调多专家讨论
- 🌐 **Web管理界面** - 可视化管理数据库和任务
- 📊 **实时监控** - 连接数、QPS、CPU等监控指标

## 支持的数据库

### 传统数据库
| 数据库 | 专家 |
|--------|------|
| Oracle | ✅ |
| MySQL | ✅ |
| PostgreSQL | ✅ |
| SQL Server | ✅ |

### 国产数据库
| 数据库 | 专家 |
|--------|------|
| 达梦 (DM) | ✅ |
| 崖山 (YashanDB) | ✅ |
| 金仓 (KingbaseES) | ✅ |
| OceanBase | ✅ |
| PolarDB | ✅ |
| TiDB | ✅ |
| TDSQL | ✅ |

### 其他数据库
| 数据库 | 专家 |
|--------|------|
| MongoDB | ✅ |
| Redis | ✅ |
| ClickHouse | ✅ |

## Web管理界面

提供完整的Web界面进行可视化管理：

```
http://localhost:8080
```

### 功能模块

| 模块 | 功能 |
|------|------|
| 📊 仪表盘 | 统计概览、最近任务、快捷操作 |
| 💬 AI对话 | 直接与AI助手交互 |
| 🗄️ 数据库 | 列表、详情、测试连接、SQL查询、添加 |
| 📈 实时监控 | 连接数、QPS、CPU、内存监控 |
| 📋 任务中心 | 任务列表、状态筛选 |
| 🔔 告警中心 | 告警列表、已读标记 |
| ⚙️ 系统配置 | 通知渠道、数据库连接、自动化设置 |

## 安装

### 方式1：通过ClawHub安装（推荐）

```bash
clawhub install dba-team
```

### 方式2：Git克隆

```bash
git clone https://github.com/pc-study/dba-multi-ai-system.git
cp -r dba-team ~/.openclaw/skills/
```

### 启动Web界面

```bash
cd dba-team/web
python -m http.server 8080
# 访问 http://localhost:8080
```

## 配置功能

### 工具集成
- SSH远程连接
- 数据库SQL执行
- 连接测试

### 告警通知
- 钉钉机器人
- 企业微信
- 邮件通知

### 自动化
- 定时巡检（每日6:00）
- 备份验证（每日2:00）
- 周报生成（每周一8:00）

## 项目结构

```
dba-team/
├── SKILL.md              # Skill定义
├── prompts/              # 17个专家Prompt
│   ├── oracle-expert.md
│   ├── mysql-expert.md
│   └── ...
├── references/          # 知识库（14个数据库文档）
├── config/              # 配置文件
│   ├── tools.json
│   ├── notification.json
│   ├── nl2sql.json
│   └── ...
├── memory/              # 记忆存储
├── web/                 # Web管理界面
│   └── index.html
└── deploy/              # 部署配置
    └── README.md
```

## 与其他方案对比

| 对比项 | DBA多AI系统 | 传统搜索引擎 | 单一AI助手 |
|--------|------------|------------|-----------|
| 专业性 | ✅ 17个数据库专家 | ❌ 需要自己筛选 | ❌ 不够深入 |
| 协作能力 | ✅ 多专家会诊 | ❌ 无 | ❌ 无 |
| 记忆能力 | ✅ 记住你的环境 | ❌ 无 | ❌ 弱 |
| 知识库 | ✅ 内置官方文档 | ❌ 需要自己查 | ❌ 无 |
| Web界面 | ✅ 可视化 | ❌ 无 | ❌ 无 |

## 相关链接

- 📦 GitHub：https://github.com/pc-study/dba-multi-ai-system
- 🔗 ClawHub：https://clawhub.ai/pc-study/dba-team
- 📖 OpenClaw：https://openclaw.ai

## License

MIT License
