# DBA团队告警通知配置

## 支持的通知方式

- 📱 钉钉
- 💬 企业微信
- 📧 邮件
- 🔔 Webhook

## 配置文件

创建 `config/notification.json`：

```json
{
  "enabled": true,
  "channels": {
    "dingtalk": {
      "enabled": true,
      "webhook": "https://oapi.dingtalk.com/robot/send?access_token=xxx",
      "secret": "SECxxx"
    },
    "wechat": {
      "enabled": false,
      "webhook": "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx"
    },
    "email": {
      "enabled": false,
      "smtp": {
        "host": "smtp.qq.com",
        "port": 465,
        "user": "xxx@qq.com",
        "password": "xxx"
      },
      "to": ["user@example.com"]
    }
  },
  "triggers": {
    "critical": true,
    "warning": true,
    "info": false
  }
}
```

## 告警类型

| 级别 | 触发条件 |
|------|---------|
| 🔴 Critical | 数据库宕机、复制中断 |
| 🟡 Warning | 性能下降、空间不足 |
| 🔵 Info | 巡检完成、任务结束 |

## 使用示例

```
用户: 设置告警到钉钉
    ↓
读取 config/notification.json
    ↓
配置钉钉 webhook
    ↓
测试告警
```

## 告警消息模板

```json
{
  "msgtype": "markdown",
  "markdown": {
    "title": "DBA告警",
    "text": "## 🔴 数据库告警\n\n**类型**: 性能异常\n**数据库**: Oracle-生产\n**时间**: 2026-03-13 12:00\n**描述**: CPU使用率超过90%\n\n[查看详情](#)"
  }
}
```
