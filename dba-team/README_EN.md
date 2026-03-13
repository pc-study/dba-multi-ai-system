# DBA Multi-AI Collaboration System

A multi-AI database expert collaboration system based on OpenClaw, coordinating multiple database experts to handle various DBA tasks.

## Features

- 🤖 **Multi-Expert Collaboration** - 16 database experts for all needs
- 🧠 **Memory System** - Remembers user environment and history
- 📚 **Knowledge Base** - Built-in documentation for 9 popular databases
- ⚙️ **Automated Workflows** - Scheduled巡检 and health reports
- 🔄 **Cross-Database Collaboration** - Multi-expert coordination for cross-database tasks

## Supported Databases

### Traditional Databases
| Database | Expert |
|----------|--------|
| Oracle | ✅ |
| MySQL | ✅ |
| PostgreSQL | ✅ |
| SQL Server | ✅ |

### Chinese Databases
| Database | Expert |
|----------|--------|
| 达梦 (DM) | ✅ |
| 崖山 (YashanDB) | ✅ |
| 金仓 (KingbaseES) | ✅ |
| OceanBase | ✅ |
| PolarDB | ✅ |
| TiDB | ✅ |
| TDSQL | ✅ |

### Other Databases
| Database | Expert |
|----------|--------|
| MongoDB | ✅ |
| Redis | ✅ |
| ClickHouse | ✅ |

## Installation

```bash
# Clone the repo
git clone https://github.com/pc-study/dba-multi-ai-system.git

# Create symlink
ln -s dba-team ~/.npm-global/lib/node_modules/openclaw/skills/dba-team
```

## Quick Start

```
User: How to set up Oracle ADG?
       ↓
DBA Director analyzes → dispatches to Oracle Expert
       ↓
Oracle Expert outputs complete solution
```

## Project Structure

```
dba-team/
├── SKILL.md              # Skill definition
├── memory.md             # Memory mechanism
├── workflows.md          # Workflow config
├── prompts/              # Expert prompts
│   ├── dba-director.md
│   ├── oracle-expert.md
│   ├── mysql-expert.md
│   └── ...
└── references/           # Knowledge base
    ├── oracle.md
    ├── mysql.md
    └── ...
```

## License

MIT License

## Author

- GitHub: [@pc-study](https://github.com/pc-study)
