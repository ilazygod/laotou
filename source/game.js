
const c=document.getElementById('c'),g=c.getContext('2d');function safeBottom(){return 0}let W,H,G,hero,foes=[],shots=[],parts=[],drops=[],count=0,kicks=0,hp=3,tier=1,spawn=.5,attackClock=1.8,clock=0,slash=1,dead=false,hit=0,last=performance.now(),ultReady=false,ult=null,ultCount=0,hitStop=0,feedbackOn=true;const R=(a,b)=>a+Math.random()*(b-a);function resize(){W=innerWidth;H=innerHeight;G=H-Math.max(116,102+safeBottom());let d=Math.min(devicePixelRatio||1,2);c.width=W*d;c.height=H*d;g.setTransform(d,0,0,d,0,0);if(hero){hero.x=Math.min(W-20,hero.x);hero.y=Math.min(G,hero.y)}}function reset(){hero={x:W/2,y:G,vx:0,vy:0,kick:1,face:1};foes=[];shots=[];parts=[];drops=[];count=kicks=0;hp=3;tier=1;spawn=.5;clock=0;slash=1;dead=false;hit=0;ultReady=false;ult=null;ultCount=0;hitStop=0;syncUltimate()}resize();reset();addEventListener('resize',resize);
let intro='title',introT=0,introEnemies=16,openingKills=0;
const titleScreen=document.getElementById('titleScreen');
const introLabel=document.getElementById('introLabel');
function setIntro(s){intro=s;introT=0;titleScreen.style.display=s==='title'?'flex':'none';introLabel.style.display=s==='tutorial'?'block':'none';document.getElementById('controlBar').style.opacity='0';document.getElementById('touchZones').style.display=(s==='play'||s==='tutorial')?'block':'none';document.getElementById('statusDock').style.display=(s==='play'||s==='tutorial')?'block':'none';document.getElementById('demo').style.display=s==='play'?'block':'none';}
function openingWave(){
 foes=[];shots=[];parts=[];drops=[];
 // Independent irregular locations, with spacing but no rows or columns.
 const positions=[];
 for(let i=0;i<introEnemies;i++){
   spawnNinja();const n=foes[foes.length-1];let candidate,tries=0;
   do{candidate={x:R(28,W-28),y:R(92,G-112)};tries++}
   while(tries<140&&positions.some(p=>Math.hypot((p.x-candidate.x)*1.15,p.y-candidate.y)<53));
   positions.push(candidate);n.x=candidate.x;n.y=candidate.y;
   n.vx=0;n.vy=0;n.warn=0;n.burst=0;n.timer=999;n.introAlpha=0;n.introDelay=i*.047+Math.random()*.11;
 }
 hero.x=W*.5;hero.y=G;hero.vx=hero.vy=0;
 kicks=12;tier=4;syncUltimate();setIntro('tutorial');
}
document.getElementById('startGame').addEventListener('click',()=>{reset();setIntro('ignite')});
const pressed=new Map();let lastPress={left:-1e9,right:-1e9};const BOTH_WINDOW=190;
let queuedJump=null,queuedAt=0;const JUMP_BUFFER=.17,SLASH_CANCEL_AT=.17;
function syncUltimate(){ultReady=tier===4&&!dead&&!ult;document.getElementById('controlBar').classList.toggle('ready',ultReady)}
function performJump(d){hero.face=d;hero.vx=d*145;hero.vy=Math.max(-580,Math.min(hero.vy,0)-480);hero.kick=0;kicks++;tier=kicks>=12?4:kicks>=7?3:kicks>=3?2:1;syncUltimate()}
function jump(d){if(intro!=='play'||ult)return;if(dead){reset();return}if(slash<SLASH_CANCEL_AT){queuedJump=d;queuedAt=performance.now();return}queuedJump=null;performJump(d)}
function pressZone(id,d,e){e.preventDefault();if(e.pointerType==='mouse'&&e.button!==0)return;const now=performance.now(),other=id==='left'?'right':'left';pressed.set(e.pointerId,id);lastPress[id]=now;document.getElementById(id==='left'?'zoneL':'zoneR').classList.add('active');try{e.currentTarget.setPointerCapture(e.pointerId)}catch(_){}if(ultReady&&(Array.from(pressed.values()).includes(other)||now-lastPress[other]<BOTH_WINDOW)){queuedJump=null;if(intro==='tutorial')setIntro('openingUlt');startUltimate();return}jump(d)}
for(const [id,d,zid] of [['left',-1,'zoneL'],['right',1,'zoneR']]){const z=document.getElementById(zid);z.addEventListener('pointerdown',e=>pressZone(id,d,e));const release=e=>{pressed.delete(e.pointerId);z.classList.toggle('active',Array.from(pressed.values()).includes(id))};z.addEventListener('pointerup',release);z.addEventListener('pointercancel',release);z.addEventListener('lostpointercapture',release)}
document.addEventListener('contextmenu',e=>e.preventDefault());document.addEventListener('selectstart',e=>e.preventDefault());
document.getElementById('demo').addEventListener('pointerdown',e=>{e.preventDefault();if(intro!=='play')return;if(dead)reset();kicks=12;tier=4;syncUltimate()});
function startUltimate(){
 if(!ultReady||ult||dead)return;
 ultReady=false;document.getElementById('controlBar').classList.remove('ready');
 const targets=foes.slice(),start={x:hero.x,y:hero.y};
 // Every target is an actual point on a full side-to-side stroke.
 // All turning points lie outside the phone, never on an enemy.
 const margin=Math.max(90,W*.27),left=-margin,right=W+margin;
 const pending=targets.slice().sort((a,b)=>a.y-b.y);
 // Alternate top/bottom targets for a crosshatched web rather than a sweep.
 const ordered=[];
 while(pending.length){ordered.push(pending.shift());if(pending.length)ordered.push(pending.pop())}
 let side=hero.face>0?-1:1,points=[],strokes=[];
 for(let i=0;i<ordered.length;i++){
   const n=ordered[i],sx=side<0?left:right,ex=side<0?right:left;
   const slope=(i%4===0?.31:i%4===1?-.42:i%4===2?-.27:.38);
   const sy=n.y+slope*(sx-n.x),ey=n.y+slope*(ex-n.x);
   const entry={x:sx,y:sy},exit={x:ex,y:ey};
   if(points.length===0)points.push(entry);
   else points.push(entry); // bridge between successive off-screen points
   points.push(exit);
   strokes.push({entry,exit,target:n});
   side*=-1;
 }
 // Audit actual crossing geometry before animating.
 const crossed=new Set();
 for(const stroke of strokes){
   const a=stroke.entry,b=stroke.exit,dx=b.x-a.x,dy=b.y-a.y,den=dx*dx+dy*dy;
   for(const n of targets){const t=((n.x-a.x)*dx+(n.y-a.y)*dy)/den;
     if(t>=0&&t<=1&&Math.hypot(n.x-a.x-t*dx,n.y-a.y-t*dy)<18)crossed.add(n);
   }
 }
 if(crossed.size!==targets.length)console.warn('Ultimate path missed targets',targets.length-crossed.size);
 // Final exit and sudden ground landing are separate beats, not another diagonal stroke.
 const lens=[],total=points.slice(1).reduce((sum,p,i)=>{const a=points[i],d=Math.hypot(p.x-a.x,p.y-a.y);lens.push(d);return sum+d},0);
 ult={time:0,targets,points,lens,total,segments:[],duration:Math.max(.24,Math.min(.85,total/4900)),phase:'vanish',start,marked:new Set(),impactDone:false,landingX:W*.53,landingY:G,returnStart:null,impactAt:0};
 shots.forEach(s=>s.frozen=true);
}
function impactClearOldCorpses(){
 // Only corpses already on the ground are swept out. Newly slain foes fall normally.
 for(const o of parts){
   if(!o.sleep && o.y<G-18)continue;
   o.sleep=false;o.settle=0;o.clearOut=true;
   const dx=o.x-W/2,side=dx===0?(Math.random()<.5?-1:1):Math.sign(dx);
   o.vx=side*(330+Math.random()*180);o.vy=-(155+Math.random()*120);
   o.vr=side*(5+Math.random()*5);
 }
 for(let i=0;i<42;i++){
   const side=i%2?-1:1;
   drops.push({x:W/2+side*Math.random()*18,y:G-7,vx:side*(95+Math.random()*240),vy:-(30+Math.random()*115),life:.35+Math.random()*.35,dust:true});
 }
}
function p(s,fill,stroke,w=2){let q=new Path2D(s);if(fill){g.fillStyle=fill;g.fill(q)}if(stroke){g.strokeStyle=stroke;g.lineWidth=w;g.stroke(q)}}function l(s,col,w){p(s,null,col,w)}function ell(x,y,rx,ry,color){g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fillStyle=color;g.fill()}
function legacyOld(t){let rise=hero.vy<0,fl=Math.sin(t*.012)*4;g.save();g.translate(hero.x,hero.y-17);g.scale(hero.face*.43,.43);g.rotate(slash<.38?(-.2+Math.PI*1.72*Math.min(1,slash/.3)):(rise?-.2:.16));
if(slash>=.38){g.save();g.translate(-12,-65);g.rotate(-.55);p('M-6 -53 H6 L7 16 H-7Z','#39464d','#20333d');p('M-3 -84 H3 V-52 H-3Z','#6c5238');p('M-11 -79 H11 V-73 H-11Z','#d1b273');g.restore()}
let sw=Math.sin(t*.013)*4;if(rise)p(`M-13 -56 Q-32 -42 -43 -12 L-69 ${24+sw} Q-48 ${37+sw} -32 ${19+sw} L-8 -39Z`,'#a9b8bb','#4c6771');else p(`M-13 -56 Q-30 -76 -49 -92 L-63 ${-109+sw} Q-81 ${-107+sw} -83 ${-92+sw} L-52 -61 L-23 -35Z`,'#a9b8bb','#4c6771');
let phase=Math.sin(hero.kick*42),amp=hero.kick<.25?Math.sin(Math.PI*hero.kick/.25):0;for(let i=0;i<2;i++){let s=i?1:-1,kx=s*21+amp*phase*s*9,ky=i?17:21,fx=(i?10:-36)+amp*phase*s*18,fy=i?35:43;l(`M${s*9} 5 L${kx} ${ky}`,'#536873',12);l(`M${kx} ${ky} L${fx} ${fy}`,'#536873',10);p(`M${fx-6} ${fy-4} L${fx+11} ${fy-4} L${fx+14} ${fy+3} L${fx-6} ${fy+4}Z`,'#35464d')}
let hem=Math.sin(t*.01)*5;p(`M-17 -60 Q-23 -38 -22 -10 Q-32 2 -42 ${20+hem} Q-18 ${32+hem} 0 ${23+hem} Q20 ${31-hem} 43 ${18-hem} Q25 -6 19 -60Z`,'#8499a1','#4c6670');p('M-12 -56 L1 -24 L12 -56 L14 20 Q0 27 -12 20Z','#d9dcd2');p('M-21 -6 H21 V0 H-21Z','#536e78');if(rise)p(`M15 -53 Q25 -50 21 -41 L-6 ${-23+sw*.4} Q-18 -18 -31 ${-30+sw*.6} L-25 -47 Q-8 -47 6 -59Z`,'#b3c1c0','#4c6771');else p(`M14 -55 Q-2 -70 -15 -80 L-27 ${-92-sw*.5} Q-41 ${-97-sw} -47 ${-84-sw} L-31 -66 Q-10 -49 11 -32Z`,'#b3c1c0','#4c6771');
if(slash<.38){g.save();g.translate(16,-36);g.rotate(-.6);p('M-4 -10 L0 -100 L4 -10Z','#eafaff','#81b5c8');g.restore()}
p('M-16 -93 Q-18 -115 -5 -123 Q11 -127 17 -109 L15 -91Z','#f0efe8','#b7c1bd');p('M-9 -118 Q-13 -132 0 -139 Q13 -132 9 -118Z','#f0efe8','#b7c1bd');p('M-10 -120 Q0 -115 10 -120 L11 -114 Q0 -109 -11 -114Z','#596b73');p('M-15 -108 Q5 -117 18 -99 Q28 -80 16 -63 Q0 -55 -14 -70 Q-23 -90 -15 -108Z','#e9bc98','#9b785f');ell(-16,-87,4,6,'#e6b28f');ell(21,-83,10,8,'#c95b56');
if(tier===1)l('M5 -97 L18 -97','#423a34',2.6);else{let ew=6.67,ang=Math.tan(25*Math.PI/180)*ew,hh=tier===2?2.4:tier===3?6:8;if(tier===4){let q=Math.sin(t*.022)*3;p(`M-5 -94 Q-8 -113 5 ${-133+q} Q12 -116 19 ${-145+q} Q32 -113 24 -92Z`,'#f28b23');p('M1 -94 Q-1 -111 12 -127 Q22 -106 19 -94Z','#ffe15e')}p(`M${11-ew} ${-97-ang} Q11 ${-97-hh} ${11+ew} ${-97+ang} Q11 ${-97+hh} ${11-ew} ${-97-ang}Z`,'#ffd548','#986527',1.3)}
let bd=rise?-9:-43,bx=3+bd+Math.sin(t*.008)*5,by=rise?-23:-77;p(`M11 -67 Q27 -65 18 -49 Q${12+bd*.25} -38 ${bx} ${by} Q-7 -43 -8 -55Z`,'#f5f4eb','#c7cec8');for(let i=0;i<2;i++){let sx=9-i*5,sy=-104,ex=-76-i*11-hero.vx*.08,ey=rise?-12:-161;g.beginPath();for(let j=0;j<=35;j++){let u=j/35,xx=sx+(ex-sx)*u,yy=sy+(ey-sy)*u,off=4*Math.pow(u,1.4)*Math.min(1,(1-u)/.15)*Math.sin(2*Math.PI*(1.5*u-t*.0036+i*.22));xx+=off*(ey-sy)/180;yy+=off*(ex-sx)/-100;j?g.lineTo(xx,yy):g.moveTo(xx,yy)}g.strokeStyle=i?'#fffdf4':'#c4cbc7';g.lineWidth=i?5:4;g.lineCap='round';g.stroke()}g.restore();if(hero.kick<.24){g.strokeStyle='rgba(45,141,160,.65)';g.lineWidth=2.5;for(let i=0;i<4;i++){g.beginPath();g.moveTo(hero.x-hero.face*(14+i*7),hero.y+i*6);g.lineTo(hero.x-hero.face*(30+i*10),hero.y+17+i*7);g.stroke()}}}
function corpseBottomOffset(o){
 // Same local coordinates and .265 scale as corpse() renderer; projected feet/head/arms
 // determine the ground-contact point even after a half-body rotates.
 const pts=o.kind===0?[[-43,-163],[43,-163],[-63,-65],[63,-65],[-39,9],[39,9]]:[[-60,84],[60,84],[-43,-6],[43,-6]];
 const sn=Math.sin(o.rot),cs=Math.cos(o.rot);
 return Math.max(...pts.map(([x,y])=>(x*sn+y*cs)*.265));
}
function spawnNinja(){
 const progress=Math.min(1,clock/210);
 const redChance=.045+.17*progress,greenChance=.055+.19*progress;
 const roll=Math.random(),type=roll<redChance?'red':roll<redChance+greenChance?'green':'black';
 const v=Math.random()<.30?0:(Math.random()<.5?-1:1)*R(21,52);
 const speed=type==='green'?3.1:1;
 foes.push({type,x:R(30,W-30),y:-35,vx:v,vy:25*speed,max:R(70,108)*speed,dir:v>=0?1:-1,layer:Math.random()<.5?0:1,phase:R(0,7),timer:R(.75,1.45),warn:0,ground:false,burst:0,burstDelay:0,firstShot:false,priority:0,patrolV:0,patrolTimer:0,groundAge:0});
}
function fireNinjaShot(n){
 const dx=hero.x-n.x,dy=hero.y-20-(n.y-24),len=Math.hypot(dx,dy)||1,speed=R(135,172);
 shots.push({x:n.x,y:n.y-24,vx:dx/len*speed,vy:dy/len*speed,rot:0,life:4});
}
function scheduleAttack(dt){
 attackClock-=dt;
 if(attackClock>0||!foes.length)return;
 const choices=foes.filter(n=>n.warn<=0&&n.burst===0);
 if(choices.length){
 const weights=choices.map(n=>n.type==='red'?2.0:1);
 let sum=weights.reduce((a,b)=>a+b,0),pick=Math.random()*sum;
 let target=choices[0];
 for(let i=0;i<choices.length;i++){pick-=weights[i];if(pick<=0){target=choices[i];break;}}
 target.warn=.55;
 }
 const progress=Math.min(1,clock/270);
 attackClock=R(2.3,2.9)*(1-.57*progress);
}
function kill(n,grant=true){count++;if(grant){ultCount++}let dx=n.x-hero.x;for(let kind=0;kind<2;kind++)parts.push({kind,type:n.type,x:n.x,y:n.y+(kind?8:-8),vx:n.vx*.55+hero.face*(kind?28:100)+dx*.18,vy:n.vy*(kind?.9:.4)-R(30,110),rot:R(-.3,.3),vr:(kind?-1:1)*hero.face*R(2.5,6),sleep:false,settle:0});for(let i=0;i<12;i++)drops.push({x:n.x,y:n.y,vx:R(-100,100)+hero.face*40,vy:R(-100,25),life:R(.3,.8)})}
function hitNinja(n){
 slash=0; hero.vx*=.88;
 const dx=n.x-hero.x,dy=n.y-(hero.y-20),dist=Math.hypot(dx,dy)||1;
 hero.vx-=dx/dist*5.8;hero.vy-=dy/dist*5.8;
 kill(n);
}
// The sword occupies a moving tapered crescent, not a circular invulnerability field.
const SLASH_DURATION=.38, SLASH_RADIUS=76;
function swordHit(px,py,extra=0){
 if(slash>=SLASH_DURATION)return false;
 const u=slash/SLASH_DURATION, sweep=Math.min(1,u/.69);
 const dx=(px-hero.x)*hero.face,dy=py-(hero.y-21);
 const rr=Math.hypot(dx,dy),a=Math.atan2(dy,dx);
 const start=-2.75,span=Math.PI*1.78*sweep;
 let da=(a-start+Math.PI*4)%(Math.PI*2);
 if(da>span)return false;
 const v=span>0?da/span:0;
 const thickness=(5+25*Math.pow(Math.sin(Math.PI*Math.min(1,v)),1.15))*Math.min(1,u/.10,(1-u)/.09);
 return Math.abs(rr-SLASH_RADIUS)<thickness*.55+extra;
}
function update(dt){if(dead)return;if(intro==='title'||intro==='ignite'||intro==='zoom'||intro==='tutorial')return;if(ult){
 ult.time+=dt;const u=ult.time;
 if(u<.075){ult.phase='vanish';hero.hiddenUlt=true}
 else if(u<.075+ult.duration){
  ult.phase='dash';let distance=(u-.075)/ult.duration*ult.total,i=0;
  while(i<ult.lens.length-1&&distance>ult.lens[i]){distance-=ult.lens[i];i++}
  const a=ult.points[i],b=ult.points[i+1],f=Math.min(1,distance/(ult.lens[i]||1));
  hero.x=a.x+(b.x-a.x)*f;hero.y=a.y+(b.y-a.y)*f;
  hero.hiddenUlt=hero.x<0||hero.x>W||hero.y<0||hero.y>H;
  ult.segments=ult.points.slice(0,i+1).map(q=>({...q}));ult.segments.push({x:hero.x,y:hero.y});
 }else if(u<.075+ult.duration+.17){
  // Visible diagonal return from the final OFFSCREEN endpoint to the lower-center composition point.
  ult.phase='return';const f=Math.max(0,Math.min(1,(u-.075-ult.duration)/.17));
  const a=ult.points[ult.points.length-1],smooth=f*f*(3-2*f);
  hero.x=a.x+(ult.landingX-a.x)*smooth;hero.y=a.y+(ult.landingY-a.y)*smooth;
  hero.hiddenUlt=hero.x<-25||hero.x>W+25||hero.y<-30||hero.y>H+30;
  ult.segments=ult.points.map(q=>({...q}));ult.segments.push({x:hero.x,y:hero.y});
 }else if(u<.075+ult.duration+.17+.49){
  // A deliberate sheathing gesture, with NO world-frame hitstop.
  ult.phase='sheathe';hero.x=ult.landingX;hero.y=G;hero.hiddenUlt=false;hero.vx=hero.vy=0;
  ult.sheathT=(u-(.075+ult.duration+.17))/.24;
  ult.segments=ult.points.map(q=>({...q}));ult.segments.push({x:ult.landingX,y:G});
 }else if(u<.075+ult.duration+.17+.49+.27){
  ult.phase='impact';hero.x=ult.landingX;hero.y=G;hero.hiddenUlt=false;hero.vx=hero.vy=0;
  if(!ult.impactDone){impactClearOldCorpses();ult.impactDone=true}
 }else{
  for(const n of ult.targets){let index=foes.indexOf(n);if(index>=0){kill(n,false);foes.splice(index,1)}}
  if(intro==='openingUlt'){
   // Opening is a clean cinematic wipe: every newly cut piece is blasted beyond screen edges.
   for(const o of parts){const side=o.x<W*.5?-1:1;o.clearOut=true;o.sleep=false;o.settle=0;
     o.vx=side*(650+Math.random()*260);o.vy=-(120+Math.random()*210);o.vr=side*(7+Math.random()*6)}
 }
 shots=[];ult=null;hero.x=W*.53;hero.y=G;hero.vx=hero.vy=0;hero.hiddenUlt=false;
  kicks=0;tier=1;slash=1;syncUltimate();if(intro==='openingUlt'){openingKills=count;clock=0;attackClock=1.4;spawn=.8;setIntro('play');}
 }
 // Old corpses continue flying during the cinematic.
 for(let i=parts.length-1;i>=0;i--){const o=parts[i];if(!o.clearOut)continue;
  o.vy+=430*dt;o.x+=o.vx*dt;o.y+=o.vy*dt;o.rot+=o.vr*dt;
  if(o.x<-85||o.x>W+85)parts.splice(i,1);
 }
 for(let i=drops.length-1;i>=0;i--){const b=drops[i];if(!b.dust)continue;b.life-=dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.vy+=440*dt;if(b.life<=0)drops.splice(i,1)}
 return;
}clock+=dt;slash+=dt;if(queuedJump!==null){if(performance.now()-queuedAt>JUMP_BUFFER*1000)queuedJump=null;else if(slash>=SLASH_CANCEL_AT){const d=queuedJump;queuedJump=null;performJump(d)}}hit=Math.max(0,hit-dt);hero.kick+=dt;const prevHeroX=hero.x,prevHeroY=hero.y;hero.vy+=740*dt;hero.x+=hero.vx*dt;hero.y+=hero.vy*dt;if(hero.y<82){hero.y=82;hero.vy=Math.max(0,hero.vy)}hero.vx*=Math.exp(-.24*dt);if(hero.x<25){hero.x=25;hero.vx=0}if(hero.x>W-25){hero.x=W-25;hero.vx=0}if(hero.y>=G){if(hero.y>G||hero.vy>0){kicks=0;tier=1;syncUltimate()}hero.y=G;hero.vy=0}
spawn-=dt;if(spawn<=0&&foes.length<23){spawnNinja();spawn=R(.65,1.1)*Math.max(.65,1-clock/180)}for(let i=foes.length-1;i>=0;i--){let n=foes[i];if(!n.ground){let target=n.max*(n.warn>0&&n.type!=='green'?.48:1);n.vy+=(target-n.vy)*Math.min(1,dt*2.5);n.y+=n.vy*dt;n.x+=n.vx*dt;if(n.x<24||n.x>W-24){n.x=Math.max(24,Math.min(W-24,n.x));n.vx*=-1;n.dir=n.vx>=0?1:-1}if(n.y>=G-12){n.y=G-12;n.ground=true;n.vx=0;n.vy=0;n.groundAge=0;n.patrolTimer=R(.45,1.2);n.patrolV=(Math.random()<.5?-1:1)*R(16,28);if(n.type==='green'&&!n.firstShot){n.warn=.27;n.firstShot=true}}}
if(n.ground){
 n.groundAge=(n.groundAge||0)+dt;
 n.patrolTimer-=dt;
 if(n.patrolTimer<=0){n.patrolTimer=R(1.3,2.9);if(Math.random()<.32)n.patrolV*=-1;}
 // Ground enemies walk visibly, but pause to aim and throw.
 const walking=n.warn<=0&&n.burst===0&&n.groundAge>.34;
 if(walking){
  n.x+=(n.patrolV||0)*dt;
  if(n.x<28||n.x>W-28){n.x=Math.max(28,Math.min(W-28,n.x));n.patrolV*=-1;}
  n.dir=n.patrolV>=0?1:-1;
  // Nudge only corpses already resting on the floor; no new physics for airborne pieces.
  for(const o of parts){
   if(!o.sleep||o.clearOut)continue;
   const nearX=Math.abs(o.x-n.x),nearY=Math.abs((o.y+corpseBottomOffset(o))-(G+23));
   if(nearX<18&&nearY<5){
    o.x=Math.max(12,Math.min(W-12,o.x+Math.sign(n.patrolV)*Math.min(22*dt,3)));
    o.rot+=Math.sign(n.patrolV)*.13*dt;
    o.y=G+23-corpseBottomOffset(o);
   }
  }
 }
}
if(!n.firstShot&&!n.ground){n.timer-=dt;if(n.timer<=0){n.warn=n.type==='red'?.38:.5;n.firstShot=true}}
if(n.warn>0){
 n.warn-=dt;
 if(n.warn<=0){
   fireNinjaShot(n);
   if(n.type==='red'){n.burst=1;n.burstDelay=.19;}
 }
}
if(n.burst>0){n.burstDelay-=dt;if(n.burstDelay<=0){fireNinjaShot(n);n.burst=0;}}
if(Math.hypot(n.x-hero.x,n.y-(hero.y-20))<(58+19)){if(slash>=.38)hitNinja(n);else kill(n);foes.splice(i,1)}}
for(let i=shots.length-1;i>=0;i--){let s=shots[i];s.life-=dt;const prevX=s.x,prevY=s.y;s.x+=s.vx*dt;s.y+=s.vy*dt;s.rot+=dt*12;if(s.life<=0||s.y>H+20||s.x<-20||s.x>W+20){shots.splice(i,1);continue}if(!s.reflected&&swordHit(s.x,s.y,6)){const dx=s.x-hero.x,dy=s.y-(hero.y-21),m=Math.hypot(dx,dy)||1; s.vx=dx/m*235+hero.vx*.25;s.vy=dy/m*235+hero.vy*.25;s.x+=dx/m*12;s.y+=dy/m*12;s.reflected=true;s.life=Math.min(s.life,1.3);continue}if(!s.reflected&&hit<=0){
 // Relative-motion swept test: both the shuriken centre and the moving hero
 // traverse their entire frame segments. This preserves centre-path collision.
 const ax=prevX-prevHeroX,ay=prevY-prevHeroY;
 const bx=s.x-hero.x,by=s.y-hero.y;
 const dx=bx-ax,dy=by-ay,den=dx*dx+dy*dy;
 const near=(offset,r)=>{
   const q=Math.max(0,Math.min(1,den?-(ax*dx+(ay+offset)*dy)/den:0));
   return Math.hypot(ax+dx*q,ay+offset+dy*q)<=r;
 };
 if(near(33,12)||near(17,13)||near(5,9)){
   hp--;hit=.43;shots.splice(i,1);if(hp<=0)dead=true;
 }
}
}
for(let o of parts){if(o.clearOut){o.vy+=430*dt;o.x+=o.vx*dt;o.y+=o.vy*dt;o.rot+=o.vr*dt;continue}if(o.sleep){o.y=G+23-corpseBottomOffset(o);o.vx=0;o.vy=0;o.vr=0;continue}o.vy+=740*dt;o.x+=o.vx*dt;o.y+=o.vy*dt;o.rot+=o.vr*dt;if(o.x<12||o.x>W-12){o.x=Math.max(12,Math.min(W-12,o.x));o.vx*=-.3}let floor=G+23-corpseBottomOffset(o);if(o.y>floor){o.y=floor;if(Math.abs(o.vy)>45){o.vy*=-.2;o.vx*=.7;o.vr*=.6;o.settle=0}else{o.vy=0;o.vx*=Math.exp(-9*dt);o.vr*=Math.exp(-9*dt);if(Math.abs(o.vx)<8&&Math.abs(o.vr)<.22)o.settle+=dt;else o.settle=0;if(o.settle>.32){o.sleep=true;o.vx=o.vr=0}}}}
for(let i=parts.length-1;i>=0;i--){const o=parts[i];if(o.clearOut&&(o.x<-90||o.x>W+90||o.y>H+100))parts.splice(i,1)}
for(let i=drops.length-1;i>=0;i--){let b=drops[i];b.life-=dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.vy+=530*dt;if(b.life<=0||b.y>G)drops.splice(i,1)}}
function draw(t,cinematic=false){drawInkBackground();speedDraw();for(const o of parts)if(o.x>-85&&o.x<W+85)corpse(o);for(const n of foes)if(n.layer===0)ninja(n,t);if(!hero.hiddenUlt&&!(hit>0&&Math.floor(t/85)%2))old(t);for(const n of foes)if(n.layer===1)ninja(n,t);slashDraw();if(ult){g.save();if(['dash','return','sheathe','impact'].includes(ult.phase)){
// Preserve every boundary-to-boundary red stroke until the final synchronized cut.
 let pts=ult.phase==='dash'?ult.segments:ult.points;
 for(let j=1;j<pts.length;j++){
  let a=pts[j-1],b=pts[j];
  g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);
  const bloom=ult.phase==='impact'?1:ult.phase==='sheathe'?.55:0;
  // Fine red strokes first; after sheathing, each line swells into a soft luminous blade.
  g.strokeStyle=`rgba(173,54,67,${.44+.16*bloom})`;g.lineWidth=1.05+1.25*bloom;g.stroke();
  g.save();g.shadowBlur=0;
  g.strokeStyle=`rgba(165,78,59,${.12+.22*bloom})`;g.lineWidth=2+5*bloom;g.stroke();
  if(bloom){g.strokeStyle=`rgba(80,64,55,${.3*bloom})`;g.lineWidth=.7+1.3*bloom;g.stroke()}
  g.restore();
 }
}if(ult.phase==='impact'){
 const k=Math.min(1,Math.max(0,(ult.time-(.075+ult.duration+.17+.49))/.27));
 const flash=Math.sin(Math.PI*k);
 g.fillStyle=`rgba(255,232,225,${.16*flash})`;g.fillRect(0,0,W,H);
 for(let j=0;j<16;j++){const a=j*Math.PI*2/16,r=20+Math.max(W,H)*.85*k;
  g.strokeStyle=`rgba(255,174,160,${.32*(1-k)})`;g.lineWidth=1.2;
  g.beginPath();g.moveTo(hero.x+Math.cos(a)*20,G-15+Math.sin(a)*8);
  g.lineTo(hero.x+Math.cos(a)*r,G-15+Math.sin(a)*r*.45);g.stroke();}
 }g.fillStyle='rgba(28,24,36,.085)';g.fillRect(0,0,W,H);g.fillStyle='rgba(119,43,55,.7)';g.font='bold 16px system-ui';g.fillText(ult.phase==='vanish'?'瞬身':ult.phase==='dash'?'一瞬千斩':'……',W/2-42,76);g.restore()}for(const s of shots){g.save();g.translate(s.x,s.y);g.rotate(s.rot);g.scale(.61,.61);p('M0 -14 L4 -5 L14 0 L5 4 L0 14 L-4 5 L-14 0 L-5 -4Z M0 -5 L-5 0 L0 5 L5 0Z','#4c5961','#1f303b',2);g.globalCompositeOperation='destination-out';p('M0 -4 L-4 0 L0 4 L4 0Z','#000');g.globalCompositeOperation='source-over';g.restore()}for(const b of drops){g.fillStyle=b.dust?`rgba(220,208,181,${Math.min(.7,b.life*1.7)})`:`rgba(176,50,59,${Math.min(1,b.life*2)})`;g.beginPath();g.arc(b.x,b.y,2.2,0,7);g.fill()}}
