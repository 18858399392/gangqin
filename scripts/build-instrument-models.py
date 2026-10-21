"""Original close-up model library. Run with Blender --background --python this_file."""
import bpy, math, bmesh
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)

def mesh(name,vertices,faces,bevel=0):
    # Author in browser Y-up coordinates, then let glTF perform its standard conversion.
    data=bpy.data.meshes.new(name);data.from_pydata([(x,-z,y) for x,y,z in vertices],[],faces);data.update()
    bm=bmesh.new();bm.from_mesh(data);bmesh.ops.recalc_face_normals(bm,faces=bm.faces);bm.to_mesh(data);bm.free()
    obj=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(obj)
    bpy.context.view_layer.objects.active=obj;obj.select_set(True)
    if bevel:
        mod=obj.modifiers.new('Soft manufactured edges','BEVEL');mod.width=bevel;mod.segments=5;mod.harden_normals=True
        bpy.ops.object.modifier_apply(modifier=mod.name)
        for p in obj.data.polygons:p.use_smooth=True
        normal=obj.modifiers.new('Weighted face normals','WEIGHTED_NORMAL');normal.keep_sharp=True;normal.weight=50
        bpy.ops.object.modifier_apply(modifier=normal.name)
    obj.select_set(False)
    # Projected wood UVs: source grain is along V, matching the neck's X length.
    uv=obj.data.uv_layers.new(name='SurfaceUV')
    for poly in obj.data.polygons:
        for i in poly.loop_indices:
            v=obj.data.vertices[obj.data.loops[i].vertex_index].co
            uv.data[i].uv=(v.y/1.5+.5,v.x/8.6+.5)
    return obj

def prism(name,outline,height,bevel):
    n=len(outline);vs=[(x,y,z) for y in [-height/2,height/2] for x,z in outline]
    fs=[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
    return mesh(name,vs,fs,bevel)

# Seven actual white-key shoulders rather than overlapping rectangular keytops.
for degree,(left,right) in {'C':(False,True),'D':(True,True),'E':(True,False),'F':(False,True),'G':(True,True),'A':(True,True),'B':(True,False)}.items():
    l=-.021 if left else -.053;r=.021 if right else .053
    outline=[(-.053,.555),(.053,.555),(.053,.13),(r,.13),(r,-.555),(l,-.555),(l,.13),(-.053,.13)]
    # Remove coincident/collinear shoulder points on the open side.
    compact=[]
    for v in outline:
        if not compact or v!=compact[-1]:compact.append(v)
    prism('key_white_'+degree,compact,.123,.0050)
# Tapered black key with a subtle sloped front, rounded corners and real front face.
vs=[(x,y,z) for y,w,front in [(-.055,.034,.335),(.055,.0295,.314)] for x,z in [(-w,-.335),(w,-.335),(w,front),(-w,front)]]
mesh('key_black',vs,[(3,2,1,0),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)],.0045)
# Unit-width satin-black fallboard and softly profiled front rail; scaled only in width.
prism('case_back',[(-.5,-.13),(.5,-.13),(.5,.13),(-.5,.13)],.30,.025)
prism('case_front',[(-.5,-.055),(.5,-.055),(.5,.055),(-.5,.055)],.115,.014)
prism('case_cheek',[(-.075,-.74),(.075,-.74),(.075,.74),(-.075,.74)],.24,.023)
# Radiused, very slightly tapering fingerboard and a smoothly rounded wooden neck.
xs=[-3.32+i*8.7/64 for i in range(65)];zs=[-1+i*2/32 for i in range(33)]
vs=[]
for layer in [0,1]:
 for x in xs:
  width=.716+(x+3.32)/8.7*.075
  for z in zs:
   zz=z*width;y=(.084-.027*z*z) if layer else -.035
   vs.append((x,y,zz))
count=len(xs)*len(zs);fs=[]
for layer in [0,1]:
 for i in range(64):
  for j in range(32):
   a=layer*count+i*33+j;f=(a,a+1,a+34,a+33);fs.append(f if layer else tuple(reversed(f)))
for i in range(64):
 for j in [0,32]:
  a=i*33+j;b=(i+1)*33+j;fs.append((a,b,b+count,a+count))
for i in [0,64]:
 for j in range(32):
  a=i*33+j;fs.append((a,a+count,a+count+1,a+1))
board=mesh('guitar_radiused_board',vs,fs,.005)
# D-shaped neck cross section, mostly visible along front/side of the close crop.
vs=[];steps=32
for x in [-3.34,5.4]:
 width=.72+(x+3.34)/8.74*.08
 for j in range(steps+1):
  a=math.pi*j/steps;vs.append((x,-.037-.24*math.sin(a),width*math.cos(a)))
fs=[tuple(range(steps,-1,-1)),tuple(range(steps+1,2*(steps+1)))]+[(i,i+1,i+steps+2,i+steps+1) for i in range(steps)]
mesh('guitar_neck',vs,fs,.012)
# A shaped bone nut with six shallow, round string slots cut into its crown.
bpy.ops.mesh.primitive_cube_add(size=1);nut=bpy.context.object;nut.name='guitar_bone_nut';nut.location=(-3.25,0,.105);nut.dimensions=(.087,1.47,.128);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
bevel=nut.modifiers.new('Rounded bone edges','BEVEL');bevel.width=.016;bevel.segments=6;bpy.context.view_layer.objects.active=nut;bpy.ops.object.modifier_apply(modifier=bevel.name)
for s in range(6):
    z=.6-s*.24
    bpy.ops.mesh.primitive_cylinder_add(vertices=16,radius=.009+(5-s)*.001,depth=.16,location=(-3.25,-z,.171),rotation=(0,math.pi/2,0));cut=bpy.context.object
    bpy.context.view_layer.objects.active=nut;mod=nut.modifiers.new('String slot','BOOLEAN');mod.object=cut;mod.operation='DIFFERENCE';bpy.ops.object.modifier_apply(modifier=mod.name);bpy.data.objects.remove(cut,do_unlink=True)
for p in nut.data.polygons:p.use_smooth=True
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=str(ROOT/'dist/assets/models/instrument-detail.glb'),export_format='GLB',export_yup=True,export_apply=True,export_materials='NONE',export_extras=True)
print('MODEL_LIBRARY_READY',len(bpy.data.objects))
