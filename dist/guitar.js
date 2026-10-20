// A locally modeled steel-string acoustic guitar. All textures are procedural.
export function createGuitar(THREE) {
 const group=new THREE.Group();group.name='acoustic-guitar';group.rotation.set(-.12,-.2,-.23);group.position.set(.05,.38,0);
 const strings=[],markers=[];let active=new Set(),previous=new Set();const opens=[40,45,50,55,59,64];
 function woodTexture(){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=1024;const ctx=canvas.getContext('2d');ctx.fillStyle='#c59c60';ctx.fillRect(0,0,512,1024);let seed=17;for(let x=0;x<512;x++){seed=(seed*1664525+1013904223)>>>0;const shade=seed/4294967296;ctx.fillStyle=shade>.5?'rgba(85,47,18,.10)':'rgba(255,230,175,.13)';ctx.fillRect(x,0,shade>.8?2:1,1024);}const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;return tex;}
 const spruce=new THREE.MeshPhysicalMaterial({color:0xe8bf83,map:woodTexture(),roughness:.32,clearcoat:.85,clearcoatRoughness:.2});
 const mahogany=new THREE.MeshPhysicalMaterial({color:0x543021,roughness:.3,clearcoat:.8});const ebony=new THREE.MeshPhysicalMaterial({color:0x241a14,roughness:.4,clearcoat:.3});const cream=new THREE.MeshStandardMaterial({color:0xe6d7b0,roughness:.4});const steel=new THREE.MeshStandardMaterial({color:0xbbb8a3,metalness:.87,roughness:.24});const brass=new THREE.MeshStandardMaterial({color:0xa88750,metalness:.8,roughness:.27});
 function mesh(geo,mat,x=0,y=0,z=0){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;group.add(m);return m;}
 function box(w,h,d,mat,x,y,z){return mesh(new THREE.BoxGeometry(w,h,d),mat,x,y,z);}
 function rod(a,b,r,mat){const dir=new THREE.Vector3().subVectors(b,a);const m=mesh(new THREE.CylinderGeometry(r,r,dir.length(),10),mat);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.normalize());return m;}
 const V=(x,y,z)=>new THREE.Vector3(x,y,z);
 function outline(){const s=new THREE.Shape();s.moveTo(0,2.35);s.bezierCurveTo(-.27,2.35,-.86,2.22,-.82,1.81);s.bezierCurveTo(-.8,1.51,-.49,1.35,-.66,1.11);s.bezierCurveTo(-1.11,.65,-1.12,.19,-.59,.06);s.bezierCurveTo(-.29,-.035,.29,-.035,.59,.06);s.bezierCurveTo(1.12,.19,1.11,.65,.66,1.11);s.bezierCurveTo(.49,1.35,.8,1.51,.82,1.81);s.bezierCurveTo(.86,2.22,.27,2.35,0,2.35);return s;}
 const bodyShape=outline();const hole=new THREE.Path();hole.absarc(0,1.61,.255,0,Math.PI*2,true);bodyShape.holes.push(hole);
 const body=mesh(new THREE.ExtrudeGeometry(bodyShape,{depth:.38,bevelEnabled:true,bevelSize:.024,bevelThickness:.018,bevelSegments:3,steps:1,curveSegments:40}),[spruce,mahogany],0,0,-.19);body.name='guitar-body';
 mesh(new THREE.ShapeGeometry(outline(),64),mahogany,0,0,-.215).rotation.y=Math.PI;
 // Inlaid edge binding and the soundhole's three concentric rings.
 const edgePoints=outline().getPoints(180).map(p=>V(p.x,p.y,.214));edgePoints.push(edgePoints[0].clone());mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(edgePoints),220,.012,5,false),cream);
 mesh(new THREE.CircleGeometry(.255,48),new THREE.MeshStandardMaterial({color:0x100c08,roughness:1}),0,1.61,-.17);
 for(const [r,mat] of [[.271,cream],[.289,mahogany],[.307,cream]])mesh(new THREE.TorusGeometry(r,.006,8,80),mat,0,1.61,.224);
 // Neck, rosewood fingerboard, nut, saddle, bridge and six bridge pins.
 box(.255,1.84,.13,mahogany,0,3.14,.025);box(.3,2.16,.065,ebony,0,2.98,.144);box(.311,.033,.08,cream,0,4.06,.203);
 box(.68,.15,.065,ebony,0,.7,.244);box(.4,.025,.03,cream,0,.735,.288);
 for(let i=0;i<6;i++){const pin=mesh(new THREE.SphereGeometry(.017,10,8),cream,-.1375+i*.055,.663,.286);pin.scale.z=.55;}
 for(let f=1;f<=19;f++){const y=4.06-3.325*(1-2**(-f/12));box(.305,.008,.013,steel,0,y,.185);if([3,5,7,9,12,15,17].includes(f)){const prev=4.06-3.325*(1-2**(-(f-1)/12));for(const x of f===12?[-.06,.06]:[0])mesh(new THREE.CircleGeometry(.014,12),cream,x,(y+prev)/2,.181);}}
 // Headstock and tuning machines.
 const head=box(.38,.64,.11,mahogany,0,4.4,.01);head.rotation.x=-.12;
 for(let i=0;i<3;i++)for(const side of [-1,1]){rod(V(side*.16,4.22+i*.18,.025),V(side*.27,4.22+i*.18,.025),.015,steel);const tuner=mesh(new THREE.SphereGeometry(1,16,8),steel,side*.29,4.22+i*.18,.025);tuner.scale.set(.045,.058,.025);mesh(new THREE.CylinderGeometry(.027,.027,.04,14),steel,side*.107,4.22+i*.18,.092).rotation.x=Math.PI/2;}
 const labelCanvas=document.createElement('canvas');labelCanvas.width=512;labelCanvas.height=128;const lc=labelCanvas.getContext('2d');lc.fillStyle='#d6c096';lc.font='28px Georgia';lc.textAlign='center';lc.fillText('NOCTURNE',256,75);mesh(new THREE.PlaneGeometry(.27,.068),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(labelCanvas),transparent:true,depthWrite:false}),0,4.59,.09);
 // Strings are line strips: a decaying transverse wave makes every pluck visible.
 for(let i=0;i<6;i++){const positions=new Float32Array(49*3);const x=-.1375+i*.055;for(let p=0;p<=48;p++){positions[p*3]=x;positions[p*3+1]=.735+p/48*3.325;positions[p*3+2]=.235;}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(positions,3));const mat=new THREE.LineBasicMaterial({color:i<3?0xbda270:0xc5c7c3,transparent:true,opacity:.95});const line=new THREE.Line(geo,mat);line.name='guitar-string-'+i;group.add(line);strings.push({line,x,energy:0,age:0});const mark=mesh(new THREE.SphereGeometry(.027,12,8),new THREE.MeshStandardMaterial({color:0xdaca9a,emissive:0x998c52,emissiveIntensity:.55}),x,3,.245);mark.visible=false;markers.push(mark);}
 // A minimal dark stand touches the gallery floor.
 const stand=new THREE.Group();stand.name='guitar-stand';group.add(stand);const standMat=new THREE.MeshStandardMaterial({color:0x34362e,metalness:.3,roughness:.5});for(const x of [-.37,.37]){rod(V(x,-.22,.1),V(x,.1,.18),.023,standMat);rod(V(x,-.22,.1),V(x,-.22,-.47),.018,standMat);}rod(V(0,-.22,-.3),V(0,2.1,-.36),.022,standMat);rod(V(-.37,-.22,.1),V(.37,-.22,.1),.022,standMat);
 function finger(note){let best=-1;for(let i=5;i>=0;i--)if(note>=opens[i]&&note<=opens[i]+20){best=i;break;}return best;}
 return {group,setNotes(notes){active=new Set(notes);for(const n of active)if(!previous.has(n))this.pluck(n);previous=new Set(active);},pluck(note,which){const i=which??finger(note);if(i<0||i>5)return;strings[i].energy=1;strings[i].age=0;const fret=Math.max(0,Math.min(20,note-opens[i]));markers[i].position.y=fret===0?4.06:4.06-3.325*(1-2**(-(fret-.5)/12));markers[i].visible=fret>0;},update(dt,now){for(let i=0;i<6;i++){const s=strings[i];s.age+=dt;s.energy*=Math.exp(-dt*4);const a=s.line.geometry.attributes.position;for(let p=0;p<=48;p++){a.array[p*3]=s.x+Math.sin(p/48*Math.PI)*Math.sin(now*.055+p*.35)*.014*s.energy;}a.needsUpdate=true;s.line.material.color.setHex(s.energy>.12?0xe4c98a:i<3?0xbda270:0xc5c7c3);if(s.energy<.04)markers[i].visible=false;}}};
}
