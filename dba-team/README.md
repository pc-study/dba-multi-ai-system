# DBA多AI协作系统

[English](./README_EN.md) | 中文

基于 OpenClaw 的多AI数据库专家协作系统，模拟DBA团队的工作方式，协调多个数据库专家完成各类DBA任务。

## 特性

- 🤖 **多专家协作** - 14种数据库专家，满足各种数据库需求
- 🧠 **记忆机制** - 记住用户环境配置和历史任务
- 📚 **知识库** - 内置14个常用数据库的官方文档索引
- ⚙️ **自动化工作流** - 支持定时巡检、健康报告等自动化任务
- 🔄 **横向协作** - 跨库任务自动协调多专家讨论

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

## 团队架构

```
DBA总监 (主Agent)
    ├── Oracle专家
    ├── MySQL专家
    ├── PostgreSQL专家
    ├── SQL Server专家
    ├── 达梦专家
    ├── 崖山专家
    ├── 金仓专家
    ├── OceanBase专家
    ├── PolarDB专家
    ├── TiDB专家
    ├── TDSQL专家
    ├── MongoDB专家
    ├── Redis专家
    ├── ClickHouse专家
    └── 通用DBA助手
```

## 安装

### 方式1：符号链接（推荐开发用）

```bash
# 克隆仓库
git clone https://github.com/pc-study/dba-multi-ai-system.git

# 创建符号链接
ln -s dba-team ~/.npm-global/lib/node_modules/openclaw/skills/dba-team
```

### 方式2：直接复制

```bash
# 克隆仓库
git clone https://github.com/pc-study/dba-multi-ai-system.git

# 复制到OpenClaw skills目录
cp -r dba-team ~/.npm-global/lib/node_modules/openclaw/skills/
```

## 使用方式

### 在OpenClaw中直接对话

```
用户: Oracle ADG怎么搭建？
       ↓
DBA总监分析任务 → 分发给Oracle专家
       ↓
Oracle专家输出完整方案
```

### 任务分发示例

| 用户请求 | 分发专家 | 协作方式 |
|---------|---------|---------|
| Oracle性能优化 | Oracle专家 | 单独处理 |
| MySQL主从延迟 | MySQL专家 | 单独处理 |
| Oracle迁MySQL | Oracle + MySQL | 横向协作 |
| 巡检所有库 | 全部专家 | 并行执行 |

### 横向协作示例

```
用户: 把Oracle的数据迁移到MySQL怎么做？

DBA总监:
→ 分发给Oracle专家（源库分析）
→ 分发给MySQL专家（目标库准备）
→ 协调两位专家讨论迁移方案
→ 汇总最终迁移方案
```

## 项目结构

```
dba-team/
├── SKILL.md                    # Skill定义
├── memory.md                   # 记忆机制说明
├── workflows.md               # 自动化工作流配置
├── prompts/                   # 专家Prompt
│   ├── dba-director.md        # DBA总监
│   ├── oracle-expert.md       # Oracle专家
│   ├── mysql-expert.md        # MySQL专家
│   ├── postgresql-expert.md   # PostgreSQL专家
│   ├── sqlserver-expert.md    # SQL Server专家
│   ├── dm-expert.md          # 达梦专家
│   ├── yashan-expert.md      # 崖山专家
│   ├── kingbase-expert.md    # 金仓专家
│   ├── oceanbase-expert.md   # OceanBase专家
│   ├── polardb-expert.md     # PolarDB专家
│   ├── tidb-expert.md        # TiDB专家
│   ├── tdsql-expert.md       # TDSQL专家
│   ├── mongodb-expert.md     # MongoDB专家
│   ├── redis-expert.md       # Redis专家
│   ├── clickhouse-expert.md  # ClickHouse专家
│   └── dba-assistant.md      # 通用助手
└── references/                # 知识库
    ├── oracle.md             # Oracle文档
    ├── mysql.md              # MySQL文档
    ├── postgresql.md         # PostgreSQL文档
    ├── oceanbase.md          # OceanBase文档
    ├── tidb.md               # TiDB文档
    ├── redis.md              # Redis文档
    ├── mongodb.md            # MongoDB文档
    ├── clickhouse.md         # ClickHouse文档
    └── README.md             # 知识库说明
```

## 知识库

已整理14个常用数据库的官方文档链接：

```
references/
├── oracle.md             # Oracle文档
├── mysql.md              # MySQL文档
├── postgresql.md         # PostgreSQL文档
├── sqlserver.md          # SQL Server文档
├── dm.md                 # 达梦文档
├── yashan.md             # 崖山文档
├── kingbase.md           # 金仓文档
├── oceanbase.md          # OceanBase文档
├── polardb.md            # PolarDB文档
├── tidb.md               # TiDB文档
├── tdsql.md              # TDSQL文档
├── mongodb.md            # MongoDB文档
├── redis.md              # Redis文档
└── clickhouse.md         # ClickHouse文档
```

```bash
# 使用示例
用户: MySQL 8.0有什么新特性？
    ↓
读取 references/mysql.md
    ↓
返回MySQL 8.0版本特性和文档链接
```

## 记忆机制

自动记住用户的环境和偏好：

- **环境信息** - 用户有哪些数据库
- **历史任务** - 过去处理过的任务
- **用户偏好** - 常用的配置和设置

## 自动化工作流

支持定时任务：

| 工作流 | 频率 | 内容 |
|-------|------|------|
| 定时巡检 | 每天 | 连接数、空间、慢查询 |
| 性能监控 | 实时 | QPS、资源使用 |
| 健康报告 | 每周 | 整体评分、趋势分析 |

## 扩展开发

### 添加新专家

1. 在 `prompts/` 创建新专家Prompt
2. 在 `SKILL.md` 添加分发规则
3. 在 `references/` 添加文档链接

### 示例：添加SQLite专家

```bash
# 1. 创建Prompt
echo "# SQLite专家..." > prompts/sqlite-expert.md

# 2. 添加分发规则
# 在 SKILL.md 的任务分发规则中添加:
# sqlite → SQLite专家
```

## 贡献

欢迎提交 Issue 和 Pull Request！

## License

MIT License

## 作者

- GitHub: [@pc-study](https://github.com/pc-study)

## 相关链接

- [OpenClaw](https://github.com/openclaw/openclaw)
- [Minimax](https://minimax.cn)
