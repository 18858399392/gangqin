import * as THREE from './assets/three.module.js';
import {createGuitar} from './guitar.js';

export function createPianoRoom(container, onReady, onError) {
 let renderer;
 try {renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});}catch(e){onError(e);return {setNotes(){},setTheme(){},setView(){},resize(){}};}
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;container.appendChild(renderer.domElement);
 const scene=new THREE.Scene();scene.background=new THREE.Color('#eeece6');scene.fog=new THREE.Fog('#eeece6',15,33);
 const camera=new THREE.PerspectiveCamera(34,1,.1,70);
 const piano=new THREE.Group();piano.name='grand-piano';scene.add(piano);piano.rotation.y=-.15;
 const guitar=createGuitar(THREE);scene.add(guitar.group);guitar.group.visible=false;let instrument='piano';
 const ivory=new THREE.MeshPhysicalMaterial({color:0xf2eee1,roughness:.22,metalness:.05,clearcoat:.6,clearcoatRoughness:.1});
 const ebony=new THREE.MeshPhysicalMaterial({color:0x090c0b,roughness:.18,metalness:.18,clearcoat:1,clearcoatRoughness:.06});
 const lacquer=new THREE.MeshPhysicalMaterial({color:0x101413,roughness:.13,metalness:.25,clearcoat:1,clearcoatRoughness:.06});
 const gold=new THREE.MeshStandardMaterial({color:0x9f814b,roughness:.29,metalness:.85});
 const darkGold=new THREE.MeshStandardMaterial({color:0x8f713e,roughness:.35,metalness:.7});
 const wood=new THREE.MeshStandardMaterial({color:0xa0875c,roughness:.6});
 const felt=new THREE.MeshStandardMaterial({color:0x5d241f,roughness:1});
 const keys=new Map();const animated=[];let active=new Set();
 function mesh(geometry,material,x=0,y=0,z=0,parent=piano){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function box(w,h,d,mat,x,y,z,parent){return mesh(new THREE.BoxGeometry(w,h,d),mat,x,y,z,parent);}
 function rod(a,b,r,mat,parent=piano){const d=new THREE.Vector3().subVectors(b,a);const m=mesh(new THREE.CylinderGeometry(r,r,d.length(),10),mat,0,0,0,parent);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return m;}
 const V=(x,y,z)=>new THREE.Vector3(x,y,z);
 function outline(scale=1){const s=new THREE.Shape();s.moveTo(-1.5*scale,1.06*scale);s.lineTo(1.5*scale,1.06*scale);s.lineTo(1.5*scale,.55*scale);s.bezierCurveTo(1.5*scale,-.15*scale,.82*scale,-.32*scale,.88*scale,-1.17*scale);s.bezierCurveTo(.96*scale,-2.05*scale,.48*scale,-2.62*scale,-.5*scale,-2.62*scale);s.bezierCurveTo(-1.1*scale,-2.62*scale,-1.5*scale,-2.4*scale,-1.5*scale,-1.9*scale);s.closePath();return s;}
 function slab(shape,depth,mat,y,parent=piano){const geo=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.018,bevelThickness:.015,curveSegments:40});const m=mesh(geo,mat,0,y,0,parent);m.rotation.x=Math.PI/2;return m;}
 slab(outline(),.18,lacquer,2.08);
 slab(outline(.956),.035,wood,2.15);
 const rim=outline();rim.holes.push(new THREE.Path(outline(.96).getPoints(80).reverse()));slab(rim,.23,lacquer,2.38);
 slab(outline(.89),.025,darkGold,2.2);
 // Cast iron plate, bridges and individually strung courses.
 for(let i=0;i<45;i++){
  const x=-1.29+i*.058;const end=-2.27+Math.pow(Math.max(0,(x+1.29)/2.65),1.65)*2.18;
  for(let j=0;j<2;j++)rod(V(x+j*.007,2.225,.82),V(x+j*.007,2.225,end),.0021,gold);
  mesh(new THREE.CylinderGeometry(.012,.012,.027,7),gold,x,2.24,.86);
 }
 for(const [a,b] of [[[-1.27,2.25,.7],[-1.24,2.25,-2.17]],[[-.68,2.25,.74],[-.97,2.25,-2.29]],[[.15,2.25,.72],[-.4,2.25,-2.25]],[[1.1,2.25,.67],[.25,2.25,-1.7]]])rod(V(...a),V(...b),.027,darkGold);
 box(2.67,.03,.06,gold,0,2.27,.63);box(2.75,.04,.05,felt,0,2.28,.92);
 // Keyboard and fallboard.
 box(3.13,.18,.89,lacquer,0,1.97,1.4);box(3.15,.16,.085,lacquer,0,2.1,1.88);
 box(.105,.23,.87,lacquer,-1.52,2.12,1.4);box(.105,.23,.87,lacquer,1.52,2.12,1.4);
 box(2.92,.28,.105,lacquer,0,2.36,1.035);
 const noteClasses=[1,3,6,8,10];let whiteIndex=0;
 for(let midi=21;midi<=108;midi++){
  const black=noteClasses.includes(midi%12);const pivot=new THREE.Group();pivot.position.set(-1.425+(whiteIndex+(black?-.12:.5))*.0548,2.135,1.08);piano.add(pivot);
  const m=box(black?.032:.0525,black?.09:.065,black?.37:.72,black?ebony:ivory,0,black?.061:0,black?.185:.36,pivot);
  const glow=new THREE.MeshStandardMaterial({color:black?0x6c7b62:0xe5e8cc,roughness:.22,metalness:.1,emissive:0x697b48,emissiveIntensity:black?.2:.13});
  keys.set(midi,{pivot,m,base:m.material,glow,value:0});if(!black)whiteIndex++;
 }
 box(2.86,.022,.025,felt,0,2.18,1.07);
 // Small metallic lettering, photographed as part of the instrument.
 const labelCanvas=document.createElement('canvas');labelCanvas.width=1024;labelCanvas.height=128;const ctx=labelCanvas.getContext('2d');ctx.fillStyle='#bcaa78';ctx.textAlign='center';ctx.font='34px Georgia';ctx.fillText('N  O  C  T  U  R  N  E',512,65);ctx.font='12px Georgia';ctx.fillText('H A M B U R G   ·   1 8 5 3',512,96);const texture=new THREE.CanvasTexture(labelCanvas);texture.colorSpace=THREE.SRGBColorSpace;const label=mesh(new THREE.PlaneGeometry(.77,.096),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false}),0,2.39,1.092);label.rotation.x=-.03;
 // Raised lid, hinged along the straight left rim.
 const lid=new THREE.Group();lid.position.set(-1.51,2.42,0);lid.rotation.z=.42;piano.add(lid);const lidShape=outline();const lidSlab=slab(lidShape,.055,lacquer,.015,lid);lidSlab.position.x=1.51;
 rod(V(1.11,2.35,-.48),V(1.11,3.59,-.48),.018,lacquer);
 for(const z of [-1.85,-.7,.55]){const hinge=mesh(new THREE.CylinderGeometry(.025,.025,.12,12),gold,-1.5,2.41,z);hinge.rotation.x=Math.PI/2;}
 // Tapered legs and brass castors.
 for(const [x,z] of [[-1.32,1.38],[1.32,1.38],[-.66,-2.1]]){
  const leg=mesh(new THREE.CylinderGeometry(.073,.045,1.64,4),lacquer,x,1.08,z);leg.rotation.y=Math.PI/4;box(.15,.08,.15,lacquer,x,1.91,z);mesh(new THREE.CylinderGeometry(.043,.043,.13,14),gold,x,.23,z);
  const wheel=mesh(new THREE.CylinderGeometry(.067,.067,.045,18),gold,x,.11,z);wheel.rotation.z=Math.PI/2;
 }
 // Pedal lyre and three pedals.
 rod(V(-.23,1.93,1),V(-.18,.43,1.1),.033,lacquer);rod(V(.23,1.93,1),V(.18,.43,1.1),.033,lacquer);box(.52,.13,.14,lacquer,0,.48,1.1);
 for(let i=-1;i<=1;i++){rod(V(i*.13,.5,1.1),V(i*.13,.22,1.2),.016,gold);const pedal=mesh(new THREE.SphereGeometry(1,16,8),gold,i*.13,.2,1.31);pedal.scale.set(.047,.024,.15);}
 // Matching padded piano bench.
 const bench=new THREE.Group();bench.position.set(.05,0,2.65);piano.add(bench);box(1.08,.16,.52,lacquer,0,.97,0,bench);const leather=new THREE.MeshPhysicalMaterial({color:0x141916,roughness:.4,clearcoat:.25});box(1.04,.1,.49,leather,0,1.085,0,bench);
 for(const x of [-.43,.43])for(const z of [-.17,.17]){const l=mesh(new THREE.CylinderGeometry(.035,.025,.85,4),lacquer,x,.48,z,bench);l.rotation.y=Math.PI/4;}
 for(const x of [-.34,0,.34])for(const z of [-.12,.12]){const button=mesh(new THREE.SphereGeometry(.014,8,6),ebony,x,1.137,z,bench);button.scale.y=.2;}
 // A warm gallery floor, lit by broad softboxes for lacquer reflections.
 const floorMat=new THREE.MeshStandardMaterial({color:0xeeece6,roughness:.62,metalness:.1});const floor=mesh(new THREE.PlaneGeometry(200,200),floorMat,0,0,0,scene);floor.rotation.x=-Math.PI/2;floor.castShadow=false;
 scene.add(new THREE.HemisphereLight(0xfff7e5,0x7d8c88,3));const sun=new THREE.DirectionalLight(0xfff9ed,4);sun.position.set(-3,9,5);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-5;sun.shadow.camera.right=5;sun.shadow.camera.top=5;sun.shadow.camera.bottom=-5;sun.shadow.normalBias=.018;sun.shadow.bias=-.0004;sun.shadow.radius=5;scene.add(sun);
 const fill=new THREE.DirectionalLight(0xe9eee9,1.7);fill.position.set(5,5,-4);scene.add(fill);
 // Studio environment built locally: no external textures or models are required.
 const envScene=new THREE.Scene();envScene.background=new THREE.Color(0x777d76);const panelMat=new THREE.MeshBasicMaterial({color:0xffffff});for(const [x,y,z,w,h,ry,rx] of [[-4,4,2,3,5,Math.PI/2,0],[1,7,0,8,4,0,Math.PI/2],[3,3,-5,5,2,0,0],[0,3,7,6,2,Math.PI,0]]){const panel=new THREE.Mesh(new THREE.PlaneGeometry(w,h),panelMat);panel.position.set(x,y,z);panel.rotation.set(rx,ry,0);envScene.add(panel);}const pmrem=new THREE.PMREMGenerator(renderer);const env=pmrem.fromScene(envScene,.08);scene.environment=env.texture;pmrem.dispose();
 // Soft contact shadow grounds the three legs and the curved body.
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=128;shadowCanvas.height=128;const sc=shadowCanvas.getContext('2d');const grad=sc.createRadialGradient(64,64,4,64,64,64);grad.addColorStop(0,'rgba(20,28,20,0.23)');grad.addColorStop(.4,'rgba(20,28,20,0.12)');grad.addColorStop(1,'rgba(20,28,20,0)');sc.fillStyle=grad;sc.fillRect(0,0,128,128);const contact=mesh(new THREE.PlaneGeometry(6,6),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}),0,.012,.1,scene);contact.rotation.x=-Math.PI/2;contact.castShadow=false;contact.receiveShadow=false;
 let view='classic',width=1,height=1,theta=.7,phi=1.02,radius=10.6,targetTheta=.7,targetPhi=1.02,targetRadius=10.6;let look=new THREE.Vector3(0,1.6,0),targetLook=look.clone();let pointer=null;let dragging=false;let lastMove=performance.now();let night=false;
 function preset(v){view=v;if(instrument==='guitar'){targetTheta=v==='keys'?0:v==='above'?1.1:.25;targetPhi=v==='above'?1.18:1.3;targetRadius=v==='keys'?7.8:10.2;targetLook.set(.35,v==='keys'?2.85:2.35,0);return;}targetTheta=v==='keys'?0:v==='above'?.25:.7;targetPhi=v==='keys'?1.13:v==='above'?.27:1.02;targetRadius=v==='keys'?7.1:v==='above'?10.4:10.6;targetLook.set(0,v==='keys'?1.91:1.65,v==='keys'?.7:0);}
 function resize(){width=container.clientWidth;height=container.clientHeight;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();const portrait=width<720&&height>width;const immersed=document.body.classList.contains('immersed');camera.setViewOffset(width,height,immersed?0:portrait?0:-width*.155,immersed?0:portrait?-height*.145:0,width,height);camera.updateProjectionMatrix();}
 new ResizeObserver(resize).observe(container);resize();
 renderer.domElement.addEventListener('pointerdown',e=>{pointer={x:e.clientX,y:e.clientY,id:e.pointerId};dragging=false;renderer.domElement.setPointerCapture(e.pointerId);});
 renderer.domElement.addEventListener('pointermove',e=>{if(!pointer||e.pointerId!==pointer.id)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;if(Math.abs(dx)+Math.abs(dy)>2)dragging=true;targetTheta-=dx*.007;targetPhi=Math.max(.19,Math.min(1.38,targetPhi+dy*.004));pointer.x=e.clientX;pointer.y=e.clientY;lastMove=performance.now();});
 renderer.domElement.addEventListener('pointerup',()=>{pointer=null;});renderer.domElement.addEventListener('pointercancel',()=>{pointer=null;});
 renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();targetRadius=Math.max(6,Math.min(15,targetRadius+e.deltaY*.008));lastMove=performance.now();},{passive:false});
 let running=true,raf=0,last=performance.now();const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 function frame(now){if(!running)return;const dt=Math.min((now-last)/1000,.05);last=now;const ease=1-Math.exp(-dt*5);theta+=(targetTheta-theta)*ease;phi+=(targetPhi-phi)*ease;radius+=(targetRadius-radius)*ease;look.lerp(targetLook,ease);const portrait=width<720&&height>width;const r=radius*(portrait?(instrument==='guitar'?1.75:1.05):1);camera.position.set(look.x+r*Math.sin(phi)*Math.sin(theta),look.y+r*Math.cos(phi),look.z+r*Math.sin(phi)*Math.cos(theta));camera.lookAt(look);if(!reduced&&document.body.classList.contains('immersed')&&!pointer&&now-lastMove>6000)targetTheta+=dt*.018;
  for(const [m,k] of keys){const down=active.has(m);k.value+=(Number(down)-k.value)*Math.min(1,dt*17);k.pivot.rotation.x=k.value*.045;k.m.material=k.value>.15?k.glow:k.base;}
  if(instrument==='guitar')guitar.update(reduced?1:dt,reduced?0:now);renderer.render(scene,camera);raf=requestAnimationFrame(frame);
 }
 document.addEventListener('visibilitychange',()=>{running=!document.hidden;if(running){last=performance.now();raf=requestAnimationFrame(frame);}else cancelAnimationFrame(raf);});
 requestAnimationFrame(frame);onReady();
 return {setNotes(notes){active=new Set(notes);if(instrument==='guitar')guitar.setNotes(notes);},setInstrument(mode){instrument=mode;piano.visible=mode==='piano';guitar.group.visible=mode==='guitar';active.clear();guitar.setNotes([]);preset(view);},pluck(note,string){guitar.pluck(note,string);},setView(v){preset(v);lastMove=performance.now();},setTheme(isNight){night=isNight;scene.background.set(night?'#202622':'#eeece6');scene.fog.color.copy(scene.background);floorMat.color.copy(scene.background);sun.intensity=night?2.6:4;renderer.toneMappingExposure=night?.85:1.1;},resize};
}
