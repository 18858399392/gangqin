import {openStrings,noteName} from './music.js';
export function createFretboard(THREE){
 const group=new THREE.Group();group.name='acoustic-fretboard';const strings=[],markers=[],ghosts=[];const nut=-3.25,scale=13.2;const fretX=f=>nut+scale*(1-2**(-f/12));const zFor=s=>.6-s*.24;
 function texture(color){const c=document.createElement('canvas');c.width=1024;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle=color;ctx.fillRect(0,0,1024,256);let seed=31;for(let y=0;y<256;y++){seed=(seed*1664525+1013904223)>>>0;ctx.strokeStyle=seed%2?'rgba(240,194,129,.055)':'rgba(0,0,0,.14)';ctx.beginPath();for(let x=0;x<=1024;x+=16){const yy=y+Math.sin(x*.008+y*.3)*1.8;if(x===0)ctx.moveTo(x,yy);else ctx.lineTo(x,yy);}ctx.stroke();}const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
 const ebony=new THREE.MeshPhysicalMaterial({color:0x625246,map:texture('#292019'),roughness:.35,clearcoat:.55,clearcoatRoughness:.3});const side=new THREE.MeshPhysicalMaterial({color:0x57321d,map:texture('#8b542f'),roughness:.27,clearcoat:1,clearcoatRoughness:.19});const ivory=new THREE.MeshStandardMaterial({color:0xdfd0ad,roughness:.36,metalness:.15});const fretMaterial=new THREE.MeshStandardMaterial({color:0xb4ada0,metalness:1,roughness:.16});const gold=new THREE.MeshStandardMaterial({color:0xb08b52,metalness:.8,roughness:.22});
 function mesh(g,m,x=0,y=0,z=0){const n=new THREE.Mesh(g,m);n.position.set(x,y,z);n.castShadow=true;n.receiveShadow=true;group.add(n);return n;}
 const box=(w,h,d,m,x,y,z)=>mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z);
 box(8.6,.24,1.49,side,.75,-.12,0);box(8.58,.085,1.43,ebony,.75,.035,0);for(const z of [-.731,.731])box(8.6,.033,.025,ivory,.75,-.007,z);
 const nutMesh=box(.075,.11,1.48,ivory,nut,.12,0);nutMesh.name='guitar-nut';
 for(let f=1;f<=15;f++){const rod=mesh(new THREE.CylinderGeometry(.017,.017,1.43,14),fretMaterial,fretX(f),.099,0);rod.rotation.x=Math.PI/2;if([3,5,7,9,12,15].includes(f))for(const z of f===12?[-.22,.22]:[0]){const dot=mesh(new THREE.CircleGeometry(.045,20),ivory,(fretX(f)+fretX(f-1))/2,.081,z);dot.rotation.x=-Math.PI/2;}}
 // Cropped soundboard and headstock keep lacquer and wood visible around the fingerboard.
 const soundboard=box(5,.3,3.4,side,7,-.1,0);soundboard.name='cropped-guitar-body';const ring=mesh(new THREE.TorusGeometry(.65,.025,12,100),gold,6,.07,0);ring.rotation.x=-Math.PI/2;
 const head=box(1.55,.16,1.75,side,-4.15,.01,0);head.rotation.y=-.045;
 for(let j=0;j<3;j++)for(const s of [-1,1]){const tuner=mesh(new THREE.CylinderGeometry(.065,.065,.13,18),fretMaterial,-3.65-j*.35,.14,s*.55);const button=mesh(new THREE.SphereGeometry(1,16,8),ivory,-3.65-j*.35,.015,s*.98);button.scale.set(.11,.045,.06);}
 for(let s=0;s<6;s++){
  const radius=.011-s*.00135;const geo=new THREE.CylinderGeometry(radius,radius,9.5,10,96);geo.rotateZ(Math.PI/2);const base=geo.attributes.position.array.slice();const material=new THREE.MeshPhysicalMaterial({color:s<3?0xb7a37d:0xc7ccce,metalness:1,roughness:s<3?.32:.16,clearcoat:.6});const wire=mesh(geo,material,.35,.14,zFor(s));wire.name='guitar-string-'+s;strings.push({mesh:wire,base,energy:0,age:0});
  const marker=mesh(new THREE.SphereGeometry(.084,24,12),new THREE.MeshStandardMaterial({color:0xe6c48c,emissive:0xc29754,emissiveIntensity:.8,metalness:.3,roughness:.22}),0,.15,zFor(s));marker.scale.y=.32;marker.visible=false;markers.push(marker);
  const ghost=mesh(new THREE.TorusGeometry(.084,.007,8,36),new THREE.MeshBasicMaterial({color:0xd7c3a3,transparent:true,opacity:.35}),0,.16,zFor(s));ghost.rotation.x=-Math.PI/2;ghost.visible=false;ghosts.push(ghost);
 }
 const boardHit=box(8.1,.005,1.44,new THREE.MeshBasicMaterial({visible:false}),.5,.17,0);boardHit.userData.guitar=true;
 const markerX=f=>f===0?nut-.14:(fretX(f)+fretX(f-1))/2;
 let previous=new Set();
 return {group,width:7.65,fretX,zFor,markerX,hit:boardHit,strings,
  setEvents(events,next=[]){markers.forEach(x=>x.visible=false);ghosts.forEach(x=>x.visible=false);const now=new Set();for(const n of events){const s=n[4],f=n[5];if(!Number.isInteger(s))continue;const key=n[0]+':'+s;now.add(key);markers[s].position.x=markerX(f);markers[s].visible=true;if(!previous.has(key))this.pluck(s);}for(const n of next){if(!Number.isInteger(n[4])||markers[n[4]].visible)continue;ghosts[n[4]].position.x=markerX(n[5]);ghosts[n[4]].visible=true;}previous=now;},
  pluck(s){if(strings[s]){strings[s].energy=1;strings[s].age=0;}},
  update(dt,time,reduced){for(const wire of strings){wire.energy*=Math.exp(-dt*5);const a=wire.mesh.geometry.attributes.position;for(let i=0;i<a.count;i++){const x=wire.base[i*3];a.array[i*3+1]=wire.base[i*3+1]+(reduced?0:Math.sin((x+4.75)/9.5*Math.PI)*Math.sin(time*.09+x*3)*wire.energy*.018);}a.needsUpdate=true;}},
  input(point){const string=Math.max(0,Math.min(5,Math.round((.6-point.z)/.24)));let fret=0;if(point.x>nut+.03){fret=1;while(fret<12&&point.x>fretX(fret))fret++;}return {midi:openStrings[string]+fret,string,fret};},
  labels(){const out=[];for(let f=0;f<=12;f++)out.push({x:markerX(f),y:.16,z:-.92,text:String(f),type:'fret'});for(let s=0;s<6;s++)out.push({x:nut-.35,y:.16,z:zFor(s),text:String(6-s),type:'string'});return out;}
 };
}
