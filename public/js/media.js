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
//解析对象
class ParseLrc{
    constructor(){
        this.CONTENT_RE = /[^\[\]]+$/gi;
        this.M_RE      = /.\:/i;
        this.S_RE      = /.{2}\..{2}/i;
    }
    _getLrcTime(lrc){
        return (parseInt(lrc.match(this.M_RE)) * 60) + parseInt(lrc.match(this.S_RE));
    }
    _getLrcContent(lrc){
        return lrc.match(this.CONTENT_RE);
    }
    parseLrc(text = String){
        let lrcLines = text.split(/\n/g),
            lrcContentMap = {};
        lrcLines.forEach((lrc) => {
            let [time, content] = [
                this._getLrcTime(lrc),
                this._getLrcContent(lrc)
            ];
            lrcContentMap[time] = content;
        });
        return lrcContentMap;
    }
}
//歌词对象
class Lrc extends ParseLrc{
    constructor(parent = Element){
        super();
        this.showElement = parent;
    }
    _renderLrcChild(textLrcs = Object, childName = String){
        let nodes = {};
        for(let time in textLrcs){
            nodes[time] = document.createElement(childName);
            nodes[time].innerText = textLrcs[time];
        }
        return this.nodes = nodes;
    }
    render(text = String, childName = 'li'){
        let textLrcs = this.parseLrc(text),
            nodes    = this._renderLrcChild(textLrcs, childName);
        for(let time in nodes){
            this.showElement.appendChild(nodes[time]);
        }
        return [
            textLrcs,
            nodes
        ];
    }
}
function createAudioContext(audio = Element){
    let ctx = new AudioContext(),
        source = ctx.createMediaElementSource(audio),
        analyser = ctx.createAnalyser();
    source.connect(analyser);
    analyser.connect(ctx.destination);
    return [ctx, source, analyser];
}