const fs = require('fs');
const http = require('http');
const mime = require('mime');
http.createServer((req, res) => {
    if(req.url == '/'){
        fs.readFile('./index.html', (err, data) => {
            res.writeHead(200, {'Content-type':'text/html; charset=utf-8'});
            res.end(data.toString());
        });
        console.log('s');   
    }else{
        let path = '.' + decodeURIComponent(req.url);
        fs.readFile(path, (err, data) => {
            if(err){
                console.log(err.code);
            }else{
                res.writeHead(200, {'Content-type': mime.getType(path),
                                    'Accept-Ranges':'bytes',
                                    'Content-length':data.byteLength});
                res.end(data);
            }
        });
        console.log(path);
    }
    console.log(req.url);
}).listen(80);