import {fullPop} from './full-pop.js';
import {classics,composerNames} from './classics.js';
import {additions,trackDurations} from './library.js';
export const catalog=[
 {id:'cherry',title:'樱花草',artist:'Sweety · 李天龙',category:'pop',bpm:83,beats:4,bars:37,source:'https://www.everyonepiano.cn/Music-2003.html'},
 {id:'moonlight',title:'月光奏鸣曲',artist:'Ludwig van Beethoven',category:'classical',bpm:54,beats:4,source:'https://github.com/KiyoEditz/Maestro'},
 {id:'river',title:'River Flows in You',artist:'Yiruma · 李闰珉',category:'pop',bpm:72,beats:4,source:'https://github.com/KiyoEditz/Maestro'},
 {id:'elise',title:'致爱丽丝',artist:'Ludwig van Beethoven',category:'classical',bpm:120,beats:3,source:'https://github.com/fabiomigueldp/pianomancer'},
 {id:'canon',title:'卡农',artist:'Johann Pachelbel',category:'classical',bpm:80,beats:4,source:'https://github.com/MAraragi/MusicalScoreRecognition'},
 {id:'golden',title:'golden hour',artist:'JVKE',category:'pop',bpm:94,beats:4,source:'https://github.com/KiyoEditz/Maestro'},
 ...additions,
 ...classics
];
const composerByTrack={moonlight:'beethoven',elise:'beethoven',canon:'pachelbel',gymnopedie1:'satie',gymnopedie3:'satie',dream:'schumann',clair:'debussy',bachprelude:'bach',prelude4:'chopin'};
for(const track of catalog){if(trackDurations[track.id])track.duration=trackDurations[track.id];if(composerByTrack[track.id]){track.composer=composerByTrack[track.id];track.composerName=composerNames[track.composer];}}

for(const update of fullPop){const track=catalog.find(t=>t.id===update.id);if(track)Object.assign(track,update);}

// One shared order for the song menu, autoplay, and previous/next controls.
const preferredPopOrder=new Map(['cherry','hobby','will','memories','xinshi','if','bachvow','warmtea','unsent57'].map((id,index)=>[id,index]));
const playlistPriority=track=>preferredPopOrder.get(track.id)??(track.category==='pop'&&track.id!=='river'?preferredPopOrder.size:preferredPopOrder.size+1);
// River Flows in You is instrumental despite its existing pop filter category.
catalog.sort((a,b)=>playlistPriority(a)-playlistPriority(b));
export const canPlayTrack=t=>t.score!==null;
export const openStrings=[40,45,50,55,59,64];
export const chordShapes={C:[null,48,52,55,60,64],Am:[null,45,52,57,60,64],F:[41,48,53,57,60,65],G:[43,47,50,55,59,67],D:[null,null,50,57,62,66],Em:[40,47,52,55,59,64]};
export const noteName=midi=>['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'][midi%12]+(Math.floor(midi/12)-1);
export const format=t=>`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;
export function annotatePiano(notes,id){return notes.map(n=>[...n.slice(0,4),['L','R'].includes(n[4])?n[4]:id==='cherry'?(n[3]>=.6?'R':'L'):(n[1]>=60?'R':'L')]);}
export function handOf(n,instrument){return instrument==='guitar'?n[6]:n[4];}
export function groupNotes(notes){const groups=[];for(const n of notes){const last=groups.at(-1);if(last&&n[0]-last.time<.11)last.notes.push(n);else groups.push({time:n[0],notes:[n]});}return groups;}
export function lowerBound(notes,time){let a=0,b=notes.length;while(a<b){const m=(a+b)>>1;if(notes[m][0]<time)a=m+1;else b=m;}return a;}

// Beam-search a playable fingering for every onset. Audio and visual tablature
// consume the same [time, pitch, duration, velocity, string, fret, hand] events.
export function arrangeForGuitar(notes){
 const result=[];let previousPosition=2;
 for(let i=0;i<notes.length;){
  const time=notes[i][0],group=[];
  while(i<notes.length&&notes[i][0]-time<.025){const n=notes[i++];if(!group.some(x=>x[1]===n[1]))group.push(n);}
  group.sort((a,b)=>b[1]-a[1]);const voices=group.length>6?[...group.slice(0,5),group.at(-1)]:group;
  let beam=[{items:[],mask:0,low:99,high:0,cost:0}];
  for(let v=0;v<voices.length;v++){
   const n=voices[v];let target=n[1];if(target>=72)target-=12;while(target<40)target+=12;while(target>76)target-=12;
   const candidates=[];for(const pitch of [target,target-12,target+12])if(pitch>=40&&pitch<=76)for(let string=0;string<6;string++){const fret=pitch-openStrings[string];if(fret>=0&&fret<=12)candidates.push({pitch,string,fret,cost:Math.abs(pitch-target)*.9+fret*.045+Math.abs(fret-previousPosition)*.035});}
   const next=[];
   for(const state of beam){
    for(const c of candidates){if(state.mask&(1<<c.string))continue;const low=c.fret?Math.min(state.low,c.fret):state.low,high=c.fret?Math.max(state.high,c.fret):state.high;if(high-low>4)continue;
     // A single fretted hand can hold at most four different fret positions.
     const frets=new Set([...state.items.map(x=>x[5]),c.fret].filter(x=>x>0));if(frets.size>4)continue;
     next.push({items:[...state.items,[time,c.pitch,Math.min(n[2],2.5),n[3],c.string,c.fret,n[4]||'R']],mask:state.mask|(1<<c.string),low,high,cost:state.cost+c.cost});
    }
    next.push({...state,cost:state.cost+(v===0?60:v===voices.length-1?35:20)});
   }
   beam=next.sort((a,b)=>a.cost-b.cost).slice(0,36);
  }
  const best=beam[0].items.sort((a,b)=>a[4]-b[4]);const frets=best.map(x=>x[5]).filter(Boolean);if(frets.length)previousPosition=frets.reduce((a,b)=>a+b,0)/frets.length;
  best.forEach((n,j)=>{n[0]=+(n[0]+j*.017).toFixed(4);result.push(n);});
 }
 result.sort((a,b)=>a[0]-b[0]||a[4]-b[4]);
 // A string stops its previous note when it is played again.
 const last=Array(6).fill(null);for(const n of result){const p=last[n[4]];if(p)p[2]=Math.max(.008,Math.min(p[2],n[0]-p[0]-.008));last[n[4]]=n;
  // Release earlier held fingers if the new position exceeds one hand's span.
  let held=last.filter(x=>x&&x[5]>0&&x[0]+x[2]>n[0]);
  const invalid=items=>{const frets=items.map(x=>x[5]);return Math.max(...frets)-Math.min(...frets)>4||new Set(frets).size>4;};
  while(held.length>1&&invalid(held)){const oldest=held.filter(x=>x!==n).sort((a,b)=>a[0]-b[0])[0];if(!oldest)break;oldest[2]=Math.max(.008,n[0]-oldest[0]-.008);held=held.filter(x=>x!==oldest);}
 }

 return result;
}
