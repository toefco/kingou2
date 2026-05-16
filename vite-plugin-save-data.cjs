
const fs = require('fs');
const path = require('path');

module.exports = function saveDataPlugin() {
  return {
    name: 'save-data-plugin',
    configureServer(server) {
      server.middlewares.use(function(req, res, next) {
        if (req.url === '/api/save-static-data' && req.method === 'POST') {
          let body = '';
          
          req.on('data', function(chunk) {
            body += chunk.toString();
          });
          
          req.on('end', function() {
            try {
              const parsed = JSON.parse(body);
              const staticDataPath = path.join(process.cwd(), 'src', 'data', 'staticData.ts');
              
              fs.writeFileSync(staticDataPath, parsed.content, 'utf8');
              
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: '数据已保存' }));
            } catch (e) {
              console.error('保存失败:', e);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, message: '保存失败' }));
            }
          });
        } else {
          next();
        }
      });
    }
  };
}
