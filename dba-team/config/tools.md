# DBA团队工具集成配置

## 支持的工具

| 工具 | 功能 |
|------|------|
| SSH | 远程连接服务器 |
| SQL执行 | 连接数据库执行SQL |
| 监控 | 获取监控数据 |
| 备份 | 执行备份操作 |

## 配置文件

创建 `config/tools.json`：

```json
{
  "ssh": {
    "enabled": true,
    "connections": {
      "oracle-prod": {
        "host": "192.168.1.100",
        "port": 22,
        "user": "oracle",
        "auth": "key",
        "key_path": "~/.ssh/id_rsa"
      },
      "mysql-prod": {
        "host": "192.168.1.101",
        "port": 22,
        "user": "mysql",
        "auth": "password",
        "password": "xxx"
      }
    }
  },
  "database": {
    "oracle": {
      "connections": {
        "oracle-prod": {
          "host": "192.168.1.100",
          "port": 1521,
          "service_name": "ORCL",
          "user": "system",
          "password": "xxx"
        }
      }
    },
    "mysql": {
      "connections": {
        "mysql-prod": {
          "host": "192.168.1.101",
          "port": 3306,
          "database": "test",
          "user": "root",
          "password": "xxx"
        }
      }
    }
  }
}
```

## 安全说明

⚠️ **重要提醒**：
- 密码使用加密存储，不要明文保存
- 使用环境变量或密钥管理服务
- 生产环境建议使用SSH Key
- 敏感操作需要二次确认

## 使用示例

### SSH连接

```
用户: 连接oracle-prod执行ls -la
    ↓
读取 config/tools.json
    ↓
SSH连接到192.168.1.100
    ↓
执行 ls -la
    ↓
返回结果
```

### SQL执行

```
用户: 在oracle-prod执行 select * from v$version
    ↓
读取 config/tools.json
    ↓
连接Oracle执行SQL
    ↓
返回查询结果
```

## 支持的数据库

| 数据库 | 状态 |
|--------|------|
| Oracle | ✅ |
| MySQL | ✅ |
| PostgreSQL | ✅ |
| SQL Server | ⏳ |
| 达梦 | ⏳ |
| OceanBase | ⏳ |

## 执行确认

对于高危操作（DELETE、TRUNCATE、DROP），系统会二次确认：

```
用户: 删除test表数据
    ↓
⚠️ 确认操作: 即将执行 DELETE FROM test
    ↓
用户确认: 是
    ↓
执行并返回结果
```
