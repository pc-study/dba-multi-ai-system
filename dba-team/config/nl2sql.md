# 自然语言转SQL

将自然语言转换为SQL语句。

## 功能说明

用户输入自然语言描述，自动生成对应的SQL语句。

## 支持的数据库

| 数据库 | 支持情况 |
|--------|---------|
| MySQL | ✅ |
| PostgreSQL | ✅ |
| Oracle | ✅ |
| SQL Server | ✅ |
| 达梦 | ⏳ |
| OceanBase | ⏳ |

## 使用示例

### 示例1：基础查询

```
用户: 查询所有员工
    ↓
生成: SELECT * FROM employees;

用户: 查询工资大于10000的员工
    ↓
生成: SELECT * FROM employees WHERE salary > 10000;
```

### 示例2：复杂查询

```
用户: 按部门统计平均工资
    ↓
生成: SELECT department_id, AVG(salary) 
      FROM employees 
      GROUP BY department_id;

用户: 查询销售额最高的前10个产品
    ↓
生成: SELECT * FROM products 
      ORDER BY sales DESC 
      LIMIT 10;
```

### 示例3：表创建

```
用户: 创建一个用户表，包含id、用户名、邮箱、注册时间
    ↓
生成: CREATE TABLE users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      username VARCHAR(50) NOT NULL,
      email VARCHAR(100) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
```

## 使用方式

```
用户: 用自然语言描述你的需求
    ↓
[AI理解需求]
    ↓
[生成SQL]
    ↓
返回SQL + 说明
```

## 配置

`config/nl2sql.json`：

```json
{
  "enabled": true,
  "default_db": "mysql",
  "options": {
    "format": true,
    "comment": true,
    "explain": true
  }
}
```

## 注意事项

⚠️ 生成的SQL需要人工审核后再执行
⚠️ 复杂业务逻辑建议手动编写
