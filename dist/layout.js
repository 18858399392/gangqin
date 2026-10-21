export function isMobileViewport(width=window.innerWidth,height=window.innerHeight){
 const query=q=>typeof matchMedia==='function'&&matchMedia(q).matches;
 const shortSide=Math.min(width,height),screenShort=Math.min(window.screen?.width||Infinity,window.screen?.height||Infinity);
 const mobileAgent=navigator.userAgentData?.mobile||/Android|iPhone|iPad|iPod/i.test(navigator.userAgent||'');
 const touch=navigator.maxTouchPoints>0||query('(pointer: coarse)')||query('(any-pointer: coarse)');
 // Embedded phone browsers can report a desktop UA and a fine pointer.
 return Boolean(mobileAgent||(touch&&shortSide<=1100)||(screenShort<=600&&shortSide<=600)||(width<=600&&height>width));
}
export function viewportLayout(width,height,mobile){const rotated=Boolean(mobile&&height>width);return {width:rotated?height:width,height:rotated?width:height,rotated,mobile};}
export function pointerIn(element,event){const r=element.getBoundingClientRect();if(document.body.classList.contains('landscape-rotated'))return {x:event.clientY-r.top,y:r.right-event.clientX};return {x:event.clientX-r.left,y:event.clientY-r.top};}
let installedLayout;
export function installLandscapeLayout(){
 if(installedLayout)return installedLayout;
 const shell=document.querySelector('#app-shell');if(!shell)return;let frame;
 function update(){
  const viewport=window.visualViewport,useVisual=viewport&&Math.abs((viewport.scale||1)-1)<.05;
  const width=Math.round((useVisual?viewport.width:0)||window.innerWidth),height=Math.round((useVisual?viewport.height:0)||window.innerHeight);
  const size=viewportLayout(width,height,isMobileViewport(width,height));
  document.body.classList.toggle('landscape-rotated',size.rotated);document.body.classList.toggle('mobile-landscape',size.mobile);
  shell.style.setProperty('--ui-w',size.width+'px');shell.style.setProperty('--ui-h',size.height+'px');shell.style.setProperty('--physical-w',width+'px');
  shell.style.width=size.width+'px';shell.style.height=size.height+'px';shell.dataset.rotated=String(size.rotated);
  window.dispatchEvent(new Event('musiclayoutchange'));
 }
 function resize(){cancelAnimationFrame(frame);frame=requestAnimationFrame(update);}
 window.addEventListener('resize',resize);window.addEventListener('orientationchange',resize);window.visualViewport?.addEventListener('resize',resize);
 document.addEventListener('fullscreenchange',resize);document.addEventListener('webkitfullscreenchange',resize);
 installedLayout=update;update();return update;
}
export async function lockLandscape(){if(!isMobileViewport())return false;try{if(screen.orientation?.lock){await screen.orientation.lock('landscape');return true;}}catch{}return false;}
