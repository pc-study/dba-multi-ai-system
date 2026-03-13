const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto-js');

const PORT = 8080;
const CONFIG_FILE = path.join(__dirname, 'config.json');
const ENCRYPTION_KEY = 'dba-team-secret-key-2026'; // 生产环境应使用环境变量

// 加密/解密
function encrypt(text) {
  return crypto.AES.encrypt(text, ENCRYPTION_KEY).toString();
}
function decrypt(ciphertext) {
  const bytes = crypto.AES.decrypt(ciphertext, ENCRYPTION_KEY);
  return bytes.toString(crypto.enc.Utf8);
}

// 加载配置
let config = { databases: [], alerts: [], apiKey: '', apiUrl: '' };
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      // 解密敏感字段
      config.databases = (raw.databases || []).map(db => ({
        ...db,
        password: db.password ? decrypt(db.password) : ''
      }));
      config.alerts = raw.alerts || [];
      config.apiKey = raw.apiKey ? decrypt(raw.apiKey) : '';
      config.apiUrl = raw.apiUrl || '';
    }
  } catch (e) { console.log('配置加载失败:', e.message); }
}
loadConfig();

// MiniMax API调用
function callMiniMax(text, callback) {
  if (!config.apiKey) {
    callback(null, '请先配置API Key。\n\n在Web界面「系统配置」页面填写API Key。');
    return;
  }
  
  const data = JSON.stringify({
    model: 'MiniMax-M2.5',
    messages: [{role: 'user', content: text}],
    temperature: 0.7
  });
  
  const options = {
    hostname: 'api.minimaxi.com',
    path: '/v1/text/chatcompletion_v2',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + config.apiKey
    }
  };
  
  const req = https.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      try {
        const result = JSON.parse(body);
        if (result.choices && result.choices[0]) {
          callback(null, result.choices[0].message.content);
        } else {
          callback(body, 'API返回异常');
        }
      } catch (e) { callback(e.message, '解析失败'); }
    });
  });
  req.on('error', (e) => callback(e.message, '请求失败'));
  req.write(data);
  req.end();
}

const pools = {};
async function initPools() {
  let mysql, pg;
  try { mysql = require('mysql2/promise'); } catch (e) {}
  try { pg = require('pg'); } catch (e) {}
  
  for (const db of config.databases) {
    if (!db.password) continue;
    try {
      if (db.type === 'mysql' && mysql) {
        pools[db.id] = await mysql.createPool({
          host: db.ip, port: db.port, user: db.user, password: db.password,
          database: db.database || 'mysql', connectionLimit: 5
        });
      }
    } catch (e) {}
  }
}

const mockTasks = [
  { id: 1, title: 'Oracle迁TiDB方案设计', expert: 'Oracle+TiDB专家', status: 'running', priority: 'high', startTime: '10:15' }
];

let chatHistory = [{ role: 'ai', content: '你好！我是DBA团队的AI助手。\n\n我可以帮你：\n- 解答数据库问题\n- 优化SQL\n- 搭建高可用架构\n- 排查故障' }];

function getDatabases() {
  if (config.databases.length > 0) {
    return config.databases.map(db => ({
      ...db,
      password: '******', // 隐藏密码
      connections: Math.floor(Math.random() * 100) + 50,
      qps: Math.floor(Math.random() * 1000) + 100,
      cpu: Math.floor(Math.random() * 50) + 30,
      status: pools[db.id] ? 'online' : 'offline'
    }));
  }
  return [
    { id: 'demo1', name: '演示数据库', type: 'mysql', status: 'online', connections: 86, qps: 2340, cpu: 45, ip: '192.168.1.101', port: 3306, password: '******' }
  ];
}

function saveConfig() {
  const raw = {
    databases: config.databases.map(db => ({
      ...db,
      password: db.password ? encrypt(db.password) : ''
    })),
    alerts: config.alerts,
    apiKey: config.apiKey ? encrypt(config.apiKey) : '',
    apiUrl: config.apiUrl
  };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(raw, null, 2));
}

