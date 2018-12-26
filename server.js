const express = require('express');
const url     = require('url');
const util    = require('util');
const fs      = require('fs');
const kugou   = require('./lib/kugou');
let app = express();
app.use('/public', express.static('public'));
app.get('/', (req, res) => {
    const stream = fs.createReadStream('index.html', {encoding:'utf-8'});
    res.writeHead(200, {'Content-type':'text/html; charset=utf-8'});
    stream.pipe(res);
});
app.get('/search', (req, res) => {
    let params = url.parse(req.url, true).query;
    kugou.get({
        name: params.value,
        optionName: params.option
    }, (songListData) => {
       res.writeHead(200, {'Content-type':'application/json;charset=utf-8'});
       res.end(songListData.toString());
    });
});
app.get('/getSongInfo', (req, res) => {
    let params = url.parse(req.url, true).query;
    kugou.get({
        hash: params.value,
        optionName: params.option
    }, (songData) => {
        res.writeHead(200, {'Content-type':'application/json;charset=utf-8'});
        res.end(songData.toString());
    });
});
app.get('/getSongData', (req, res) => {
    let songUrl = url.parse(req.url, true).query.songUrl.replace('////', '//');
    kugou.getSongData(songUrl).
        then((buf) => {
            res.writeHead(200, {'Content-type': 'audio/mpeg'});
            res.end(buf);
        }).catch(err => {
            console.log(err);
        });
});
app.listen(8080, () => {
    console.log('listen 80');
});