function introDraw(t){
 if(intro==='title'||intro==='ignite'||intro==='zoom'){
  // Camera zooms the ENTIRE WORLD, including floor and mountains, around the hero.
  // The original hero is drawn only by draw(), never by an extra overlay.
  const f=intro==='zoom'?Math.min(1,introT/1.15):0;
  const smooth=f*f*(3-2*f),zoom=1+3.1*(1-smooth);
  const saved={...hero},savedTier=tier;
  hero.x=W*.5;hero.y=G;hero.vx=hero.vy=0;hero.face=1;hero.kick=1;
  tier=intro==='title'?1:intro==='ignite'?Math.min(4,1+Math.floor(introT/.17)):4;
  const screenY=H*.48*(1-smooth)+(G-55)*smooth;
  g.fillStyle='#f6f2e8';g.fillRect(0,0,W,H);
  g.save();g.translate(W*.5,screenY);g.scale(zoom,zoom);
  g.translate(-hero.x,-(hero.y-55));draw(t,true);g.restore();
  tier=savedTier;Object.assign(hero,saved);
  if(intro==='ignite'){const glow=Math.min(1,introT/.55);g.fillStyle=`rgba(255,222,124,${glow*.12})`;g.fillRect(0,0,W,H)}
 }
 if(intro==='tutorial'){g.fillStyle='rgba(30,48,51,.10)';g.fillRect(0,0,W,H)}
}
function frame(t){let dt=Math.min(.035,(t-last)/1000);last=t;if(intro==='tutorial'){introT+=dt;for(const n of foes)if(n.introAlpha!==undefined)n.introAlpha=Math.min(1,Math.max(0,(introT-n.introDelay)/.55));}
 if(intro==='ignite'||intro==='zoom'){
  introT+=dt;
  if(intro==='ignite'&&introT>=.72)setIntro('zoom');
  else if(intro==='zoom'&&introT>=1.15)openingWave();
 }
 update(dt);
 studioUi.sync({count,kicks,hp,tier,ultReady,dead,intro},t);
 if(intro==='title'||intro==='ignite'||intro==='zoom'){
   const hidden=hero.hiddenUlt;hero.hiddenUlt=true;draw(t);hero.hiddenUlt=hidden;
 }else draw(t);
 introDraw(t);requestAnimationFrame(frame)}
