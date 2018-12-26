const zlib = require('zlib');
const http = require('http');
function getKuGouOptions(o){
    let options = {
        port:80,
        method:'GET',
        headers:{
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive',
            'Cache-Control': 'max-age=0',
            'Accept-Encoding': 'gzip',
            'Upgrade-Insecure-Requests': 1,
            'User-Agent':'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'
        }
    };
    switch(o.optionName){
        case 'query':
            options.hostname = 'mobilecdn.kugou.com';
            options.path = `/api/v3/search/song?format=json&keyword=${encodeURIComponent(o.name)}`;
        break;
        case 'song':
            options.hostname = `www.kugou.com`;
            options.path = `/yy/index.php?r=play/getdata&hash=${o.hash}`;
        break;
    }
    return options;
}

class KuGou{
    constructor(http = Object){
        this.server = http;
    }
    get(o = {
        name: '极乐净土',
        hash: '5dd8f4b0fb68415472136d961232421b',
        optionName: 'query'
    }, callBack = Function){
        this.server.get(getKuGouOptions(o), (req, res) => {
            let buf = [];
            req.on('data', (chunk) => {
                buf.push(chunk);
            });
            req.on('end', () => {
                buf = Buffer.concat(buf);
                zlib.unzip(buf, (er, data) => {
                    if(er){
                        console.log(er);
                        return false;
                    }
                    callBack(data);
                });
            });
        });
    }
    getSongData(url = String){
        return new Promise((resolve, reject) => {
            this.server.get(url, (req, res) => {
                let buf = [];
                req.on('data', (chunk) => {
                    buf.push(chunk);
                });
                req.on('end', () => {
                    buf = Buffer.concat(buf);
                    resolve(buf);
                });
            });
        });
    }
}
let kugouProxy = (function(){
    let kugou = null;
    return () => {
        if(kugou === null){
            kugou = new KuGou(http);
        }
        return kugou;
    };
})();

module.exports = kugouProxy();
