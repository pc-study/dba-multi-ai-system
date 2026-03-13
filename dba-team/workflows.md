# 自动化工作流配置

## Cron表达式

| 工作流 | Cron | 说明 |
|-------|------|------|
| 每日巡检 | `0 6 * * *` | 每天早上6点 |
| 每周报告 | `0 8 * * 1` | 每周一早8点 |
| 备份验证 | `0 2 * * *` | 每天凌晨2点 |
| 性能监控 | `*/5 * * * *` | 每5分钟 |

## 工作流定义

### 1. 每日巡检 (daily-inspection)

```yaml
name: daily-inspection
schedule: "0 6 * * *"
description: 每日数据库巡检

tasks:
  - name: check-connections
    description: 检查连接数
    
  - name: check-tablespaces
    description: 检查表空间使用率
    
  - name: check-slow-queries
    description: 统计慢查询
    
  - name: check-replication
    description: 检查复制状态
    
  - name: check-alerts
    description: 检查告警信息
```

### 2. 每周报告 (weekly-report)

```yaml
name: weekly-report
schedule: "0 8 * * 1"
description: 每周健康报告

tasks:
  - name: summary-inspection
    description: 汇总本周巡检
    
  - name: analyze-trend
    description: 性能趋势分析
    
  - name: generate-suggestions
    description: 生成优化建议
```

### 3. 备份验证 (backup-verification)

```yaml
name: backup-verification
schedule: "0 2 * * *"
description: 每日备份验证

tasks:
  - name: check-backup-status
    description: 检查备份是否完成
    
  - name: verify-backup-size
    description: 验证备份文件大小
    
  - name: test-restore
    description: 恢复测试(可选)
```

### 4. 性能监控 (performance-monitor)

```yaml
name: performance-monitor
schedule: "*/5 * * * *"
description: 实时性能监控

tasks:
  - name: collect-metrics
    description: 收集性能指标
    
  - name: check-thresholds
    description: 检查阈值
    
  - name: send-alerts
    description: 发送告警(如有异常)
```

## OpenClaw集成

在OpenClaw中配置cron任务：

```json
{
  "cron": {
    "enabled": true,
    "jobs": [
      {
        "name": "dba-daily-inspection",
        "schedule": "0 6 * * *",
        "skill": "dba-team",
        "action": "inspection"
      },
      {
        "name": "dba-weekly-report", 
        "schedule": "0 8 * * 1",
        "skill": "dba-team",
        "action": "report"
      }
    ]
  }
}
```

## 手动触发

用户也可以手动触发工作流：

```
用户: 执行一次巡检
    ↓
DBA助手执行巡检任务
    ↓
输出巡检报告
```