/* Assets embedded in playtest.html; see assets/runtime_manifest.json */
// Visual adapter only. v33 update(), swordHit(), jump() and hitNinja() remain byte-identical.
const MOON = {pivot:[401.148,373.589],head:[436.670,265.799],grip:[588.555,252.938],tip:[745.952,110.852],fps:11};
MOON.tipAngle=Math.atan2(MOON.tip[1]-MOON.pivot[1],MOON.tip[0]-MOON.pivot[0]);
MOON.scale=76/Math.hypot(MOON.tip[0]-MOON.pivot[0],MOON.tip[1]-MOON.pivot[1]);
const spriteImages={};let imagesReady=false;
const imageReady=Promise.all(Object.entries(SPRITE_DATA).map(async([key,src])=>{const im=new Image();im.src=src;await im.decode();spriteImages[key]=im})).then(()=>imagesReady=true);
function moonState(age=slash){
 const u=Math.max(0,Math.min(1,age/.38)),span=Math.PI*1.78*Math.min(1,u/.69);
 return {u,span,angle:-2.75+span-MOON.tipAngle,alpha:Math.max(0,Math.min(1,u/.1,(1-u)/.09))};
}
function frozenOld(t){
 if(!imagesReady||ult||hero.y>=G-.1&&slash>=.38){legacyOld(t);return}
 const attacking=slash<.38;
 g.save();g.translate(hero.x,hero.y-21);g.scale(hero.face,1);
 if(attacking){
  const s=moonState(),i=Math.floor(slash*MOON.fps)%3+1;
  g.rotate(s.angle);g.scale(MOON.scale,MOON.scale);
  g.drawImage(spriteImages['moon'+i],-MOON.pivot[0],-MOON.pivot[1]);
 }else{
  // Frozen flight pixels. Placement uses their approved head anchor, not a new crop.
  const rise=hero.vy<0,scale=rise?.205:.225,i=Math.floor(clock*11)%3+1;
  g.translate(0,-12);g.scale(scale,scale);
  g.drawImage(spriteImages[(rise?'jump':'fall')+i],-480,-250);
 }
 g.restore();
}

