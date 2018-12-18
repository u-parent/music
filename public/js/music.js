{
	function ajaxGetData(url, async = true){
		return new Promise((resolve, reject) => {
			let xhr = new XMLHttpRequest();
			xhr.onreadystatechange = () => {
				if(xhr.readyState === 4 && xhr.status === 200){
					resolve(xhr.responseText);
				}
			};
			xhr.open('GET', url, async);
			xhr.send(null);
		});
	}
	class Lyric{
		constructor(lyricContainer){
			this.lyricContainer = lyricContainer;
		}
		_parseLyric(lyricText){
			let lyrciMap = {};
			let lyricLineList = lyricText.split(/\n/g);
			lyricLineList.forEach((line) => {
				let [dd, ss, lyricString] = [parseInt(line.match(/.\:/i)), parseInt(line.match(/.{2}\..{2}/i)),
																		line.match(/[\u4e00-\u9fa5]+([^\d]||[\u4e00-\u9fa5])+[\u4e00-\u9fa5]+/i)];
				lyricString != null ? lyrciMap[dd * 60 + ss] = lyricString[0] : '';
			});
			return lyrciMap;
		}
		_renderLyric(lyricMap = {}, renderNodeName = 'li'){
			while(this.lyricContainer.firstElementChild){
				this.lyricContainer.removeChild(this.lyricContainer.firstElementChild);
			}
			let lyricNodeMap = {};
			for(let time in lyricMap){
				let showNode = document.createElement(renderNodeName);
						showNode.innerText = lyricMap[time];
				lyricNodeMap[time] = showNode;
				this.lyricContainer.appendChild(showNode);
			}
			return lyricNodeMap;
		}
		getLyric(url = null, renderNodeName = 'li', callBack = null){
			let lyricNodeMap = null,
					async = callBack != null ? true : false;
			ajaxGetData(url, async).
				then((lyricText) => {
					lyricNodeMap = this._renderLyric(this._parseLyric(lyricText));
					if(async){
						callBack(lyricNodeMap);
					}
				}).catch(err => console.log(err));
			return lyricNodeMap;
		}
	}
	let lyricProxy = (function(){
		let lyric = null;
		return (lyricContainer) => {
			if(lyric === null){
				lyric = new Lyric(lyricContainer);
			}
			return lyric;
		};
	})();
	class SongManage{
		constructor(songList = []){
			this.songIndex = 0;
			this.songList = songList;
		}
		getSong(songIndex = null, switchState = 0){
			let song = null;
			let index = this.songIndex;
			switch(switchState){
				case 0:
					song = this.songList[++index];
				break;
				case 1:
					song = this.songList[--index];
				break;
				case 2:
					index = Math.floor(Math.random() * this.songList.length);
					song = this.songList[index];
				break;
				default:
					song = this.songList[index];
			}
			if(typeof song != 'undefined'){
				this.songIndex = index;
			}else{
				song = this.songList[index];
			}
			return song;
		}
		querySong(songName){
			let s = null;
			this.songList.forEach((song) => {
				if(song.name === songName){
					this.songIndex = this.songList.indexOf(song);
					s = song;
				}
			});
			return s;
		}
		addSong(songData = []){
			if(songData.length === 0){
				return songData.length;
			}
			return this.songList.push(songData);
		}
	}
	let songProxy = (function(){
		let songManage = null;
		return (songList) => {
			if(songManage === null){
				songManage = new SongManage(songList);
			}
			return songManage;
		};
	})();
	class SoundVisual{
		constructor(ctx, analyser, runState, w, h, bar = 1000, barStyle = 'rgba(10, 10, 10, .3)'){
			this.ctx = ctx;
			this.analyser = analyser;
			this.runState = runState;
			this.bar 	  = bar;
			this.barStyle = barStyle;
			this.buffer   = null;
			this.w    	  = w;
			this.h		  = h;
			this.drawState = null;
		}
		_getBufferData(){
			if(this.runState){
				this.buffer = new Uint8Array(this.analyser.frequencyBinCount);
				this.analyser.getByteFrequencyData(this.buffer);
			}else{
				;
			}
			return this.runState;
		}
		startDraw(draw = () => {}){
			let that = this;
			let animation = () => {
				that.drawState = requestAnimationFrame(animation);
				that._getBufferData();
				that.ctx.clearRect(0, 0, that.w, that.h);
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
	let sonudVisualProxy = (function(){
		let sound = null;
		return (canvas = null, analyser = null, runState = true) => {
			if(sound == null){
				if(canvas == null || analyser == null){
					console.log('canvas or analyser is null');
				}else{
					let ctx = canvas.getContext('2d'),
							w   = canvas.width,
							h   = canvas.height;
					sound = new SoundVisual(ctx, analyser, runState, w, h);
				}
			}
			return sound;
		};
	})();
	function addAudioContext(audio){
		let audioCtx = new (window.AudioContext || window.webkitAudioContext)(),
				analyser = audioCtx.createAnalyser(),
				source   = audioCtx.createMediaElementSource(audio);
		source.connect(analyser);
		analyser.connect(audioCtx.destination);
		return {
			context: audioCtx,
			source: source,
			analyser: analyser
		};
	}
	let music = (function(){
		let lyricContainer = null;
		return {
			init(songDataURL = null, audio = null,
						lyricContainer = null, callBack = () => {}){
				if(songDataURL === null){
					console.log('songDataURl is null');
					return false;
				}
				ajaxGetData(songDataURL).
					then((songDataText) => {
						let songMap = JSON.parse(songDataText);
						let songList = [];
						for(let songName in songMap){
							let item = {
								name: songName,
								data: songMap[songName]
							};
							songList.push(item);
						}
						music.songManage = songProxy(songList);
						if(lyricContainer){
							music.lyric = lyricProxy(lyricContainer);
						}
						callBack(songMap);
					});
				music.audio = audio;
				return true;
			},
			play(){
				if(music.audio == null){
					console.log('audio is null');
					return false;
				}
				if(typeof music.audioCtx == "undefined"){
					music.audioCtx = addAudioContext(audio);
				}
				this.play = () => {
					audio.play();
				}
				this.play();
			}
		}
	})();
	let EventUtil = {
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
		}
	};
	window.EventUtil = EventUtil;
	window.music = music;
	window.soundVisual = sonudVisualProxy;
}