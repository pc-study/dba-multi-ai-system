# DBA工具箱

常用数据库小工具集合，提升工作效率。

## 工具列表

### 1. SQL格式化

```
输入: select a.id,b.name from users a left join orders b on a.id=b.user_id where a.status=1
输出: 
SELECT 
    a.id,
    b.name 
FROM users a 
LEFT JOIN orders b ON a.id = b.user_id 
WHERE a.status = 1
```

### 2. JSON转换

```
SQL转JSON: 
SELECT id, name, email FROM users FOR JSON PATH

JSON转SQL:
{"id": 1, "name": "Tom"} 
→ INSERT INTO users (id, name) VALUES (1, 'Tom')
```

### 3. 差异对比

```
对比两个SQL执行计划的差异
对比两个表结构的差异
```

### 4. 时间戳转换

```
Unix时间戳 ↔ 日期时间
日期格式转换
```

### 5. 数据类型转换

```
Oracle: NUMBER(10,2) ↔ MySQL: DECIMAL(10,2)
字符集转换
```

### 6. 密码生成

```
生成随机密码
生成加密密码
```

## 使用方式

```
用户: 格式化这段SQL: xxx
    ↓
返回格式化后的SQL

用户: 生成一个12位密码
    ↓
返回: aB3$kL9#mNp
```

## 配置

工具箱配置在 `config/toolbox.json`：

```json
{
  "enabled": true,
  "tools": {
    "formatter": true,
    "json": true,
    "diff": true,
    "timestamp": true,
    "datatype": true,
    "password": true
  }
}
```