// Presentation only. Every simulation function is inherited verbatim from v33.
function old(t){
 if(!imagesReady)return;
 if(ult){
  g.save();g.translate(hero.x,hero.y-21);g.scale(hero.face,1);g.rotate(-.4);
  g.scale(MOON.scale,MOON.scale);g.drawImage(spriteImages.moon1,-MOON.pivot[0],-MOON.pivot[1]);g.restore();return;
 }
 if(hero.y<G-.1||slash<.38){frozenOld(t);return}
 g.save();g.translate(hero.x,hero.y+22);g.scale(hero.face*.2,.2);
 g.drawImage(spriteImages['idle'+(Math.floor(clock*3)%3+1)],-256,-470);g.restore();
}
const ninjaVisualState=new WeakMap();
function ninjaFrame(n){
 let v=ninjaVisualState.get(n);if(!v){v={warn:0,release:-999};ninjaVisualState.set(n,v)}
 if(v.warn>0&&n.warn<=0)v.release=clock;v.warn=n.warn;
 const throwing=n.warn>0||clock-v.release<.18;
 const action=throwing?(n.ground?'throw_ground':'throw_air'):(n.ground?'patrol':'air');
 const frame=throwing?Math.min(2,Math.max(0,Math.floor((n.warn>0?.55-n.warn:.55+clock-v.release)*6))):Math.floor(clock*(n.ground?8:6)+(n.phase||0))%3;
 return 'ninja_'+n.type+'_'+action+'_'+(frame+1);
}
function ninja(n,t){
 if(!imagesReady)return;const key=ninjaFrame(n),im=spriteImages[key];if(!im)return;
 g.save();if(n.introAlpha!==undefined)g.globalAlpha=Math.max(0,Math.min(1,n.introAlpha));
 const sc=n.layer?.255:.24;
 // Ground images sit on the unchanged G+23 collision baseline.
 const bottom=NINJA_META.bottoms?.[key]??82;
 const y=n.ground?G+23-bottom*sc:n.y;
 g.translate(n.x,y);g.scale(n.dir*sc,sc);g.rotate(n.ground?0:n.vx*.002);
 g.drawImage(im,-144,-188);g.restore();
}
function corpseVisualSupport(o){
 const points=NINJA_META.hulls?.[o.type+'_'+(o.kind===0?'upper':'lower')];
 if(!points)return corpseBottomOffset(o);
 const sn=Math.sin(o.rot),cs=Math.cos(o.rot);
 return Math.max(...points.map(p=>(p[0]*sn+p[1]*cs)*.265/2));
}
function corpse(o){
 if(!imagesReady)return;
 const correction=corpseBottomOffset(o)-corpseVisualSupport(o);
 g.save();g.translate(o.x,o.y+correction);g.rotate(o.rot);g.scale(.265,.265);
 g.drawImage(spriteImages['ninja_'+o.type+'_death_'+(o.kind===0?'upper':'lower')],-144,-188);g.restore();
}
function inkAt(age,opacity,turn=0){
 if(age<=0||age>=.38)return;
 const frame=Math.min(24,Math.floor(age/.38*24)+1);
 g.save();g.rotate(turn);g.globalAlpha=opacity;g.scale(76/170,76/170);
 g.drawImage(spriteImages['ink'+frame],-256,-256);g.restore();
}
function slashDraw(){
 if(!imagesReady||slash>=.38)return;
 const s=moonState();g.save();g.translate(hero.x,hero.y-21);g.scale(hero.face,1);
 inkAt(slash-.026,.06,-.028);inkAt(slash-.013,.09,-.014);inkAt(slash,1);
 for(let k=0;k<2;k++){
  const a=-2.75+s.span-.12-k*.23,r=82+16*s.u;
  g.save();g.translate(Math.cos(a)*r,Math.sin(a)*r);g.rotate(a+Math.PI/2);
  g.globalAlpha=s.alpha*.17;g.drawImage(spriteImages.inkDrops,-3,-2,6,4);g.restore();
 }g.restore();
}
let speedLastKicks=-1,speedBirth=-999;
function speedDraw(){
 if(!imagesReady||ult||hero.y>=G-.1||dead)return;
 if(kicks!==speedLastKicks){speedLastKicks=kicks;speedBirth=clock}
 const rise=hero.vy<0,age=clock-speedBirth,velocity=Math.hypot(hero.vx,hero.vy);
 if(velocity<110||rise&&age>.29)return;
 const strength=rise?Math.max(0,1-age/.29):Math.min(.2,velocity/1600);
 const length=rise?20+Math.min(age/.24,1)*26:18;
 g.save();g.translate(hero.x,hero.y-18);g.rotate(Math.atan2(hero.vy,hero.vx)+Math.PI);
 for(let i=0;i<(rise?3:2);i++){
  g.globalAlpha=strength*(i===1?.65:.4);const offset=(i-1)*13;
  g.drawImage(spriteImages.speedBrush,44+i*6,offset,length*(1-i*.12),3.4-i*.55);
 }g.restore();
}
function drawInkBackground(){
 g.fillStyle='#f6f2e8';g.fillRect(0,0,W,H);
 if(!imagesReady)return;
 if(spriteImages.mountains){const w=Math.min(W*.72,480);g.drawImage(spriteImages.mountains,0,0,w,w*2)}
 if(spriteImages.ground){const im=spriteImages.ground;g.drawImage(im,0,G+23-20,W,40)}
}

