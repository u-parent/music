function ajaxGetSongData(url){
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.responseType = 'arraybuffer';
        EventUtil.addEvent(xhr, 'load', () => {
            resolve(xhr.response);
        });
        xhr.open('GET', url, true);
        xhr.send(null);
    });
}
class Media{
    constructor(){
        this.buffer = null;
        this.isPlay = true;
    }
    _emtry(){
        this.pause();
        this.ctx = null;
        this.source = null;
        this.analyser = null;
    }
    decode(buffer = Blob){
        return new Promise((resolve, reject) => {
            if(this.ctx !== undefined){
                this._emtry();
            }
            this.ctx = new (AudioContext || webkitAudioContext)();
            this.source = this.ctx.createBufferSource();
            this.ctx.decodeAudioData(buffer).
                then((data) => {
                    this.buffer = buffer;
                    this.source.buffer = data;
                    this.analyser = this.ctx.createAnalyser();
                    this.source.connect(this.analyser);
                    this.analyser.connect(this.ctx.destination);
                    this.source.start(0);
                    this.isPlay = true;
                    resolve();
                });
        });

    }
    play(){
        if(this.analyser !== undefined){
            this.analyser.connect(this.ctx.destination);
            return this.isPlay = true;
        }
    }
    pause(){
        if(this.analyser !== undefined){
            this.analyser.disconnect(this.ctx.destination);
            return this.isPlay = false;
        }
    }
}
function readLocalFile(file, rState = 'o'){
    return new Promise((resolve, reject) => {
        let r = new FileReader();
        r.addEventListener('load', (e) => {
            resolve(e.target.result);
        });
        switch(rState){
            case 'o':
                r.readAsArrayBuffer(file);
            break;
            case 'u':
                r.readAsDataURL(file);
            break;
            case 't':
                r.readAsText(file);
            break;
            default:
                reject(`rstate is not ${rState}`);
        }
        
    });
}
class Lyric{
    parseLrc(text = String){
        let lyrics = text.split(/\n/g),
            lyricMap = {};
        lyrics.forEach((lyric) => {
            let [m, s] = [
                parseInt(lyric.match(/.\:/i)),
                parseInt(lyric.match(/.{2}\..{2}/i))
            ];
            let text = lyric.match(/[^\[\]]+$/gi),
                time = m * 60 + s;
            lyricMap[time] = text;
        });
        return lyricMap;
    }
    render(lyricMap = Object, showNodeName = 'li'){
        this.nodeMap = {};
        for(let time in lyricMap){
            let n = document.createElement(showNodeName);
            n.innerText = lyricMap[time];
            this.nodeMap[time] = n;
        }
        return this.nodeMap;
    }
}