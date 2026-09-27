(() => {
 'use strict';
 const root=document.getElementById('ambient-background'), reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const mobile=matchMedia('(max-width:900px), (hover:none)');
 const icons=[
 '<path d="M15 23h34c7 0 12 25 6 28-5 3-12-9-15-9H24c-3 0-10 12-15 9-6-3-1-28 6-28Z"/><path d="M19 28v11m-5-5h10"/><circle cx="44" cy="30" r="1.7"/><circle cx="49" cy="36" r="1.7"/>',
 '<path d="m22 19-14 13 14 13m20-26 14 13-14 13m-6-30-8 34"/>',
 '<path d="M24 10h-5c-7 0-5 10-5 15 0 4-3 7-7 7 4 0 7 3 7 7 0 5-2 15 5 15h5m16-44h5c7 0 5 10 5 15 0 4 3 7 7 7-4 0-7 3-7 7 0 5 2 15-5 15h-5"/>',
 '<path d="m32 7 23 13v25L32 58 9 45V20L32 7Zm0 26L9 20m23 13 23-13M32 33v25M21 14l23 13v12"/>',
 '<rect x="9" y="12" width="46" height="36" rx="3"/><path d="M9 21h46m-38 9 6 5-6 5m12 0h10M23 55h18M32 48v7"/><circle cx="15" cy="17" r=".6"/>',
 '<ellipse cx="32" cy="14" rx="20" ry="7"/><path d="M12 14v34c0 9 40 9 40 0V14M12 31c0 9 40 9 40 0"/>',
 '<circle cx="18" cy="12" r="5"/><circle cx="18" cy="52" r="5"/><circle cx="47" cy="16" r="5"/><path d="M18 17v30m0-10c0-15 29-2 29-16"/>',
 '<path d="M22 10h20v14H22zM22 24H8v15h14v15h15V39h15V24H37"/>',
 '<path d="m19 8 34 24-34 24Z"/>',
 '<rect x="16" y="16" width="32" height="32" rx="3"/><path d="M24 23h17v18H24zM23 8v8m10-8v8m10-8v8M23 48v8m10-8v8m10-8v8M8 23h8m-8 10h8m-8 10h8m32-20h8m-8 10h8m-8 10h8"/>',
 '<rect x="20" y="24" width="24" height="29" rx="12"/><path d="M24 24v-5a8 8 0 0 1 16 0v5M32 25v27M26 12l-5-6m17 6 5-6M12 22l9 8m-13 8h12m-8 16 10-9m30-23-9 8m13 8H44m8 16-10-9"/>',
 '<rect x="9" y="43" width="46" height="14" rx="5"/><circle cx="32" cy="16" r="9"/><path d="M32 25v22M25 48h14m-21 1h3m24 0h3"/>',
 '<path d="M12 46C12 10 52 54 52 18M12 46V16m40 2v30"/><circle cx="12" cy="46" r="4"/><circle cx="52" cy="18" r="4"/><rect x="9" y="10" width="6" height="6"/><rect x="49" y="48" width="6" height="6"/>'
 ];
 const positions=[[2,19,65,1,18],[91,15,58,88,30],[2,70,50,1,73],[92,78,65,87,80],[75,38,62,89,54],[45,91,45,42,93],[53,14,46,5,45],[82,90,46,5,45],[97,49,44,5,45],[22,92,46,5,45],[13,53,44,2,43],[67,73,56,45,11],[34,15,46,65,91]];
 const names=['controller','code','braces','cube','terminal','database','git-branch','blocks','play','chip','bug','joystick','path-nodes'];
 const palette=[['#148cab','#58d4ef'],['#9164ce','#b69af6'],['#329878','#6ad6b7'],['#c58b26','#edbc69'],['#c97062','#f09c8d']];
 const colorIndexes=[0,1,2,3,0,2,4,1,2,4,4,0,1];
 const startAngles=positions.map((_,i)=>i<10?(i%2?-1:1)*i*7:[-8,8,-12][i-10]);
 const elements=positions.map(([x,y,size,mx,my],i)=>{
  const el=document.createElement('div');
  const [light,dark]=palette[colorIndexes[i]];
  el.className='ambient-item'+(i>=6&&i<10?' ambient-desktop-only':'');
  el.dataset.icon=names[i];
  el.style.cssText=`--x:${x}%;--y:${y}%;--size:${size}px;--delay:${-i*1.8}s;--float-duration:${(5.5+i*.27).toFixed(2)}s;--start-angle:${startAngles[i]}deg;--glow-light:${light};--glow-dark:${dark}`;
  el.innerHTML=`<div class="ambient-rotate"><svg viewBox="0 0 64 64" focusable="false">${icons[i]}</svg></div>`;
  root.append(el);
  return el;
 });
 const mobileElements=elements.filter(el=>!el.classList.contains('ambient-desktop-only'));
 const mobilePositions=positions.filter((_,i)=>i<6||i>=10);
 const copyByPanel=[...document.querySelectorAll('.panel')].map(panel=>({panel,blocks:[...panel.querySelectorAll('h1,h2,h3,p,.text-link,.project-meta,.project-points,.skill-stack,.hack-details,.contact-layout,.gallery-trigger')]}));
 let pending=0,positionFrame=0,positionTimer=0,progress=0,lastCheck=0,settleTimer=0,touching=false;
 function positionMobileIcons(){
  positionFrame=0;
  if(!mobile.matches)return;
  const viewport=window.visualViewport;
  // Ignore pinch zoom: the decorations should not chase the zoomed view.
  const width=viewport&&viewport.scale===1?viewport.width:innerWidth;
  const height=viewport&&viewport.scale===1?viewport.height:innerHeight;
  mobileElements.forEach((el,i)=>{
   const [, , , mx, my]=mobilePositions[i];
   el.style.transform=`translate3d(${(width*mx/100).toFixed(2)}px,${(height*my/100).toFixed(2)}px,0)`;
  });
  clearTimeout(positionTimer);
  positionTimer=setTimeout(protectCopy,750);
 }
 function queueMobilePosition(){
  if(mobile.matches&&!positionFrame)positionFrame=requestAnimationFrame(positionMobileIcons);
 }
 function protectCopy(){
  if(mobile.matches&&touching)return;
  const inView=r=>r.right>0&&r.left<innerWidth&&r.bottom>0&&r.top<innerHeight;
  const boxes=copyByPanel.filter(({panel})=>inView(panel.getBoundingClientRect())).flatMap(({blocks})=>blocks.map(e=>e.getBoundingClientRect()).filter(inView));
  elements.forEach(el=>{const r=el.getBoundingClientRect();el.classList.toggle('near-copy',boxes.some(b=>r.left<b.right+12&&r.right>b.left-12&&r.top<b.bottom+12&&r.bottom>b.top-12));});
 }
 function rotateIcons(){
  elements.forEach((el,i)=>{
   if(mobile.matches&&el.classList.contains('ambient-desktop-only'))return;
   const angle=reduced.matches?0:startAngles[i]+(i%2?-1:1)*progress*(38+i*4);
   el.firstElementChild.style.transform=`rotate(${angle}deg)`;
  });
 }
 function update(){
  pending=0;
  if(!mobile.matches)rotateIcons();
  const now=performance.now();
  if(!mobile.matches&&now-lastCheck>120){protectCopy();lastCheck=now;}
 }
 function settleMobileRotation(){
  clearTimeout(settleTimer);
  if(touching)return;
  settleTimer=setTimeout(()=>{
   root.classList.remove('ambient-touching');
   rotateIcons();
   protectCopy();
  },180);
 }
 window.portfolioAmbient={setProgress(p){
  progress=Math.max(0,Math.min(1,Number(p)||0));
  // Ease mobile icons to their new angle after scrolling settles. Keeping
  // decoration updates out of the gesture keeps touch scrolling responsive.
  if(mobile.matches){settleMobileRotation();return;}
  if(!pending)pending=requestAnimationFrame(update);
 }};
 function refreshMode(){
  clearTimeout(settleTimer);
  touching=false;
  root.classList.remove('ambient-touching');
  root.classList.remove('ambient-positioned');
  cancelAnimationFrame(positionFrame);
  positionFrame=0;
  if(mobile.matches){
   positionMobileIcons();
   requestAnimationFrame(()=>root.classList.add('ambient-positioned'));
  }else{
   clearTimeout(positionTimer);
   elements.forEach(el=>el.style.removeProperty('transform'));
  }
  elements.forEach(el=>el.firstElementChild.style.removeProperty('transform'));
  rotateIcons();
  window.portfolioAmbient.setProgress(progress);
 }
 addEventListener('resize',()=>{
  queueMobilePosition();
  window.portfolioAmbient.setProgress(progress);
 },{passive:true});
 window.visualViewport?.addEventListener('resize',queueMobilePosition,{passive:true});
 addEventListener('touchstart',()=>{
  if(!mobile.matches)return;
  touching=true;
  clearTimeout(settleTimer);
  // Freeze any easing left over from a navigation click before a new swipe.
  const visible=mobileElements.map(el=>el.firstElementChild);
  const transforms=visible.map(el=>getComputedStyle(el).transform);
  root.classList.add('ambient-touching');
  visible.forEach((el,i)=>{el.style.transform=transforms[i];});
 },{passive:true});
 function finishTouch(event){
  if(!mobile.matches||event.touches.length)return;
  touching=false;
  settleMobileRotation();
 }
 addEventListener('touchend',finishTouch,{passive:true});
 addEventListener('touchcancel',finishTouch,{passive:true});
 mobile.addEventListener('change',refreshMode);
 reduced.addEventListener('change',refreshMode);
 document.fonts?.ready.then(protectCopy);addEventListener('load',protectCopy,{once:true});
 refreshMode();setTimeout(protectCopy,1000);
})();