/* Studio UI implementation: display-only binding. No simulation or input mutation. */
const studioUi = (() => {
  const strings = {
    title:'白眉老头', subtitle:'忍者雨', inkSeal:'墨', start:'入 江 湖', retry:'再 战 一 回',
    killUnit:'斩', life:'性 命', charge:'踏空蓄势', ultimate:'双按·绝杀',
    touchHint:'轻点左右半屏踏空 · 近敌自动出剑', tutorial:'同时按住左右半屏',
    resultCaption:'此 回 江 湖', next:'距「{rank}」还差 {n} 斩', highest:'已达最高称号',
    tier:['一重','二重','三重','四重'], ready:'绝杀就绪', lifeLabel:'生命 {n} / 3'
  };
  const ranks=[[0,'无名老叟'],[10,'略懂拳脚'],[25,'江湖老手'],[50,'白眉剑客'],[100,'一代宗师'],[200,'剑气纵横'],[350,'天下无双'],[500,'陆地剑仙'],[1000,'万剑归宗']];
  const ids=['dockKills','dockReady','dockFill','dockProgress','statusDock','studioLives','studioTier','studioRankToast','studioResult','studioResultRank','studioResultKills','studioResultNext'];
  const els=Object.fromEntries(ids.map(id=>[id,document.getElementById(id)]));
  const lives=[...els.studioLives.children];
  const cache={}; let rankIndex=0, lastCount=0, toastUntil=0, priorDead=false;
  const text=(id,value)=>{const s=String(value);if(cache[id]!==s){els[id].textContent=s;cache[id]=s}};
  const format=(key,params)=>Object.entries(params).reduce((s,[k,v])=>s.replace('{'+k+'}',v),strings[key]);
  document.querySelectorAll('[data-ui-text]').forEach(el=>{el.textContent=strings[el.dataset.uiText]||''});
  document.getElementById('studioRetry').addEventListener('click',()=>document.dispatchEvent(new CustomEvent('studio-command',{detail:{type:'retry'}})));
  function sync(state,now=performance.now()){
    const {count,kicks,hp,tier,ultReady,dead,intro}=state;
    const active=intro==='play'||intro==='tutorial';
    text('dockKills',count);text('studioTier',strings.tier[Math.max(0,Math.min(3,tier-1))]);
    text('dockProgress',ultReady?strings.ready:`${Math.min(12,kicks)} / 12`);
    const width=`${Math.min(100,kicks/12*100)}%`;
    if(cache.width!==width){els.dockFill.style.width=width;cache.width=width}
    if(cache.hp!==hp){lives.forEach((el,i)=>el.classList.toggle('lost',i>=hp));els.studioLives.setAttribute('aria-label',format('lifeLabel',{n:hp}));cache.hp=hp}
    if(cache.ready!==ultReady){els.statusDock.classList.toggle('ready',ultReady);els.dockReady.style.display=ultReady?'block':'none';cache.ready=ultReady}
    let idx=0;for(let i=1;i<ranks.length;i++)if(count>=ranks[i][0])idx=i;
    if(count<lastCount||intro==='title'){rankIndex=idx;toastUntil=0}
    if(idx>rankIndex&&intro==='play'&&!dead){text('studioRankToast',ranks[idx][1]);toastUntil=now+2400}
    rankIndex=idx;lastCount=count;
    els.studioRankToast.classList.toggle('visible',active&&!dead&&now<toastUntil);
    const showResult=dead&&intro==='play';els.studioResult.hidden=!showResult;
    if(showResult){text('studioResultRank',ranks[idx][1]);text('studioResultKills',count);text('studioResultNext',idx+1<ranks.length?format('next',{rank:ranks[idx+1][1],n:ranks[idx+1][0]-count}):strings.highest)}
    if(showResult&&!priorDead){document.getElementById('studioRetry').focus({preventScroll:true})}
    priorDead=showResult;
  }
  return Object.freeze({sync,strings,ranks});
})();

