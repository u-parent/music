class SoundVisual{
	constructor(ctx, analyser, w, h, bar = 1000, barStyle = 'rgba(10, 10, 10, .3)'){
		this.ctx = ctx;
		this.analyser = analyser;
		this.runState = true;
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
let soundVisual = (function(){
	let sound = null;
	return (canvas = null, analyser = null) => {
		if(sound == null){
			let ctx = canvas.getContext('2d');
			sound = new SoundVisual(ctx, analyser, canvas.width, canvas.height);
		}
		return sound;
	};
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
				xhr.open('GET', url, true);
				xhr.send(null);
			});
		}
	}
})();