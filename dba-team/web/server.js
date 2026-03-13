const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

// 加载配置
let config = { databases: [], alerts: [] };
try {
  const configData = fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8');
  config = JSON.parse(configData);
} catch (e) {
  console.log('配置文件加载失败，使用默认数据');
}

// 数据库连接池
const pools = {};

// 初始化连接池
async function initPools() {
  // 尝试加载数据库驱动
  let mysql, pg;
  try { mysql = require('mysql2/promise'); } catch (e) { console.log('MySQL驱动未安装'); }
  try { pg = require('pg'); } catch (e) { console.log('PostgreSQL驱动未安装'); }
  
  for (const db of config.databases) {
    try {
      if (db.type === 'mysql' && mysql) {
        pools[db.id] = await mysql.createPool({
          host: db.ip,
          port: db.port,
          user: db.user,
          password: db.password,
          database: db.database || 'mysql',
          connectionLimit: 5
        });
        console.log(`MySQL连接池已创建: ${db.name} (${db.ip}:${db.port})`);
      } else if (db.type === 'postgresql' && pg) {
        pools[db.id] = new pg.Pool({
          host: db.ip,
          port: db.port,
          user: db.user,
          password: db.password,
          database: db.database || 'postgres'
        });
        console.log(`PostgreSQL连接池已创建: ${db.name} (${db.ip}:${db.port})`);
      }
    } catch (e) {
      console.log(`连接池创建失败: ${db.name} - ${e.message}`);
    }
  }
}

// 模拟数据（当没有配置时使用）
const mockDatabases = [
  { id: 'oracle1', name: 'Oracle生产库', type: 'oracle', version: '19.29.0', mode: '2节点RAC', status: 'online', connections: 168, qps: 1250, cpu: 65, memory: '12GB/16GB', disk: '450GB/500GB', ip: '192.168.1.100', port: 1521 },
  { id: 'mysql1', name: 'MySQL生产库', type: 'mysql', version: '8.0.32', mode: 'MGR集群', status: 'online', connections: 86, qps: 2340, cpu: 45, memory: '8GB/16GB', disk: '120GB/200GB', ip: '192.168.1.101', port: 3306 },
  { id: 'pg1', name: 'PostgreSQL', type: 'postgresql', version: '15.4', mode: '主从复制', status: 'warning', connections: 38, qps: 420, cpu: 78, memory: '6GB/8GB', disk: '68GB/80GB', ip: '192.168.1.102', port: 5432 },
  { id: 'ob1', name: 'OceanBase', type: 'oceanbase', version: '4.2.1', mode: '3Zone', status: 'online', connections: 62, qps: 180, cpu: 35, memory: '20GB/32GB', disk: '200GB/500GB', ip: '192.168.1.103', port: 2882 },
  { id: 'tidb1', name: 'TiDB生产库', type: 'tidb', version: '7.5.0', mode: '3节点', status: 'online', connections: 120, qps: 3500, cpu: 55, memory: '32GB/64GB', disk: '500GB/1TB', ip: '192.168.1.104', port: 4000 },
  { id: 'redis1', name: 'Redis集群', type: 'redis', version: '7.2', mode: '集群模式', status: 'online', connections: 45, qps: 8500, cpu: 30, memory: '8GB/8GB', disk: '2GB/10GB', ip: '192.168.1.105', port: 6379 }
];

const mockTasks = [
  { id: 1, title: 'Oracle迁TiDB迁移方案设计', expert: 'Oracle+TiDB专家', status: 'running', priority: 'high', startTime: '10:15' },
  { id: 2, title: 'MySQL慢查询优化', expert: 'MySQL专家', status: 'running', priority: 'medium', startTime: '11:30' },
  { id: 3, title: 'PG空间扩容评估', expert: 'PG专家', status: 'waiting', priority: 'low', startTime: '09:00' }
];

let chatHistory = [
  { role: 'ai', content: '你好！我是DBA团队的AI助手。\n\n我可以帮你：\n- 解答数据库问题\n- 优化SQL\n- 搭建高可用架构\n- 排查故障\n- 设计迁移方案\n\n直接描述你的需求即可！' }
];

// 获取数据库列表
function getDatabases() {
  if (config.databases.length > 0) {
    return config.databases.map(db => ({
      ...db,
      connections: Math.floor(Math.random() * 100) + 50,
      qps: Math.floor(Math.random() * 1000) + 100,
      cpu: Math.floor(Math.random() * 50) + 30
    }));
  }
  return mockDatabases;
}

