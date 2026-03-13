# 记忆机制实现

本目录用于存储用户的环境信息和历史任务。

## 文件结构

```
memory/
├── env.json          # 用户环境信息
├── history.json      # 历史任务记录
└── preferences.json  # 用户偏好设置
```

## env.json - 环境信息

首次与用户对话时，记录用户的数据库环境：

```json
{
  "databases": [
    {
      "type": "oracle",
      "version": "19c",
      "role": "生产",
      "clusters": ["RAC"],
      "last_updated": "2026-03-13"
    },
    {
      "type": "mysql",
      "version": "8.0",
      "role": "生产",
      "clusters": ["主从"],
      "last_updated": "2026-03-13"
    }
  ],
  "last_updated": "2026-03-13"
}
```

## history.json - 历史任务

记录处理过的任务：

```json
{
  "tasks": [
    {
      "id": "20260313-001",
      "task": "Oracle ADG怎么搭建",
      "experts": ["oracle-expert"],
      "result": "已交付方案",
      "created_at": "2026-03-13T09:00:00Z"
    }
  ],
  "last_updated": "2026-03-13"
}
```

## preferences.json - 用户偏好

记录用户偏好：

```json
{
  "preferred_db": "Oracle",
  "notification": true,
  "report_format": "markdown",
  "last_updated": "2026-03-13"
}
```

## 使用方式

当需要读取用户记忆时：
1. 读取 memory/env.json 获取用户环境
2. 读取 memory/history.json 参考历史任务
3. 读取 memory/preferences.json 了解用户偏好

当需要保存信息时：
1. 修改对应的JSON文件
2. 自动保存到本地

## 自动记忆规则

- 首次提到数据库环境 → 写入 env.json
- 完成任务 → 写入 history.json
- 用户偏好 → 写入 preferences.json
