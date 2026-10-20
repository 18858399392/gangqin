export class PianoPlayer {
 constructor(onEnd){this.onEnd=onEnd;this.context=null;this.banks={piano:new Map(),guitar:new Map()};this.instrument="piano";this.samples=this.banks.piano;this.notes=[];this.duration=0;this.offset=0;this.anchor=0;this.cursor=0;this.playing=false;this.voices=new Set();this.volume=.65;this.loading={};this.timer=setInterval(()=>this.schedule(),35);}
 async init(instrument=this.instrument){
  if(!this.context){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)throw new Error('这个浏览器暂不支持乐器播放，请使用新版 Safari 或 Chrome');this.context=new AC();this.master=this.context.createGain();this.master.gain.value=this.volume;const compressor=this.context.createDynamicsCompressor();compressor.threshold.value=-18;compressor.knee.value=18;compressor.ratio.value=3;this.master.connect(compressor);compressor.connect(this.context.destination);this.dry=this.context.createGain();this.dry.gain.value=.85;this.dry.connect(this.master);const convolver=this.context.createConvolver();const length=Math.floor(this.context.sampleRate*2.3);const impulse=this.context.createBuffer(2,length,this.context.sampleRate);let seed=42;for(let c=0;c<2;c++){const data=impulse.getChannelData(c);let prev=0;for(let i=0;i<length;i++){seed=(seed*1664525+1013904223)>>>0;const noise=seed/2147483648-1;prev=.56*prev+.44*noise;data[i]=prev*Math.pow(1-i/length,3)*.7;}}convolver.buffer=impulse;this.wet=this.context.createGain();this.wet.gain.value=.19;convolver.connect(this.wet);this.wet.connect(this.master);this.reverb=convolver;}
  // Resume is called synchronously from the user gesture, before sample loading.
  const resumed=this.context.resume();
  const bank=this.banks[instrument];
  if(!this.loading[instrument]){
   const entries=instrument==='guitar'?[['E2',40],['A2',45],['C3',48],['D3',50],['G3',55],['A3',57],['B3',59],['C4',60],['D4',62],['E4',64],['G4',67],['A4',69],['C5',72]].map(([name,midi])=>({name,midi})):Array.from({length:5},(_,i)=>i+2).flatMap(o=>['C','Ds','Fs','A'].map((name,i)=>({name:name+o,midi:12*(o+1)+i*3})));
   this.loading[instrument]=Promise.all(entries.map(async({name,midi})=>{const response=await fetch('./assets/'+instrument+'/'+name+'.mp3');if(!response.ok)throw new Error('乐器音色加载失败，请重试');const buffer=await this.context.decodeAudioData(await response.arrayBuffer());bank.set(midi,buffer);})).catch(e=>{delete this.loading[instrument];throw e;});
  }
  await Promise.all([resumed,this.loading[instrument]]);if(this.context.state!=='running')throw new Error('请再次轻点播放，开启声音');
 }
 setInstrument(instrument){if(!this.banks[instrument])return;this.pause();this.instrument=instrument;this.samples=this.banks[instrument];if(this.wet)this.wet.gain.setTargetAtTime(instrument==='guitar'?.12:.19,this.context.currentTime,.1);}
 setTrack(track){this.pause();this.notes=track.notes;this.duration=track.duration;this.offset=0;this.cursor=0;}
 position(){return Math.min(this.duration,this.offset+(this.playing?(this.context.currentTime-this.anchor):0));}
 start(){if(!this.context||this.context.state!=='running')return false;if(this.offset>=this.duration-.05)this.offset=0;this.anchor=this.context.currentTime;this.cursor=this.notes.findIndex(n=>n[0]>=this.offset-.015);if(this.cursor===-1)this.cursor=this.notes.length;this.playing=true;this.schedule();return true;}
 pause(){if(this.playing)this.offset=this.position();this.playing=false;for(const v of this.voices){try{v.gain.gain.cancelScheduledValues(this.context.currentTime);v.gain.gain.setTargetAtTime(0,this.context.currentTime,.015);v.source.stop(this.context.currentTime+.08);}catch{}}this.voices.clear();}
 seek(seconds){const wasPlaying=this.playing;this.pause();this.offset=Math.max(0,Math.min(this.duration,seconds));if(wasPlaying)this.start();}
 setVolume(value){this.volume=value;if(this.master)this.master.gain.setTargetAtTime(value,this.context.currentTime,.025);}
 schedule(){if(!this.playing)return;const position=this.position();if(position>=this.duration){this.playing=false;this.offset=0;this.onEnd();return;}const until=position+.17;while(this.cursor<this.notes.length&&this.notes[this.cursor][0]<until){const [t,midi,duration,velocity]=this.notes[this.cursor++];if(t>=position-.09)this.note(midi,this.context.currentTime+Math.max(0,t-position),duration,velocity);}}
 note(midi,time,duration,velocity){let nearest=60,delta=Infinity;for(const n of this.samples.keys()){const d=Math.abs(n-midi);if(d<delta){nearest=n;delta=d;}}const buffer=this.samples.get(nearest);if(!buffer)return;const source=this.context.createBufferSource();source.buffer=buffer;source.playbackRate.value=2**((midi-nearest)/12);const gain=this.context.createGain();const amplitude=(this.instrument==='guitar'?.46:.25)*Math.pow(Math.max(.16,velocity),1.25);gain.gain.setValueAtTime(0,time);gain.gain.linearRampToValueAtTime(amplitude,time+.006);const hold=Math.max(.04,duration);gain.gain.setValueAtTime(amplitude,time+hold);gain.gain.exponentialRampToValueAtTime(.0001,time+hold+1.15);source.connect(gain);gain.connect(this.dry);gain.connect(this.reverb);const v={source,gain};this.voices.add(v);source.onended=()=>{this.voices.delete(v);source.disconnect();gain.disconnect();};source.start(time);source.stop(time+hold+1.2);}
 strum(notes){if(!this.context||this.context.state!=='running')return;notes.forEach((midi,i)=>{if(midi!==null)this.note(midi,this.context.currentTime+i*.035,2.1,.74);});}
 activeNotes(){if(!this.playing)return [];const t=this.position();const notes=[];for(let i=Math.max(0,this.cursor-90);i<this.cursor;i++){const n=this.notes[i];if(n[0]<=t&&n[0]+Math.min(n[2],1.4)>t)notes.push(n[1]);}return notes;}
}

export function arrangeForGuitar(notes){
 const result=[];
 for(let i=0;i<notes.length;){const onset=notes[i][0],group=[];while(i<notes.length&&notes[i][0]<=onset+.018){const n=notes[i++];let pitch=n[1];while(pitch<40)pitch+=12;while(pitch>76)pitch-=12;if(!group.some(x=>x[1]===pitch))group.push([onset,pitch,Math.min(n[2],2.8),n[3]]);}group.sort((a,b)=>a[1]-b[1]);const chosen=group.length>6?[group[0],...group.slice(-5)]:group;chosen.forEach((n,j)=>result.push([+(n[0]+j*.017).toFixed(4),...n.slice(1)]));}
 return result.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
}
