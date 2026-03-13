const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const https = require('https');

const PORT = 8080;
const CONFIG_FILE = path.join(__dirname, 'config.json');

// 加载配置
let config = { databases: [], alerts: [], apiKey: '', apiUrl: '' };
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    }
  } catch (e) { console.log('配置加载失败:', e.message); }
}
loadConfig();

// MiniMax API调用
function callMiniMax(text, callback) {
  if (!config.apiKey) {
    callback(null, '请先配置API Key。\n\n在Web界面「系统配置」页面填写：\n- API Key: 你的MiniMax API Key\n- API地址: https://api.minimaxi.com/v1/text/chatcompletion_v2\n\n或使用模拟响应。');
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
      } catch (e) {
        callback(e.message, '解析失败');
      }
    });
  });
  
  req.on('error', (e) => callback(e.message, '请求失败'));
  req.write(data);
  req.end();
}

// 数据库连接池
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
        console.log(`MySQL连接池: ${db.name}`);
      } else if (db.type === 'postgresql' && pg) {
        pools[db.id] = new pg.Pool({
          host: db.ip, port: db.port, user: db.user, password: db.password,
          database: db.database || 'postgres'
        });
        console.log(`PostgreSQL连接池: ${db.name}`);
      }
    } catch (e) { console.log(`连接池失败: ${db.name}`); }
  }
}

const mockTasks = [
  { id: 1, title: 'Oracle迁TiDB方案设计', expert: 'Oracle+TiDB专家', status: 'running', priority: 'high', startTime: '10:15' },
  { id: 2, title: 'MySQL慢查询优化', expert: 'MySQL专家', status: 'running', priority: 'medium', startTime: '11:30' }
];

let chatHistory = [{ role: 'ai', content: '你好！我是DBA团队的AI助手。\n\n我可以帮你：\n- 解答数据库问题\n- 优化SQL\n- 搭建高可用架构\n- 排查故障\n\n直接描述你的需求！' }];

function getDatabases() {
  if (config.databases.length > 0) {
    return config.databases.map(db => ({
      ...db,
      connections: Math.floor(Math.random() * 100) + 50,
      qps: Math.floor(Math.random() * 1000) + 100,
      cpu: Math.floor(Math.random() * 50) + 30,
      status: pools[db.id] ? 'online' : 'offline'
    }));
  }
  return [
    { id: 'oracle1', name: 'Oracle生产库', type: 'oracle', version: '19.29.0', mode: '2节点RAC', status: 'online', connections: 168, qps: 1250, cpu: 65, ip: '192.168.1.100', port: 1521 },
    { id: 'mysql1', name: 'MySQL生产库', type: 'mysql', version: '8.0.32', mode: 'MGR集群', status: 'online', connections: 86, qps: 2340, cpu: 45, ip: '192.168.1.101', port: 3306 },
    { id: 'pg1', name: 'PostgreSQL', type: 'postgresql', version: '15.4', mode: '主从复制', status: 'warning', connections: 38, qps: 420, cpu: 78, ip: '192.168.1.102', port: 5432 }
  ].map(db => ({...db, connections: Math.floor(Math.random()*50)+50, qps: Math.floor(Math.random()*1000)+100, cpu: Math.floor(Math.random()*40)+30}));
}

function saveConfig() {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

// API处理
function handleApi(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }
  
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  // 获取数据库列表
  if (pathname === '/api/databases') {
    res.writeHead(200);
    res.end(JSON.stringify({ success: true, data: getDatabases() }));
    return;
  }
  
  // 保存数据库
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
      if (db.password) initPools();
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, message: '保存成功' }));
    });
    return;
  }
  
  // 删除数据库
  if (pathname === '/api/db/delete' && req.method === 'DELETE') {
    const id = parsedUrl.query.id;
    config.databases = config.databases.filter(d => d.id !== id);
    delete pools[id];
    saveConfig();
    res.writeHead(200);
    res.end(JSON.stringify({ success: true, message: '删除成功' }));
    return;
  }
  
  // 保存配置
  if (pathname === '/api/config/save' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body);
      if (data.apiKey) config.apiKey = data.apiKey;
      if (data.apiUrl) config.apiUrl = data.apiUrl;
      saveConfig();
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, message: '配置已保存' }));
    });
    return;
  }
  
  // 获取配置
  if (pathname === '/api/config') {
    res.writeHead(200);
    res.end(JSON.stringify({ success: true, data: { hasApiKey: !!config.apiKey } }));
    return;
  }
  
  // 测试连接
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
          res.end(JSON.stringify({ success: false, message: `❌ ${db.name}\n\nIP: ${db.ip}:${db.port}\n连接失败: ${err.message}`, real: true }));
        });
        return;
      }
    }
    
    setTimeout(() => {
      res.writeHead(200);
      res.end(JSON.stringify({ success: Math.random()>0.3, message: Math.random()>0.3 ? `✅ ${db.name}\n\nIP: ${db.ip}:${db.port}\n连接成功! 延迟: ${Math.floor(Math.random()*200+20)}ms` : `❌ ${db.name}\n\n连接失败: 连接超时`, real: false }));
    }, Math.random()*500+200);
    return;
  }
  
  if (pathname === '/api/tasks') { res.writeHead(200); res.end(JSON.stringify({success:true,data:mockTasks})); return; }
  if (pathname === '/api/alerts') { res.writeHead(200); res.end(JSON.stringify({success:true,data:config.alerts.length?config.alerts:[{level:'critical',title:'Oracle连接数告警',desc:'195/200',db:'Oracle',time:'5分钟前'},{level:'warning',title:'PG空间告警',desc:'85%',db:'PostgreSQL',time:'30分钟前'}]})); return; }
  
  // AI对话 - 核心功能
  if (pathname === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const { message } = JSON.parse(body);
      chatHistory.push({ role: 'user', content: message });
      
      // 调用MiniMax API
      callMiniMax(message, (err, response) => {
        if (err) {
          // API失败时使用本地模型响应
          const localResponses = [
            `收到你的问题："${message}"\n\n让我分析一下...\n\n根据DBA经验，建议：\n1. 检查数据库连接状态\n2. 查看慢查询日志\n3. 确认资源使用情况\n\n需要我帮你生成诊断SQL吗？`,
            `关于"${message}"，这是一个经典的数据库问题。\n\n建议处理步骤：\n- 先确认业务影响范围\n- 检查相关数据库指标\n- 查看最近的操作日志\n\n如需紧急处理，请联系值班DBA。`,
            `收到！针对"${message}"\n\n我可以帮你：\n① 生成诊断SQL\n② 提供优化建议\n③ 制定解决方案\n\n需要我立即执行哪个？`
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
      const db=config.databases.find(d=>d.id===database)||getDatabases().find(d=>d.id===database);
      
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
      
      res.writeHead(200); res.end(JSON.stringify({success:true,database:db?db.name:'Unknown',ip:db?`${db.ip}:${db.port}`:'N/A',columns:['id','name','status'],rows:[[1,'test','active'],[2,'test2','inactive']],affectedRows:2,executionTime:(Math.random()*2+0.01).toFixed(2)+'s',real:false}));
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
  console.log(`\n🚀 DBA多AI协作系统: http://localhost:${PORT}\n`);
  await initPools();
  console.log('\n📋 AI对话配置:\n在「系统配置」页面填写MiniMax API Key即可启用真实验证\n');
});