// API处理
function handleApi(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  // 获取数据库列表
  if (pathname === '/api/databases') {
    res.writeHead(200);
    res.end(JSON.stringify({ success: true, data: getDatabases() }));
    return;
  }
  
  // 获取单个数据库详情
  if (pathname === '/api/database' && parsedUrl.query.id) {
    const dbs = getDatabases();
    const db = dbs.find(d => d.id === parsedUrl.query.id);
    if (db) {
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, data: db }));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ success: false, message: '数据库不存在' }));
    }
    return;
  }
  
  // 测试数据库连接
  if (pathname === '/api/test' && parsedUrl.query.id) {
    const db = config.databases.find(d => d.id === parsedUrl.query.id) || mockDatabases.find(d => d.id === parsedUrl.query.id);
    if (!db) {
      res.writeHead(404);
      res.end(JSON.stringify({ success: false, message: '数据库不存在' }));
      return;
    }
    
    // 尝试真实连接
    if (pools[db.id]) {
      const start = Date.now();
      try {
        if (db.type === 'mysql') {
          pools[db.id].getConnection().then(conn => {
            conn.ping(() => {
              const latency = Date.now() - start;
              conn.release();
              res.writeHead(200);
              res.end(JSON.stringify({ success: true, message: `✅ ${db.name}\n\nIP: ${db.ip}:${db.port}\n连接成功! 延迟: ${latency}ms`, real: true }));
            });
          }).catch(err => {
            res.writeHead(200);
            res.end(JSON.stringify({ success: false, message: `❌ ${db.name}\n\nIP: ${db.ip}:${db.port}\n连接失败: ${err.message}`, real: false }));
          });
          return;
        }
      } catch (e) {}
    }
    
    // 模拟连接测试
    const delay = Math.floor(Math.random() * 300 + 50);
    setTimeout(() => {
      const success = Math.random() > 0.2;
      res.writeHead(200);
      res.end(JSON.stringify({ 
        success: success,
        message: success 
          ? `✅ ${db.name}\n\nIP: ${db.ip}:${db.port}\n连接成功! 延迟: ${delay}ms\n\n⚠️ 模拟数据（配置密码后支持真实连接）`
          : `❌ ${db.name}\n\nIP: ${db.ip}:${db.port}\n连接失败: 连接超时`,
        real: false
      }));
    }, delay);
    return;
  }
  
  // 获取任务列表
  if (pathname === '/api/tasks') {
    res.writeHead(200);
    res.end(JSON.stringify({ success: true, data: mockTasks }));
    return;
  }
  
  // 获取告警列表
  if (pathname === '/api/alerts') {
    const alerts = config.alerts.length > 0 ? config.alerts : [
      { id: 1, level: 'critical', title: 'Oracle生产库连接数告警', desc: '当前连接数 195/200 (97.5%)', db: 'Oracle', time: '5分钟前' },
      { id: 2, level: 'warning', title: 'PG表空间使用率超标', desc: '使用率 85%', db: 'PostgreSQL', time: '30分钟前' }
    ];
    res.writeHead(200);
    res.end(JSON.stringify({ success: true, data: alerts }));
    return;
  }
  
  // AI对话
  if (pathname === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const { message } = JSON.parse(body);
      chatHistory.push({ role: 'user', content: message });
      
      const responses = [
        `收到你的问题："${message}"\n\n让我分析一下这个问题...\n\n根据你描述的情况，我建议：\n1. 检查数据库连接状态\n2. 查看最近的操作日志\n3. 确认是否有锁表或慢查询`,
        `关于"${message}"，这是一个很好的问题。\n\n从DBA的角度，我建议：\n- 首先确认业务影响范围\n- 检查相关数据库指标\n- 如需紧急处理，可以联系值班DBA`,
        `收到！针对"${message}"\n\n我可以帮你：\n① 生成诊断SQL\n② 提供优化建议\n③ 制定解决方案\n\n需要我立即执行吗？`
      ];
      const response = responses[Math.floor(Math.random() * responses.length)];
      chatHistory.push({ role: 'ai', content: response });
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, response, history: chatHistory }));
    });
    return;
  }
  
  // 获取聊天历史
  if (pathname === '/api/chat/history') {
    res.writeHead(200);
    res.end(JSON.stringify({ success: true, history: chatHistory }));
    return;
  }
  
  // 执行SQL
  if (pathname === '/api/sql/execute' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      const { sql, database } = JSON.parse(body);
      const db = config.databases.find(d => d.id === database) || mockDatabases.find(d => d.id === database);
      
      // 尝试真实执行
      if (pools[db?.id] && db) {
        try {
          if (db.type === 'mysql') {
            const [rows] = await pools[db.id].execute(sql);
            res.writeHead(200);
            res.end(JSON.stringify({ success: true, rows, message: '执行成功', real: true }));
            return;
          }
        } catch (e) {
          res.writeHead(200);
          res.end(JSON.stringify({ success: false, message: `执行失败: ${e.message}`, real: true }));
          return;
        }
      }
      
      // 模拟结果
      const result = {
        success: true,
        database: db ? db.name : 'Unknown',
        ip: db ? `${db.ip}:${db.port}` : 'N/A',
        columns: ['id', 'name', 'status', 'created_at'],
        rows: [[1, 'test_table_1', 'active', '2026-03-10'], [2, 'test_table_2', 'active', '2026-03-11'], [3, 'test_table_3', 'inactive', '2026-03-12']],
        affectedRows: 3,
        executionTime: `${(Math.random() * 2 + 0.01).toFixed(2)}s`,
        real: false
      };
      res.writeHead(200);
      res.end(JSON.stringify(result));
    });
    return;
  }
  
  // 监控数据
  if (pathname === '/api/monitor') {
    const dbs = getDatabases();
    const monitorData = dbs.map(db => ({
      ...db,
      connections: Math.floor(Math.random() * 50) + 50,
      qps: Math.floor(Math.random() * 1000) + 100,
      cpu: Math.floor(Math.random() * 40) + 30
    }));
    res.writeHead(200);
    res.end(JSON.stringify({ success: true, data: monitorData }));
    return;
  }
  
  res.writeHead(404);
  res.end(JSON.stringify({ success: false, message: 'API not found' }));
}

// 静态文件服务
function serveStatic(req, res) {
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;
  if (pathname === '/') pathname = '/index.html';
  const ext = path.extname(pathname);
  const contentTypes = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.json': 'application/json' };
  const filePath = path.join(__dirname, pathname);
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not Found'); return; }
    res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain' });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api/')) handleApi(req, res);
  else serveStatic(req, res);
});

server.listen(PORT, async () => {
  console.log(`\n🚀 DBA多AI协作系统服务已启动: http://localhost:${PORT}\n`);
  
  // 初始化连接池
  await initPools();
  
  console.log('\n📋 使用说明:');
  console.log('1. 编辑 config.json 添加真实数据库连接信息');
  console.log('2. 安装驱动: npm install mysql2 pg');
  console.log('3. 重启服务: node server.js\n');
});
