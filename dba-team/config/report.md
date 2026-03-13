# 报表生成

自动生成各类数据库报告，支持多种格式。

## 支持的报表

### 1. 巡检报告

```markdown
# 数据库巡检报告
生成时间: 2026-03-13 12:00

## 概览
| 指标 | 数值 |
|-----|------|
| 数据库数量 | 5 |
| 告警数 | 2 |
| 风险数 | 3 |

## Oracle
- 连接数: 150/200 (75%)
- 表空间: 70% used

## MySQL
- QPS: 1200
- 复制延迟: 0s
```

### 2. 性能报告

```
# 性能分析报告
- TOP 10 慢查询
- 资源使用趋势
- 性能评分
```

### 3. 健康报告

```
# 数据库健康评分
Oracle: 85分 (良好)
MySQL: 92分 (优秀)
PG: 78分 (一般)
```

### 4. 备份报告

```
# 备份状态
- 昨日备份: ✅ 成功
- 备份大小: 50GB
- 保留天数: 7天
```

## 输出格式

| 格式 | 说明 |
|------|------|
| Markdown | 通用格式，推荐 |
| HTML | 可视化报告 |
| PDF | 打印/归档 |
| JSON | API/程序使用 |

## 配置

`config/report.json`：

```json
{
  "enabled": true,
  "formats": ["markdown", "html"],
  "templates": {
    "inspection": true,
    "performance": true,
    "health": true,
    "backup": true
  },
  "output": {
    "path": "./reports/",
    "naming": "{type}_{date}"
  }
}
```

## 使用示例

```
用户: 生成上周巡检报告
    ↓
读取历史巡检数据
    ↓
生成Markdown报告
    ↓
保存到 reports/inspection_20260307.md

用户: 导出为PDF
    ↓
转换Markdown为PDF
    ↓
返回PDF文件
```

## 自动生成

结合自动化工作流：

- 每日巡检 → 自动生成巡检报告
- 每周一 → 自动生成周报
- 每月1号 → 自动生成月报
