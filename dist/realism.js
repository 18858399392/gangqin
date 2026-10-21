import * as THREE from './assets/three.module.js';
import {GLTFLoader} from './assets/vendor/GLTFLoader.js';
import {RGBELoader} from './assets/vendor/RGBELoader.js';

let detailPromise;
export function loadDetailLibrary(){
 if(!detailPromise)detailPromise=new GLTFLoader().loadAsync('./assets/models/instrument-detail.glb').then(gltf=>{const geometry=new Map();gltf.scene.updateMatrixWorld(true);gltf.scene.traverse(n=>{if(!n.isMesh)return;const g=n.geometry.clone();g.applyMatrix4(n.matrixWorld);geometry.set(n.name,g);});return geometry;});
 return detailPromise;
}

function microSurface(){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const ctx=canvas.getContext('2d');
 const data=ctx.createImageData(128,128);let seed=19;
 for(let i=0;i<data.data.length;i+=4){seed=(seed*1664525+1013904223)>>>0;const v=128+(seed%23)-11;data.data[i]=data.data[i+1]=data.data[i+2]=v;data.data[i+3]=255;}
 ctx.putImageData(data,0,0);const t=new THREE.CanvasTexture(canvas);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(3,22);return t;
}
export function createInstrumentMaterials(renderer){
 const loader=new THREE.TextureLoader(),micro=microSurface(),anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
 const map=loader.load('./assets/materials/wood_table_001_diff_1k.jpg');map.colorSpace=THREE.SRGBColorSpace;
 const normal=loader.load('./assets/materials/wood_table_001_nor_gl_1k.jpg'),roughness=loader.load('./assets/materials/wood_table_001_rough_1k.jpg');
 for(const t of [map,normal,roughness]){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=anisotropy;}
 const result={
  lacquer:new THREE.MeshPhysicalMaterial({color:0x080a0c,metalness:0,roughness:.19,clearcoat:1,clearcoatRoughness:.065,envMapIntensity:.8}),
  white:new THREE.MeshPhysicalMaterial({color:0xf4f1ea,metalness:0,roughness:.29,clearcoat:.22,clearcoatRoughness:.24,bumpMap:micro,bumpScale:.00013,envMapIntensity:.65}),
  black:new THREE.MeshPhysicalMaterial({color:0x16191a,metalness:0,roughness:.25,clearcoat:.65,clearcoatRoughness:.15,bumpMap:micro,bumpScale:.00008,envMapIntensity:.8}),
  wood:new THREE.MeshPhysicalMaterial({color:0xaaa08f,map,normalMap:normal,normalScale:new THREE.Vector2(.16,.16),roughnessMap:roughness,roughness:.94,metalness:0,clearcoat:.08,clearcoatRoughness:.5,envMapIntensity:.45}),
  neck:new THREE.MeshPhysicalMaterial({color:0xb49c83,map,normalMap:normal,normalScale:new THREE.Vector2(.10,.10),roughnessMap:roughness,roughness:.52,clearcoat:.45,clearcoatRoughness:.2,envMapIntensity:.7}),
  bone:new THREE.MeshPhysicalMaterial({color:0xe2dac9,roughness:.4,metalness:0,clearcoat:.12}),
  nickel:new THREE.MeshStandardMaterial({color:0xc5c7c5,metalness:1,roughness:.24,envMapIntensity:1.1}),
  felt:new THREE.MeshStandardMaterial({color:0x35151b,roughness:1}),
 };
 result.wood.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=max(.58,roughnessFactor);');};
 return result;
}
export function createPhotographicLighting(scene,renderer,mobile){
 const fill=new THREE.HemisphereLight(0xe8edf0,0x232424,.5);scene.add(fill);
 const key=new THREE.DirectionalLight(0xfff4e8,2.1);key.position.set(-2.5,6,3.5);key.castShadow=true;key.shadow.mapSize.set(mobile?1024:2048,mobile?1024:2048);Object.assign(key.shadow.camera,{left:-7,right:7,top:7,bottom:-7,near:.1,far:18});key.shadow.normalBias=.0012;key.shadow.bias=-.00005;key.shadow.radius=3;scene.add(key);
 const edge=new THREE.DirectionalLight(0xd7e4ed,.7);edge.position.set(3,4,-4);scene.add(edge);
 const front=new THREE.DirectionalLight(0xffffff,.25);front.position.set(0,2,6);scene.add(front);
 // A fast local studio is present while the real photographic HDR loads.
 const env=new THREE.Scene();env.background=new THREE.Color(0x24282c);
 for(const [x,y,z,w,h,rx,ry] of [[0,6,0,8,4,-Math.PI/2,0],[-4,3,0,2,5,0,Math.PI/2],[2,3,-4,6,2,0,0]]){
  const card=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:0xffffff}));card.position.set(x,y,z);card.rotation.set(rx,ry,0);env.add(card);
 }
 const pmrem=new THREE.PMREMGenerator(renderer);let target=pmrem.fromScene(env,.04);scene.environment=target.texture;env.traverse(n=>{n.geometry?.dispose();n.material?.dispose();});
 const ready=new RGBELoader().loadAsync('./assets/materials/studio_small_09_1k.hdr').then(hdr=>{hdr.mapping=THREE.EquirectangularReflectionMapping;const next=pmrem.fromEquirectangular(hdr);scene.environment=next.texture;target.dispose();target=next;hdr.dispose();pmrem.dispose();return true;}).catch(()=>{pmrem.dispose();return false;});
 function theme(day){renderer.toneMappingExposure=day?1.08:.96;fill.intensity=day?.9:.5;key.intensity=day?2.6:2.1;edge.intensity=day?.55:.7;front.intensity=day?.4:.25;scene.environmentIntensity=day?.78:.62;scene.environmentRotation.set(0,.4,0);}
 theme(false);return {ready,theme,key};
}
