import {openStrings} from './music.js';
export function createFretboard(THREE,materials,details){
 const group=new THREE.Group();group.name='acoustic-fretboard';const strings=[],markers=[],ghosts=[],halos=[];
 const nut=-3.25,scale=13.2,fretX=f=>nut+scale*(1-2**(-f/12)),zFor=s=>.6-s*.24,boardY=z=>.084-.027*(z/.74)**2;
 const wood=materials?.wood||new THREE.MeshStandardMaterial({color:0x3c241a,roughness:.6});
 const neckMaterial=materials?.neck||new THREE.MeshStandardMaterial({color:0x68442f,roughness:.45});
 const ivory=materials?.bone||new THREE.MeshStandardMaterial({color:0xe2dac9,roughness:.4});
 const nickel=materials?.nickel||new THREE.MeshStandardMaterial({color:0xc5c7c5,metalness:1,roughness:.24});
 function mesh(g,m,x=0,y=0,z=0,name=''){const n=new THREE.Mesh(g,m);n.position.set(x,y,z);n.castShadow=true;n.receiveShadow=true;n.name=name;group.add(n);return n;}
 const board=mesh(new THREE.BoxGeometry(8.7,.085,1.48),wood,1.03,.04,0,'radiused-wood-fingerboard');
 const neck=mesh(new THREE.BoxGeometry(8.7,.24,1.49),neckMaterial,1.03,-.12,0,'rounded-wood-neck');
 mesh(new THREE.BoxGeometry(.42,.17,1.43),neckMaterial,-3.47,-.025,0,'nut-neck-joint');
 const nutMesh=mesh(new THREE.BoxGeometry(.087,.128,1.47),ivory,nut,.105,0,'guitar-nut');
 function applyDetails(library){
  for(const [object,name] of [[board,'guitar_radiused_board'],[neck,'guitar_neck'],[nutMesh,'guitar_bone_nut']]){
   const geo=library.get(name);if(!geo)continue;object.geometry.dispose();object.geometry=geo.clone();object.position.set(0,0,0);
  }
 }
 if(details)applyDetails(details);
 // Low, rounded fret crowns follow the real fingerboard radius; no sharp cylinder ends.
 for(let f=1;f<=15;f++){
  const points=[];for(let i=0;i<=32;i++){const z=-.727+i*1.454/32;points.push(new THREE.Vector3(fretX(f),boardY(z)+.013,z));}
  mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),32,.013,8,false),nickel,0,0,0,'crowned-fret-'+f);
  if([3,5,7,9,12,15].includes(f))for(const z of f===12?[-.24,.24]:[0]){
   const inlay=mesh(new THREE.CylinderGeometry(.043,.043,.002,24),new THREE.MeshPhysicalMaterial({color:0xc9c7b8,roughness:.25,metalness:.08,iridescence:.12,iridescenceIOR:1.35}), (fretX(f)+fretX(f-1))/2,boardY(z)+.001,z,'pearl-fret-inlay');
   inlay.castShadow=false;
  }
 }
 // Winding stripes are microgeometry cues in the string's own UVs, not glowing lines.
 function windingMap(normal=false){
  const c=document.createElement('canvas');c.width=8;c.height=256;const ctx=c.getContext('2d');
  for(let y=0;y<256;y++){const a=y/8*Math.PI*2,v=Math.round(175+Math.cos(a)*50);ctx.fillStyle=normal?`rgb(128,${Math.round(128+Math.sin(a)*48)},246)`:`rgb(${v},${Math.round(v*.89)},${Math.round(v*.69)})`;ctx.fillRect(0,y,8,1);}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1,16);if(!normal)t.colorSpace=THREE.SRGBColorSpace;return t;
 }
 const woundColor=windingMap(),woundNormal=windingMap(true);
 for(let s=0;s<6;s++){
  const radius=[.0135,.011,.0085,.0058,.0045,.0033][s],geo=new THREE.CylinderGeometry(radius,radius,9.5,8,80);geo.rotateZ(Math.PI/2);
  const base=geo.attributes.position.array.slice(),material=new THREE.MeshPhysicalMaterial({color:s<3?0xa8997c:0xd1d4d3,metalness:1,roughness:s<3?.33:.21,envMapIntensity:1.1,map:s<3?woundColor:null,normalMap:s<3?woundNormal:null,normalScale:new THREE.Vector2(.14,.14)});
  const wire=mesh(geo,material,.35,boardY(zFor(s))+.065,zFor(s),'guitar-string-'+s);strings.push({mesh:wire,base,energy:0,age:0,fret:0});
  const marker=mesh(new THREE.CylinderGeometry(.074,.074,.009,32),new THREE.MeshPhysicalMaterial({color:0xf1c0b0,emissive:0xc68a7c,emissiveIntensity:.15,roughness:.38,metalness:0,transparent:true,opacity:.92}),0,.17,zFor(s),'string-contact-'+s);marker.visible=false;marker.castShadow=false;markers.push(marker);
  const halo=mesh(new THREE.TorusGeometry(.092,.003,6,40),new THREE.MeshBasicMaterial({color:0xf0d0c7,transparent:true,opacity:.65,depthWrite:false}),0,.18,zFor(s));halo.rotation.x=-Math.PI/2;halo.visible=false;halo.castShadow=false;halos.push(halo);
  const ghost=mesh(new THREE.TorusGeometry(.082,.003,6,36),new THREE.MeshBasicMaterial({color:0xe5e8e8,transparent:true,opacity:.28,depthWrite:false}),0,.16,zFor(s));ghost.rotation.x=-Math.PI/2;ghost.visible=false;ghost.castShadow=false;ghosts.push(ghost);
 }
 const hit=mesh(new THREE.BoxGeometry(8.1,.005,1.44),new THREE.MeshBasicMaterial({visible:false}),.5,.18,0,'guitar-hit-plane');hit.userData.guitar=true;hit.castShadow=false;
 const markerX=f=>f===0?nut-.13:fretX(f)-Math.min(.10,(fretX(f)-fretX(f-1))*.22);
 let previous=new Set();
 return {group,width:7.65,fretX,zFor,markerX,hit,strings,applyDetails,
  setEvents(events,next=[]){
   markers.forEach(n=>n.visible=false);halos.forEach(n=>n.visible=false);ghosts.forEach(n=>n.visible=false);const now=new Set();
   for(const n of events){const s=n[4],f=n[5];if(!Number.isInteger(s))continue;const id=n[0]+':'+s;now.add(id);markers[s].position.x=markerX(f);markers[s].visible=true;halos[s].position.x=markerX(f);halos[s].visible=true;const color=n[6]==='L'?0x9adce2:0xf1c0b0;markers[s].material.color.setHex(color);markers[s].material.emissive.setHex(color);halos[s].material.color.setHex(color);strings[s].fret=f;if(!previous.has(id))this.pluck(s);}
   for(const n of next){if(!Number.isInteger(n[4])||markers[n[4]].visible)continue;ghosts[n[4]].position.x=markerX(n[5]);ghosts[n[4]].visible=true;}previous=now;
  },
  pluck(s){if(strings[s]){strings[s].energy=1;strings[s].age=0;}},
  update(dt,time,reduced){
   for(const wire of strings){wire.energy*=Math.exp(-dt*5.5);wire.age+=dt;if(wire.energy<.0008&&wire.atRest)continue;const a=wire.mesh.geometry.attributes.position,start=wire.fret?fretX(wire.fret):nut,end=6.5;
    for(let i=0;i<a.count;i++){const x=wire.base[i*3]+wire.mesh.position.x,u=(x-start)/(end-start),envelope=u>0&&u<1?Math.sin(u*Math.PI):0;
     a.array[i*3+1]=wire.base[i*3+1]+(reduced?0:envelope*Math.sin(wire.age*67+u*2.2)*wire.energy*.010);
    }a.needsUpdate=true;wire.atRest=wire.energy<.0008;
   }
  },
  input(point){const string=Math.max(0,Math.min(5,Math.round((.6-point.z)/.24)));let fret=0;if(point.x>nut+.03){fret=1;while(fret<12&&point.x>fretX(fret))fret++;}return {midi:openStrings[string]+fret,string,fret};},
  labels(){const out=[];for(let f=0;f<=12;f++)out.push({x:f?((fretX(f-1)+fretX(f))/2):nut-.13,y:.18,z:-.91,text:String(f),type:'fret'});for(let s=0;s<6;s++)out.push({x:nut-.34,y:.18,z:zFor(s),text:String(6-s),type:'string'});return out;}
 };
}
