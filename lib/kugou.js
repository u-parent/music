const zlib = require('zlib');
const http = require('http');
const fs   = require('fs');
function unGzip(buffer = Buffer){
    return new Promise((resolve, reject) => {
        zlib.unzip(buffer, (err, result) => {
            if(!err){
                resolve(result);
            }else{
                reject(err);
            }
        });
    });
}
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
            options.path = `/api/v3/search/song?format=json&keyword=${encodeURIComponent(o.value)}`;
        break;
        case 'song':
            options.hostname = `www.kugou.com`;
            options.path = `/yy/index.php?r=play/getdata&hash=${o.value}`;
        break;
    }
    return options;
}
let cache = (function(){
    let cacheData = {};
    return {
        query(url = String){
            let data = cacheData[url];
            if(data === undefined){
                return false;
            }
            return data;
        },
        add(url = String, data){
            return cacheData[url] = data;
        }
    }
})();
class KuGou{
    constructor(http = Object){
        this.server = http;
    }
    get(o = {
        value: String,
        optionName: 'query'
    }, callBack = Function){
        this.server.get(getKuGouOptions(o), (req, res) => {
            let buf = [];
            req.on('data', (chunk) => {
                buf.push(chunk);
            });
            req.on('end', () => {
                buf = Buffer.concat(buf);
                unGzip(buf).then((data) => {
                    callBack(data);
                }).catch((err) => {throw new Error(err)});
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
let kugou = (function(){
    let k = new KuGou(http);
    return {
        get(o = Object, callback = Function){
            let url = o.value + o.option;
            if(cache.query(url)){
                callback(cache.query(url));
                return true;
            }
            k.get(o, (data) => {
                cache.add(url, data);
                callback(data);
            });
        },
        getSongData(url = String){
            console.log(url);
            return new Promise((resolve, reject) => {
                if(cache.query(url)){
                    resolve(cache.query(url));
                    return true;
                }
                k.getSongData(url)
                    .then((data) => {
                        cache.add(url, data);
                        resolve(data);
                    }).catch((err) => {
                        reject(err);
                    });

            });
        },
        downloadSong(url = String, storePath = String){
            this.getSongData(url)
                .then((data) => {
                    fs.writeFile(storePath, data, (err) => {throw new Error(err);});
                })
                .catch((err) => {throw new Error(err);});
        }
    }
})
exports.KuGou = KuGou;
exports.kugou = kugou();
