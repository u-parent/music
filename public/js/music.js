class SoundVisual{
	constructor(canvas = Element){
		this.analyser = null;
		this.canvas = canvas;
		this.status = true;
		this.ctx = canvas.getContext('2d');
		this.w = this.canvas.offsetWidth;
		this.h = this.canvas.offsetHeight;
	}
	get data(){
		this.data_ = new Uint8Array(this.analyser.frequencyBinCount);
		this.analyser.getByteFrequencyData(this.data_);
		return this.data_;
	}
	setDraw(draw = Function){
		this.draw = draw;
	}
	start(analyser = AnalyserNode){
		this.analyser = analyser;
		let d = () => {
			if(!this.status){
				d = () =>{};
			}
			this.draw(this.ctx, this.w, this.h, this.data);
			this.status = requestAnimationFrame(d);
		};
		d();
	}
	stop(){
		cancelAnimationFrame(this.status);
		this.status = false;
	}
}
class SongUrl{
	kInfo(o = Object){
		return `/song?value=${encodeURIComponent(o.value)}&option=${o.option}`;
	}
	kData(url = String){
		return `/getSongData?songUrl=${url}`;
	}
	getSongList(name = String){
		return new Promise((resolve, reject) => {
			$.getJSON(this.kInfo({value: name, option: 'query'}), (data) => {
				resolve(data.info);
			});
		});
	}
	getSongInfo(hash = String){
		return new Promise((resolve, reject) => {
			$.getJSON(this.kInfo({value: hash, option: 'song'}), (data) =>{
				resolve(data);
			});
		});
	}
}
//搜索结果
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
//歌曲库
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
			list_ = this.ss[name] = new SongList(list);
		}
		return list_;
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
//歌词对象代理
let lyric = (function(){
	let l = null;
	return (element = Element) => {
		if(!l){
			l = new Lrc(element);
		}
		return l;
	};
})();
//获取url
let url = (function(){
	let sUrl = null;
	return () => {
		if(!sUrl){
			sUrl = new SongUrl();
		}
		return sUrl;
	}
})();

let control = (function(){
	let audio = null,
		lrc	  = null,
		sound = null;
	let ss = new MusicLib(),
		su = new SongUrl();
	return {
		get su(){
			return su;
		},
		get lrc(){
			return lrc;
		},
		get audio(){
			return audio;
		},
		set lyric(value = Element){
			if(lyric.nodeType){
				lyric.showElement = value;
			}
			return lyric.showElement;
		},
		init(o){
			audio = o.audio;
			lrc   = lyric(o.lElement);
			sound = new SoundVisual(o.canvas);
			sound.setDraw(o.draw);
		},
		play(){
			audio.play();
			sound.start(this.analyser);
			this.playStatus = true;
		},
		pause(){
			sound.stop();
			audio.pause();
			this.playStatus = false;
		},
		toggle(flag = String){
			console.log(this.currentSongList);
			let song = this.currentSongList.getSong(flag);
			if(song !== undefined){
				this.currentSong = song;
			}
			return this;
		},
		querySong(name = String){
			let song = this.currentSongList.query(name);
			if(song !== undefined){
				this.currentSong = song;
			}
			return this;
		},
		getSongList(listName = String){
			return new Promise((resolve, reject) => {
				let list = ss.getSongList(listName);
				if(!list){
					su.getSongList(listName).then((list) => {
						this.addSongList(listName, list);
						resolve(list);
					});
				}else{
					resolve(list.songList);
				}
				this.currentSongList = list;
			});
		},
		addSongList(listName = String, list = Array){
			return this.currentSongList = ss.addList(listName, list);
		},
		setAudioSrc(hash = this.currentSong.hash){
			su.getSongInfo(hash).then((info) => {
				audio.src = su.kData(info.play_url);
				lrc.render(info.lyrics, 'li');
			});
			$('#lyric .lyric-list').empty();
		}
	}
})();