const http = require('http');
const fs = require('fs');
const httpProxy = require('http-proxy');
const request = require('request');
const zlib = require('zlib');
const url = require('url');
const path = require('path');

const proxy = httpProxy.createProxyServer({
    target: {
        host: 'localhost',
        port: 9009,
    },
    ssl: {
        key: fs.readFileSync(path.join(__dirname, 'config/localhost-privkey.pem'), 'utf8'),
        cert: fs.readFileSync(path.join(__dirname, 'config/localhost-cert.pem'), 'utf8')
    }
});


const server = http.createServer(function(req,res) {
    // Map a whole directory with your local one. For example all javascript files
    const fileBuffers = [];
    switch(true) {
        case /assets/.test(req.url):
            // parse URL
            const parsedUrl = url.parse(req.url);
            // extract URL path
            let pathname = `.${parsedUrl.pathname}`;
            let filename = path.basename(pathname);
            let localFile = path.join(__dirname, `/assets/${filename}`);
            // based on the URL path, extract the file extention. e.g. .js, .doc, ...
            const ext = path.parse(pathname).ext;
            const map = {
                '.ico': 'image/x-icon',
                '.html': 'text/html',
                '.js': 'text/javascript',
                '.json': 'application/json',
                '.css': 'text/css',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.wav': 'audio/wav',
                '.mp3': 'audio/mpeg',
                '.svg': 'image/svg+xml',
                '.pdf': 'application/pdf',
                '.doc': 'application/msword'
              };

              fs.exists(localFile, function (exist) {
                if(!exist) {
                  // if the file is not found, return 404
                  res.statusCode = 404;
                  res.end(`File ${pathname} not found!`);
                  return;
                }
            
                fileBuffers[filename] = fs.readFileSync(localFile);
                res.writeHead(200, { 'Content-Type': map[ext], 'Content-Encoding': 'gzip' });
                zlib.gzip(fileBuffers[filename], function (_, result) {   // The callback will give you the 
                    res.end(result);                        // result, so just send it.
                });
              });
            break;
        default: 
        break;
    }
    switch(req.url) {
        case '/':
            fs.readFile(path.join(__dirname, 'html/index.html'), function(error, pgResp) {
                if (error){
                    res.writeHead(404);
                    res.write('Contents you are looking are not found');
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write(pgResp);
                }
    
                res.end();
            });
            break;
        case '/css/home.css':
            let bufferAppCSS = fs.readFileSync(path.join(__dirname, 'assets/home.css'));
            res.writeHead(200, { 'Content-Type': 'text/css', 'Content-Encoding': 'gzip', 'Cache-Control': 'max-age=86400' });
            zlib.gzip(bufferAppCSS, function (_, result) { // The callback will give you the 
                res.end(result); // result, so just send it.
            });
            break;
        default:
            try {
                const stream = request({
                    method: req.method,
                    url: `https://github.com/${req.url}` // redirect all other request to this url.
                });
                stream.pipe(res);
                } catch(e) {
                    res.writeHead(404);
                    res.write('Cannot find what you are looking for');
                }
            break;
    }   
});

console.log('listening on port 8443');
proxy.listen(8443);
server.listen(9009);