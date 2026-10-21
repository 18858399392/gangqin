import {openStrings} from './music.js';

export const stringNut=-3.25,stringBridge=6.5;
export const stringFretX=f=>stringNut+13.2*(1-2**(-f/12));
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const valid=s=>Number.isInteger(s)&&s>=0&&s<6;

// A damped, fixed-end modal string. Motion is slowed for legible rendering;
// the sample engine continues to sound the actual standard-tuning pitch.
export function createStringMotion(){
 const strings=Array.from({length:6},()=>({fret:0,age:10,energy:0,amplitude:0,direction:1,pluckU:.3,pull:null,zModes:new Float64Array(3),yModes:new Float64Array(3)}));
 let previous=new Map();
 function start(wire){return wire.fret?stringFretX(wire.fret):stringNut;}
 function contact(wire,x){const left=start(wire);return clamp(((Number.isFinite(x)?x:left+(stringBridge-left)*.3)-left)/(stringBridge-left),.12,.88);}
 function modes(wire,s){
  const omega=2*Math.PI*Math.min(12,6*2**((openStrings[s]+wire.fret-40)/48)),normal=Math.sin(Math.PI*wire.pluckU);
  for(let i=0;i<3;i++){const mode=i+1,phase=omega*mode*wire.age;
   const amplitude=wire.amplitude*wire.energy*Math.sin(mode*Math.PI*wire.pluckU)/(mode*mode*normal)*Math.exp(-wire.age*i*1.8);
   wire.zModes[i]=amplitude*Math.cos(phase)*wire.direction;wire.yModes[i]=amplitude*Math.sin(phase+.3)*.24;
  }
 }
 function pluck(s,{fret=0,velocity=.7,direction=1,x}={}){
  if(!valid(s))return;const wire=strings[s];wire.fret=clamp(Math.round(fret),0,12);wire.age=0;wire.energy=1;wire.pull=null;
  wire.amplitude=(.015+.047*clamp(velocity,0,1))*(1-s*.035);wire.direction=direction<0?-1:1;wire.pluckU=contact(wire,x);modes(wire,s);
 }
 return {strings,pluck,
  setEvents(events){
   const current=new Map();for(const n of events)if(valid(n[4]))current.set(n[4],n);
   for(const [s,n] of current)if(previous.get(s)!==n&&!strings[s].pull)pluck(s,{fret:n[5],velocity:n[3],...n._pluck});
   previous=current;
  },
  pull(s,{fret=0,x,offset=0}){if(!valid(s))return;const wire=strings[s];wire.fret=clamp(Math.round(fret),0,12);wire.energy=0;wire.pull={u:contact(wire,x),offset:clamp(offset,-.10,.10)};},
  cancelPull(s){if(valid(s))strings[s].pull=null;},
  reset(){previous.clear();for(const wire of strings){wire.energy=0;wire.age=10;wire.pull=null;}},
  update(dt){for(let s=0;s<6;s++){const wire=strings[s];if(wire.pull||!wire.energy)continue;wire.age+=dt;wire.energy=Math.exp(-wire.age*(2.7+s*.22));if(wire.energy<.001)wire.energy=0;modes(wire,s);}},
  sample(s,x,reduced=false){
   const wire=strings[s],left=start(wire),u=(x-left)/(stringBridge-left);
   if(reduced||u<=0||u>=1)return {y:0,z:0};
   if(wire.pull){const {u:p,offset}=wire.pull;return {y:Math.abs(offset)*.12*Math.sin(Math.PI*u),z:offset*(u<p?u/p:(1-u)/(1-p))};}
   if(!wire.energy)return {y:0,z:0};
   let z=0,y=0;
   for(let mode=1;mode<=3;mode++){
    const shape=Math.sin(mode*Math.PI*u);z+=shape*wire.zModes[mode-1];y+=shape*wire.yModes[mode-1];
   }
   return {z:clamp(z,-.10,.10),y};
  }
 };
}
