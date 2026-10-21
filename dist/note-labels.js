// Keep readable labels in screen space when a black key is narrower than its name.
export const needsKeyCallout=(textWidth,keyWidth)=>textWidth+8>keyWidth;

export function placeKeyCallouts(items,viewportWidth,{safeTop=72,gap=6,rowHeight=22,padding=6}={}){
 const rows=[],placed=[];
 for(const item of [...items].sort((a,b)=>a.anchorX-b.anchorX||a.midi-b.midi)){
  if(item.anchorX<0||item.anchorX>viewportWidth)continue;
  const width=Math.min(item.width,viewportWidth-padding*2),desired=Math.max(padding+width/2,Math.min(viewportWidth-padding-width/2,item.anchorX));
  let best={row:rows.length,x:desired,cost:rows.length*12};
  for(let row=0;row<rows.length;row++){
   const x=Math.max(desired,rows[row]+gap+width/2);
   if(x+width/2>viewportWidth-padding)continue;
   const cost=Math.abs(x-desired)+row*12;
   if(cost<=best.cost)best={row,x,cost};
  }
  rows[best.row]=best.x+width/2;
  placed.push({...item,width,x:best.x-width/2,row:best.row});
 }
 if(!placed.length)return placed;
 const top=Math.max(safeTop,Math.min(...placed.map(n=>n.anchorY))-rows.length*rowHeight-6);
 return placed.map(n=>({...n,y:top+n.row*rowHeight,height:rowHeight-4}));
}
