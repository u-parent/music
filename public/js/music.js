

class SoundVisual{
	constructor(ctx, analyser, w, h, bar = 1000, barStyle = 'rgba(10, 10, 10, .3)'){
		this.ctx = ctx;
		this.analyser = analyser;
		this.run	  = true;
		this.bar 	  = bar;
		this.barStyle = barStyle;
		this.buffer   = null;
		this.w    	  = w;
		this.h		  = h;
		this.drawState = null;
	}
	_getBufferData(){
		if(this.run){
			this.buffer = new Uint8Array(this.analyser.frequencyBinCount);
			this.analyser.getByteFrequencyData(this.buffer);
		}else{
			;
		}
	}
	startDraw(draw = () => {}){
		let that = this;
		let animation = () => {
			that.drawState = requestAnimationFrame(animation);
			that._getBufferData();
			that.ctx.fillStyle = that.barStyle;
			draw(that.buffer, that.ctx, that.w, that.h, that.bar, that.analyser);
		};
		animation();
	}
	changeDraw(draw = null){
		if(draw == null){
			return false;
		}
		cancelAnimationFrame(this.drawState);
		let that = this;
		let animation = () => {
			that.drawState = requestAnimationFrame(animation);
			that._getBufferData();
			that.ctx.clearRect(0, 0, that.w, that.h);
			that.ctx.fillStyle = that.barStyle;
			draw(that.buffer, that.ctx, that.w, that.h, that.bar, that.analyser);
		};
		return true;
	}
}
let soundVisual = (function(){
	let sound = null;
	return (analyser = null, canvas = null, callback = Function) => {
		if(sound == null){
			let ctx = canvas.getContext('2d');
			sound = new SoundVisual(ctx, analyser, canvas.width, canvas.height);
			sound.startDraw(callback);
		}else{
			sound.analyser = analyser;
		}
		return sound;
	};
})();
let EventUtil = (function(){
	let clientList = {};
	return {
		addEvent(el, type, handle){
			if(el.addEventListener){
				EventUtil.addEvent = (el, type, handle) => {
					el.addEventListener(type, handle);
				};
			}else if(el.attachEvent){
				EventUtil.addEvent = (el, type, handle) => {
					el.attachEvent('on' + type, handle);
				};
			}else{
				EventUtil.addEvent = (el, type, handle) => {
					el['on' + type] = handle;
				};
			}
			this.addEvent(el, type, handle);
		},
		getEvent(e){
			return e || window.event;
		},
		getTarget(e){
			return e.target || e.srcElement;
		},
		listen(key = String, func = String){
			if(!clientList[key]){
				clientList[key] = [];
			}
			clientList[key].push(func);
		},
		tirgger(key = String){
			let fns = clientList[key];
			if(!fns || fns.length === 0){
				return false;
			}
			for(let i = 0; i < fns.length; i++){
				fns[i].apply(this, arguments);
			}
		}
	};
})();
function ajaxGetData(url = String){
	return new Promise((resolve, reject) => {
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = () => {
			if(xhr.status == 200 && xhr.readyState == 4){
				resolve(xhr.responseText);
			}
		};
		xhr.open('GET', url, true);
		xhr.send(null);
	});
}
let k = (function(){
	return {
		getSongInfo(o = Object){
			return new Promise((resolve, reject) => {
				let url = `/song?value=${encodeURIComponent(o.value)}&option=${o.option}`;
				ajaxGetData(url).
					then(value => {
						resolve(value);
					});
			});
		},
		getSongData(url = String){
			return new Promise((resolve, reject) => {
				let xhr = new XMLHttpRequest();
				xhr.responseType = 'arraybuffer';
				xhr.onload = () => {
					resolve(xhr.response);
				}
				console.log(url);
				xhr.open('GET', `/getSongData?songUrl=${url}`, true);
				xhr.send(null);
			});
		},
		enUrl(url = String){
			return `/getSongData?songUrl=${url}`;
		}
	}
})();
class SongList{
	constructor(songList = Array){
		this.index = 0;
		this.songList = songList;
	}
	query(name = String){
		let song = null;
		this.songList.forEach((s) => {
			if(s.filename === name){
				song = s;
				this.index = this.songList.indexOf(s);
			}
		});
		return song; 
	}
	getSong(flag = String){
		let s = null,
			i = this.index;
		switch(flag){
			case 'n':
				s = this.songList[++i];
			break;
			case 'p':
				s = this.songList[--i];
			break;
			default:
				i = Math.random() * this.songList.length;
				s = this.songList[i];
			break;
		}
		if(s !== undefined){
			this.index = i;
		}
		return s;
	}
}
class MusicLib{
	constructor(){
		this.si = {};
		this.ss = {};
	}
	getSongList(sName = String){
		let sList = this.ss[sName];
		if(sList === undefined){
			console.log('find not song');
		}
		return sList;
	}
	addList(name = String, list = Array){
		let list_ = null;
		if(this.ss[name] !== undefined){
			list_ = this.ss[name];
		}else{
			list_ = this.ss[name] = new SongList(list)
		}
		return list;
	}
	removeList(name){
		let list = null;
		if(this.ss[name] === undefined){
			list = false;
		}else{
			list = this.ss[name];
			this.ss[name] = null;
		}
		return list;
	}
}
let l = (function(){
	let lyric = new Lyric();
	return {
		renderLyric(showParent = Element, lyrics = String){
			let lyricNodeMap = lyric.render(lyric.parseLrc(lyrics));
			for(let time in lyricNodeMap){
				showParent.appendChild(lyricNodeMap[time]);
			}
			return lyricNodeMap;
		}
	}
})();