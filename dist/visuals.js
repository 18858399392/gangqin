export function createStudio(THREE){
 const group=new THREE.Group();group.name='photographic-studio';
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(100,100),new THREE.MeshStandardMaterial({color:0x171a1c,roughness:.88,metalness:0}));floor.rotation.x=-Math.PI/2;floor.position.y=-.31;floor.receiveShadow=true;group.add(floor);return group;
}
