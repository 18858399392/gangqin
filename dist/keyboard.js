import {openStrings} from './music.js';
// Virtual Piano's C2–C7 letter-sheet layout, verified against its official key diagram.
const letters='1234567890qwertyuiopasdfghjklzxcvbnm';
const whiteSteps=[0,2,4,5,7,9,11];
const codeFor=key=>/\d/.test(key)?'Digit'+key:'Key'+key.toUpperCase();
export const pianoBindings=[];
[...letters].forEach((key,i)=>{const midi=36+12*Math.floor(i/7)+whiteSteps[i%7];pianoBindings.push({code:codeFor(key),shift:false,midi,label:key});if([0,2,5,7,9].includes(midi%12)&&midi<96)pianoBindings.push({code:codeFor(key),shift:true,midi:midi+1,label:'⇧'+key});});
// Musicca's four rows are strings 3,4,5,6; Shift selects strings 1 and 2.
// Its internal g1/d1/a1/e1 names denote OPEN strings, not fret 1.
export const guitarRows=[
 {string:5,shift:true,keys:'1234567890-=',codes:['Digit1','Digit2','Digit3','Digit4','Digit5','Digit6','Digit7','Digit8','Digit9','Digit0','Minus','Equal']},
 {string:4,shift:true,keys:'qwertyuiop[]',codes:['KeyQ','KeyW','KeyE','KeyR','KeyT','KeyY','KeyU','KeyI','KeyO','KeyP','BracketLeft','BracketRight']},
 {string:3,shift:false,keys:'1234567890-=',codes:['Digit1','Digit2','Digit3','Digit4','Digit5','Digit6','Digit7','Digit8','Digit9','Digit0','Minus','Equal']},
 {string:2,shift:false,keys:'qwertyuiop[]',codes:['KeyQ','KeyW','KeyE','KeyR','KeyT','KeyY','KeyU','KeyI','KeyO','KeyP','BracketLeft','BracketRight']},
 {string:1,shift:false,keys:"asdfghjkl;'\\",codes:['KeyA','KeyS','KeyD','KeyF','KeyG','KeyH','KeyJ','KeyK','KeyL','Semicolon','Quote','Backslash']},
 {string:0,shift:false,keys:'zxcvbnm,./',codes:['KeyZ','KeyX','KeyC','KeyV','KeyB','KeyN','KeyM','Comma','Period','Slash']}
];
export function keyboardHit(instrument,code,shift=false,offset=0){
 if(instrument==='piano'){const b=pianoBindings.find(b=>b.code===code&&b.shift===shift);return b?{midi:b.midi}:null;}
 const row=guitarRows.find(r=>r.shift===shift&&r.codes.includes(code));if(!row)return null;const fret=row.codes.indexOf(code)+offset;return {midi:openStrings[row.string]+fret,string:row.string,fret};
}
export function pianoKeyLabel(midi){return pianoBindings.find(b=>b.midi===midi)?.label||'';}
export function guitarKeyLabel(string,fret,offset=0){const row=guitarRows.find(r=>r.string===string),i=fret-offset;return row&&i>=0&&i<row.codes.length?(row.shift?'⇧':'')+row.keys[i]:'';}
export function eventKeyLabel(instrument,n,offset=0){return instrument==='piano'?pianoKeyLabel(n[1]):guitarKeyLabel(n[4],n[5],offset);}
export function editableTarget(target){return Boolean(target?.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"]'));}
export function installComputerKeyboard({target=document,view=window,instrument,offset,blocked,onPrepare,onPress,onRelease,onChange,onUsed}){
 const held=new Map();let serial=0;
 const changed=()=>onChange([...held.values()].map(v=>v.event));
 function release(code){const entry=held.get(code);if(!entry)return;held.delete(code);entry.released=true;if(entry.voice)onRelease(entry.voice);changed();}
 function clear(){for(const code of [...held.keys()])release(code);}
 function down(e){if(e.isComposing||e.keyCode===229||e.ctrlKey||e.altKey||e.metaKey||editableTarget(e.target)||blocked())return;const hit=keyboardHit(instrument(),e.code,e.shiftKey,offset());if(!hit)return;e.preventDefault();if(e.repeat||held.has(e.code))return;onPrepare();if(instrument()==='guitar')for(const [code,entry] of held)if(entry.event[4]===hit.string)release(code);onUsed();const event=instrument()==='guitar'?[0,hit.midi,30,.78,hit.string,hit.fret,'R']:[0,hit.midi,30,.78,hit.midi<60?'L':'R'];event._burst=++serial;const entry={event,released:false,voice:null};held.set(e.code,entry);changed();Promise.resolve(onPress(hit,entry)).then(voice=>{entry.voice=voice;if(entry.released&&voice)onRelease(voice);}).catch(()=>{if(held.get(e.code)===entry)release(e.code);});}
 const up=e=>release(e.code);const visibility=()=>{if(target.hidden)clear();};
 target.addEventListener('keydown',down);target.addEventListener('keyup',up);target.addEventListener('visibilitychange',visibility);view.addEventListener('blur',clear);
 return {clear,get events(){return [...held.values()].map(v=>v.event);},destroy(){clear();target.removeEventListener('keydown',down);target.removeEventListener('keyup',up);target.removeEventListener('visibilitychange',visibility);view.removeEventListener('blur',clear);}};
}
