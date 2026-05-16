const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8765;

const server = http.createServer((req, res) => {
  if (req.url === '/api/save-static-data' && req.method === 'POST') {
    let body = '';
    
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        const staticDataPath = path.join(__dirname, 'src', 'data', 'staticData.ts');
        
        fs.writeFileSync(staticDataPath, parsed.content, 'utf8');
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: '数据已保存' }));
        console.log('✅ 数据已成功保存到 staticData.ts');
      } catch (e) {
        console.error('❌ 保存失败:', e);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: '保存失败' }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log('🚀 后端服务器已启动，端口:', PORT);
  console.log('   等待保存数据请求...');
});
