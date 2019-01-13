const express = require('express');
const url     = require('url');
const util    = require('util');
const fs      = require('fs');
const kugou   = require('./lib/kugou').kugou;
let app = express();
let format = (function(){
    return {
        query(queryData = Object){
            let newData = {
                info: queryData.data.info
            };
            return newData;
        },
        song(songData = Object){
            let newData = {
                play_url: songData.data.play_url,
                lyrics: songData.data.lyrics,
                img: songData.data.img,
                audio_name: songData.data.audio_name
            };
            return newData;
        },
        start(buffer = Buffer, res = Object, option = String){
            let data = JSON.parse(buffer.toString());
                data = JSON.stringify(this[option](data));
            res.end(data);
        }
    };
})();
app.use('/public', express.static('public'));
app.get('/', (req, res) => {
    const stream = fs.createReadStream('index.html', {encoding:'utf-8'});
    res.writeHead(200, {'Content-type':'text/html; charset=utf-8'});
    stream.pipe(res);
});
app.get('/song', (req, res) => {
    let params = url.parse(req.url, true).query;
    kugou.get({
        value: params.value,
        optionName: params.option
    }, (buffer) => {
        res.writeHead(200, {'Content-type':'application/json;charset=utf-8'});
        format.start(buffer, res, params.option);
    });
});
app.get('/getSongData', (req, res) => {
    let songUrl = url.parse(req.url, true).query.songUrl.replace('////', '//');
    console.log(req.url);
    kugou.getSongData(songUrl).
        then((buf) => {
            res.writeHead(200, {'Content-type': 'audio/mpeg',
                                    'Accept-Ranges': 'bytes',
                                    'Content-length': buf.length});
            res.end(buf);
        }).catch(err => {
            console.log(err);
        });
});
app.listen(8078, () => {
    console.log('listen 80');
});
