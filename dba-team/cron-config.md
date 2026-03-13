# DBA团队定时任务配置

# 复制此文件到 OpenClaw 配置目录
# 或在 OpenClaw 配置中添加以下 cron 任务

## Cron 配置示例

```json
{
  "dba_cron": {
    "enabled": true,
    "timezone": "Asia/Shanghai",
    "jobs": [
      {
        "name": "dba-daily-inspection",
        "schedule": "0 6 * * *",
        "description": "每日数据库巡检",
        "command": "dba-team inspection"
      },
      {
        "name": "dba-weekly-report", 
        "schedule": "0 8 * * 1",
        "description": "每周健康报告",
        "command": "dba-team report"
      },
      {
        "name": "dba-backup-check",
        "schedule": "0 2 * * *",
        "description": "每日备份验证",
        "command": "dba-team backup-check"
      }
    ]
  }
}
```

## 工作流详情

### 1. 每日巡检 (inspection)
执行时间: 每天 6:00

检查项:
- [ ] 数据库连接数
- [ ] 表空间使用率
- [ ] 慢查询统计
- [ ] 复制延迟检查
- [ ] 告警信息汇总

输出: 巡检报告

### 2. 每周报告 (report)
执行时间: 每周一 8:00

内容:
- [ ] 本周巡检汇总
- [ ] 性能趋势分析
- [ ] 优化建议

输出: 健康报告

### 3. 备份验证 (backup-check)
执行时间: 每天 2:00

检查项:
- [ ] 备份是否完成
- [ ] 备份文件大小
- [ ] 恢复测试(可选)

输出: 备份状态

## 手动触发

用户可以直接触发工作流:

```
@DBA 执行一次巡检
@DBA 生成本周报告
@DBA 检查备份状态
```

## 配置位置

将上述 JSON 配置添加到 OpenClaw 的配置文件中，或使用 OpenClaw CLI:

```bash
openclaw cron add dba-daily-inspection "0 6 * * *" "dba-team inspection"
```