// Separate previews and regression runners use this interface; production controls never call it.
window.studioTest={ready:imageReady,images:spriteImages,geometry:moonState,swordHit,
 state:()=>({W,H,G,hero:{...hero},foes:foes.map(o=>({...o})),shots:shots.map(o=>({...o})),parts:parts.map(o=>({...o})),hp,kicks,tier,slash,dead,intro,queuedJump,queuedAt,ult,clock,count,ultReady}),
 configure(o){reset();setIntro(o.intro||'play');spawn=attackClock=1e9;queuedJump=null;queuedAt=0;hit=0;pressed.clear();lastPress={left:-1e9,right:-1e9};
  if(o.hero)Object.assign(hero,o.hero);if(o.foes)foes=o.foes;if(o.shots)shots=o.shots;if(o.parts)parts=o.parts;
  if(o.hp!==undefined)hp=o.hp;if(o.kicks!==undefined)kicks=o.kicks;if(o.tier!==undefined)tier=o.tier;if(o.slash!==undefined)slash=o.slash;if(o.clock!==undefined)clock=o.clock;if(o.count!==undefined)count=o.count;
  if(o.dead!==undefined)dead=o.dead;if(o.ult!==undefined)ult=o.ult;if(o.hit!==undefined)hit=o.hit;if(o.spawn!==undefined)spawn=o.spawn;if(o.attackClock!==undefined)attackClock=o.attackClock;if(o.queuedJump!==undefined)queuedJump=o.queuedJump;if(o.queuedAt!==undefined)queuedAt=o.queuedAt;syncUltimate();
 },
 rawStep:update,render(t=clock*1000){draw(t);studioUi.sync({count,kicks,hp,tier,ultReady,dead,intro},t)},frame,
 pose(age,face=1,x=W*.5,y=H*.5){hero.x=x;hero.y=y;hero.face=face;hero.vx=hero.vy=0;hero.kick=1;slash=age;hit=0;foes=[];shots=[];parts=[];drops=[]},
 capturePose(age,face=1){g.clearRect(0,0,W,H);this.pose(age,face);old(0);slashDraw();return c.toDataURL('image/png')},
 jump,performJump,pressZone,kill,spawnNinja,fire:fireNinjaShot,corpseBottomOffset,corpseVisualSupport,startUltimate,setIntro,ninjaFrame,
 renderNinja:ninja,renderCorpse:corpse,renderSlash:slashDraw,renderSpeed:speedDraw,renderHero:old,
 clear(bg='#f6f2e8'){g.fillStyle=bg;g.fillRect(0,0,W,H)},
 scene(mode='combat',face=1){reset();setIntro('play');spawn=attackClock=999;
  hero.x=W*.5-face*Math.min(70,W*.16);hero.y=G-45;hero.face=face;
  if(mode==='combat'||mode==='speed'){performJump(face)}
  if(mode==='combat'){spawnNinja();Object.assign(foes[0],{x:hero.x+face*95,y:hero.y-160,vx:0,vy:0,max:0,timer:999,warn:0,firstShot:true,layer:0})}
  if(mode==='cast'||mode==='death'){hero.x=W*.15;hero.y=G;for(let i=0;i<3;i++){spawnNinja();Object.assign(foes[i],{type:['black','red','green'][i],x:W*(.40+i*.2),y:mode==='death'?G-140:G-12,vx:0,vy:0,ground:mode!=='death',dir:i===1?-1:1,layer:0,timer:999,warn:0,firstShot:true,patrolV:i===1?-18:18,patrolTimer:2,groundAge:1})}if(mode==='death'){for(const n of foes)kill(n,false);foes=[]}}
 }
};

document.addEventListener('studio-command',e=>{if(e.detail?.type==='retry'&&intro==='play'&&dead)jump(hero.face)});
imageReady.then(()=>{last=performance.now();if(!window.__MANUAL_TEST__)requestAnimationFrame(frame)}).catch(e=>{document.getElementById('startGame').textContent='素材加载失败，请重新打开';console.error(e)});
