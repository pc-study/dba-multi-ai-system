const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const CONFIG_FILE = path.join(__dirname, 'config.json');

// 加载配置
let config = { databases: [], alerts: [] };
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    }
  } catch (e) { console.log('配置加载失败:', e.message); }
}
loadConfig();

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
    } catch (e) { console.log(`连接池失败: ${db.name} - ${e.message}`); }
  }
}

// 模拟数据
const mockDatabases = [
  { id: 'oracle1', name: 'Oracle生产库', type: 'oracle', version: '19.29.0', mode: '2节点RAC', status: 'online', connections: 168, qps: 1250, cpu: 65, ip: '192.168.1.100', port: 1521 },
  { id: 'mysql1', name: 'MySQL生产库', type: 'mysql', version: '8.0.32', mode: 'MGR集群', status: 'online', connections: 86, qps: 2340, cpu: 45, ip: '192.168.1.101', port: 3306 },
  { id: 'pg1', name: 'PostgreSQL', type: 'postgresql', version: '15.4', mode: '主从复制', status: 'warning', connections: 38, qps: 420, cpu: 78, ip: '192.168.1.102', port: 5432 }
];

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
  return mockDatabases.map(db => ({...db, connections: Math.floor(Math.random()*50)+50, qps: Math.floor(Math.random()*1000)+100, cpu: Math.floor(Math.random()*40)+30}));
}

// 保存配置
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
      
      // 重新初始化连接池
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
  
  // 测试连接
  if (pathname === '/api/test' && parsedUrl.query.id) {
    const db = config.databases.find(d => d.id === parsedUrl.query.id) || mockDatabases.find(d => d.id === parsedUrl.query.id);
    if (!db) { res.writeHead(404); res.end(JSON.stringify({success:false,message:'数据库不存在'})); return; }
    
    if (pools[db.id]) {
      const start = Date.now();
      try {
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
      } catch (e) {}
    }
    
    // 模拟
    setTimeout(() => {
      res.writeHead(200);
      res.end(JSON.stringify({ success: Math.random()>0.3, message: Math.random()>0.3 ? `✅ ${db.name}\n\nIP: ${db.ip}:${db.port}\n连接成功! 延迟: ${Math.floor(Math.random()*200+20)}ms` : `❌ ${db.name}\n\nIP: ${db.ip}:${db.port}\n连接失败: 连接超时`, real: false }));
    }, Math.random()*500+200);
    return;
  }
  
  if (pathname === '/api/tasks') { res.writeHead(200); res.end(JSON.stringify({success:true,data:mockTasks})); return; }
  if (pathname === '/api/alerts') { res.writeHead(200); res.end(JSON.stringify({success:true,data:config.alerts.length?config.alerts:[{level:'critical',title:'Oracle连接数告警',desc:'195/200',db:'Oracle',time:'5分钟前'},{level:'warning',title:'PG空间告警',desc:'85%',db:'PostgreSQL',time:'30分钟前'}]})); return; }
  
  if (pathname === '/api/chat' && req.method === 'POST') {
    let body = ''; req.on('data',c=>body+=c); req.on('end',()=>{
      const {message}=JSON.parse(body);
      chatHistory.push({role:'user',content:message});
      const responses=['收到！让我分析一下这个问题...\n\n建议：\n1. 检查连接状态\n2. 查看慢查询日志\n3. 确认资源使用情况','关于'+message+'，这是一个好问题。\n\n从DBA角度建议：\n- 检查相关指标\n- 查看最近日志\n- 如需紧急处理请联系值班DBA'];
      const response=responses[Math.floor(Math.random()*responses.length)];
      chatHistory.push({role:'ai',content:response});
      res.writeHead(200); res.end(JSON.stringify({success:true,response,history:chatHistory}));
    }); return;
  }
  
  if (pathname === '/api/chat/history') { res.writeHead(200); res.end(JSON.stringify({success:true,history:chatHistory})); return; }
  
  if (pathname === '/api/sql/execute' && req.method === 'POST') {
    let body=''; req.on('data',c=>body+=c); req.on('end',async()=>{
      const {sql,database}=JSON.parse(body);
      const db=config.databases.find(d=>d.id===database)||mockDatabases.find(d=>d.id===database);
      
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
  
  if (pathname === '/api/monitor') {
    res.writeHead(200);
    res.end(JSON.stringify({success:true,data:getDatabases()}));
    return;
  }
  
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
  console.log('\n📋 使用说明:\n1. 在"数据库"页面点击"添加数据库"\n2. 填写IP、端口、用户名、密码\n3. 保存后即可测试连接和执行SQL\n');
});