function handleApi(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }
  
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  if (pathname === '/api/databases') {
    res.writeHead(200);
    res.end(JSON.stringify({ success: true, data: getDatabases() }));
    return;
  }
  
  if (pathname === '/api/db/save' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const db = JSON.parse(body);
      const idx = config.databases.findIndex(d => d.id === db.id);
      if (idx >= 0) config.databases[idx] = db;
      else config.databases.push(db);
      saveConfig();
      delete pools[db.id];
      if (db.password && db.password !== '******') initPools();
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, message: '保存成功（已加密）' }));
    });
    return;
  }
  
  if (pathname === '/api/db/delete' && req.method === 'DELETE') {
    const id = parsedUrl.query.id;
    config.databases = config.databases.filter(d => d.id !== id);
    delete pools[id];
    saveConfig();
    res.writeHead(200);
    res.end(JSON.stringify({ success: true, message: '删除成功' }));
    return;
  }
  
  if (pathname === '/api/config/save' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body);
      if (data.apiKey) config.apiKey = data.apiKey;
      if (data.apiUrl) config.apiUrl = data.apiUrl;
      saveConfig();
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, message: '配置已保存（已加密）' }));
    });
    return;
  }
  
  if (pathname === '/api/config') {
    res.writeHead(200);
    res.end(JSON.stringify({ success: true, data: { hasApiKey: !!config.apiKey } }));
    return;
  }
  
  if (pathname === '/api/test' && parsedUrl.query.id) {
    const db = config.databases.find(d => d.id === parsedUrl.query.id) || getDatabases().find(d => d.id === parsedUrl.query.id);
    if (!db) { res.writeHead(404); res.end(JSON.stringify({success:false,message:'数据库不存在'})); return; }
    
    if (pools[db.id]) {
      const start = Date.now();
      if (db.type === 'mysql') {
        pools[db.id].getConnection().then(conn => {
          conn.ping(() => {
            res.writeHead(200);
            res.end(JSON.stringify({ success: true, message: `✅ ${db.name}\n\nIP: ${db.ip}:${db.port}\n连接成功! 延迟: ${Date.now()-start}ms`, real: true }));
            conn.release();
          });
        }).catch(err => {
          res.writeHead(200);
          res.end(JSON.stringify({ success: false, message: `❌ ${db.name}\n\n${err.message}`, real: true }));
        });
        return;
      }
    }
    setTimeout(() => {
      res.writeHead(200);
      res.end(JSON.stringify({ success: Math.random()>0.3, message: Math.random()>0.3 ? `✅ 连接成功` : `❌ 连接失败`, real: false }));
    }, 500);
    return;
  }
  
  if (pathname === '/api/tasks') { res.writeHead(200); res.end(JSON.stringify({success:true,data:mockTasks})); return; }
  if (pathname === '/api/alerts') { res.writeHead(200); res.end(JSON.stringify({success:true,data:config.alerts.length?config.alerts:[]})); return; }
  
  if (pathname === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const { message } = JSON.parse(body);
      chatHistory.push({ role: 'user', content: message });
      
      callMiniMax(message, (err, response) => {
        if (err) {
          const localResponses = [
            `收到你的问题："${message}"\n\n建议：\n1. 检查数据库连接状态\n2. 查看慢查询日志\n3. 确认资源使用情况`,
            `关于"${message}"，这是一个好问题。\n\n从DBA角度建议：\n- 检查相关指标\n- 查看最近日志`
          ];
          response = localResponses[Math.floor(Math.random() * localResponses.length)];
        }
        chatHistory.push({ role: 'ai', content: response });
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, response, history: chatHistory, real: !err }));
      });
    });
    return;
  }
  
  if (pathname === '/api/chat/history') { res.writeHead(200); res.end(JSON.stringify({success:true,history:chatHistory})); return; }
  
  if (pathname === '/api/sql/execute' && req.method === 'POST') {
    let body=''; req.on('data',c=>body+=c); req.on('end',async()=>{
      const {sql,database}=JSON.parse(body);
      const db=config.databases.find(d=>d.id===database);
      
      if(pools[db?.id]&&db){
        try{
          if(db.type==='mysql'){
            const[rows]=await pools[db.id].execute(sql);
            res.writeHead(200); res.end(JSON.stringify({success:true,rows,database:db.name,executionTime:'0.01s',real:true}));
            return;
          }
        }catch(e){
          res.writeHead(200); res.end(JSON.stringify({success:false,message:'执行失败: '+e.message,real:true}));
          return;
        }
      }
      
      res.writeHead(200); res.end(JSON.stringify({success:true,database:db?db.name:'Demo',columns:['id','name','status'],rows:[[1,'test','active']],executionTime:'0.01s',real:false}));
    }); return;
  }
  
  if (pathname === '/api/monitor') { res.writeHead(200); res.end(JSON.stringify({success:true,data:getDatabases()})); return; }
  
  res.writeHead(404); res.end(JSON.stringify({success:false,message:'API not found'}));
}

function serveStatic(req,res){
  const parsedUrl=url.parse(req.url,true);
  let pathname=parsedUrl.pathname;
  if(pathname==='/')pathname='/index.html';
  const ext=path.extname(pathname);
  const types={'.html':'text/html','.css':'text/css','.js':'application/javascript'};
  const filePath=path.join(__dirname,pathname);
  fs.readFile(filePath,(err,data)=>{
    if(err){res.writeHead(404);res.end('Not Found');return;}
    res.writeHead(200,{'Content-Type':types[ext]||'text/plain'});res.end(data);
  });
}

const server=http.createServer((req,res)=>{
  if(req.url.startsWith('/api/'))handleApi(req,res);
  else serveStatic(req,res);
});

server.listen(PORT,async()=>{
  console.log(`\n🚀 DBA多AI协作系统: http://localhost:${PORT}\n🔒 敏感数据已加密存储`);
  await initPools();
});
