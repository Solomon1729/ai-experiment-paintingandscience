
/* 歪み: ①タッチ(押し引き) ②膨らみ/凹み ③螺旋。静止で歪ませ、反復の波形で動かせる */
let wskip=1;const WM=.3,WX=1+2*WM,WD={r:.25,a:.6,b:0,hz:1,w:'sin',ma:0,md:0,mw:'sin',sf:.5};
const LVCAP=[1100,480,260];
function actorWR(l){const im=l.img,iw=im.naturalWidth||im.width||480,ih=im.naturalHeight||im.height||480;return Math.max(320,Math.min(LVCAP[lvl],Math.round(Math.max(iw,ih)*1.15)))}
function startWarp(q,l){
  if(!l.M)return;const c=loc(l,q);
  if(wt==='p'){
    const near=l.pins.filter(pp=>pp.t==='p').find(pp=>Math.hypot(pp.x-c.u,pp.y-c.v)<pp.r*.9);
    if(near){l.ps=l.pins.indexOf(near);l.wd=true;wg={l,p:near,u:c.u,v:c.v,mv:false};renderPins();return}
  }
  if(l.pins.length>=12)l.pins.shift();
  const p={t:wt==='bp'||wt==='bn'?'b':wt,x:c.u,y:c.v,r:WD.r,a:wt==='p'?1:wt==='bp'?Math.abs(WD.a):wt==='bn'?-Math.abs(WD.a):WD.a,vx:0,vy:0,b:WD.b,hz:WD.hz,w:WD.w,ma:WD.ma,md:WD.md,mw:WD.mw,sf:WD.sf,ph:0};
  l.pins.push(p);l.ps=l.pins.length-1;l.wd=true;wg={l,p,u:c.u,v:c.v};renderPins();
}
function wmove(q){const{l,p,u,v}=wg,c=loc(l,q);if(p.t==='p'&&!wg.mv){p.vx=c.u-u;p.vy=c.v-v}else{p.x=c.u;p.y=c.v}l.wd=true}
function warpFrame(l){
  if(l===strokeActor)return;
  const pn=l.pins;if(!pn.length){l.wo=null;return}
  const R=actorWR(l);if(l.wo&&l._wr!==R){l.wo=null;l.sd=null;l.dirty=true}l._wr=R;
  const anim=!paused&&pn.some(p=>p.b>0||p.ma>0);if(anim)wAct=true;
  if(!l.wo){l.wo=document.createElement('canvas');l.wo.width=l.wo.height=R;l.wg=l.wo.getContext('2d');l.od=l.wg.createImageData(R,R);l.wd=l.dirty=true}
  if(!(anim||l.wd||l.dirty))return;
  if(anim&&!l.wd&&!l.dirty&&wskip>1&&fc%wskip)return;
  if(l.dirty||!l.sd){
    const t=document.createElement('canvas');t.width=t.height=R;const g=t.getContext('2d'),im=adjSource(l),iw=im.naturalWidth||im.width,ih=im.naturalHeight||im.height;
    if(!iw||!ih)return;const B=R/WX,k=Math.min(B/iw,B/ih);g.drawImage(im,(R-iw*k)/2,(R-ih*k)/2,iw*k,ih*k);l.sd=g.getImageData(0,0,R,R).data;l.dirty=false;
  }
  l.wd=false;
  const N=R,sd=l.sd,od=l.od.data;od.set(sd);
  const ps=pn.map(p=>{const w=(WV[p.w]||WV.sin)(p.ph),t=6.2832*p.ph;let ox=0,oy=0;
    if(p.ma){if(p.mw==='circle'){ox=p.ma*Math.cos(t);oy=-p.ma*Math.sin(t)}else if(p.mw==='eight'){ox=p.ma*Math.sin(t);oy=-p.ma*Math.sin(2*t)*.6}else{const d=p.md*Math.PI/180,q=Math.sin(t);ox=p.ma*q*Math.cos(d);oy=-p.ma*q*Math.sin(d)}}
    return{...p,k:2.2-1.6*(p.sf===undefined?.5:p.sf),x:p.x+ox,y:p.y+oy,ea:p.t==='p'?1+p.b*w:p.t==='b'?cl(p.a+p.b*w,-.95,.95):p.a+p.b*w}});
  const px=u=>(u+WM)/WX*N;let X0=N,Y0=N,X1=0,Y1=0;
  for(const p of ps){X0=Math.min(X0,px(p.x-p.r));X1=Math.max(X1,px(p.x+p.r));Y0=Math.min(Y0,px(p.y-p.r));Y1=Math.max(Y1,px(p.y+p.r))}
  X0=Math.max(0,Math.floor(X0));Y0=Math.max(0,Math.floor(Y0));X1=Math.min(N,Math.ceil(X1));Y1=Math.min(N,Math.ceil(Y1));
  for(let y=Y0;y<Y1;y++)for(let x=X0;x<X1;x++){
    let u=(x+.5)/N*WX-WM,v=(y+.5)/N*WX-WM,hit=false;
    for(let i=ps.length-1;i>=0;i--){
      const p=ps[i],dx=u-p.x,dy=v-p.y,d=Math.sqrt(dx*dx+dy*dy)/p.r;if(d>=1)continue;hit=true;const t1=1-d,f=Math.pow(t1*t1*(3-2*t1),p.k);
      if(p.t==='b'){const k=1-p.ea*f;u=p.x+dx*k;v=p.y+dy*k}
      else if(p.t==='s'){const a=p.ea*f*.017453,c=Math.cos(a),s=Math.sin(a);u=p.x+dx*c-dy*s;v=p.y+dx*s+dy*c}
      else{u-=p.vx*p.ea*f;v-=p.vy*p.ea*f}
    }
    if(!hit)continue;
    const sx=px(u)-.5,sy=px(v)-.5,x0=Math.floor(sx),y0=Math.floor(sy),fx=sx-x0,fy=sy-y0;let R=0,G=0,B=0,A=0;
    for(let j=0;j<4;j++){const xi=x0+(j&1),yi=y0+(j>>1);if(xi<0||yi<0||xi>=N||yi>=N)continue;
      const w=((j&1)?fx:1-fx)*((j>>1)?fy:1-fy),i4=(yi*N+xi)*4,al=sd[i4+3]*w;R+=sd[i4]*al;G+=sd[i4+1]*al;B+=sd[i4+2]*al;A+=al}
    const o=(y*N+x)*4;if(A>0){od[o]=R/A;od[o+1]=G/A;od[o+2]=B/A;od[o+3]=A}else{od[o]=od[o+1]=od[o+2]=od[o+3]=0}
  }
  l.wg.putImageData(l.od,0,0);
}
const curIdx=l=>l.ps!==undefined&&l.ps<l.pins.length?l.ps:l.pins.length-1;
const curPin=()=>sel&&sel.pins[curIdx(sel)];
function wsync(){
  document.querySelectorAll('#wp [data-w]').forEach(b=>b.classList.toggle('on',b.dataset.w===wt));
  const s=wt==='s';$('war').style.display=wt==='p'?'none':'flex';
  $('wa').min=s?-360:(wt==='bp'||wt==='bn')?0:-1;$('wa').max=s?360:1;refine($('wa'),s?10:.05);$('wa').value=(wt==='bp'||wt==='bn')?Math.abs(WD.a):WD.a;
  $('wb').max=s?360:1;refine($('wb'),s?10:.05);$('wb').value=WD.b;$('wr').value=WD.r;$('wf').value=WD.sf;$('wd').value=WD.ma;$('wn').value=WD.md;$('wm').value=WD.mw;$('wh').value=WD.hz;$('ww').value=WD.w;
}
$('ww').innerHTML=Object.entries(WN).filter(([k])=>!['circle','eight','ramp'].includes(k)).map(([k,t])=>`<option value="${k}">${t}</option>`).join('');
document.querySelectorAll('#wp [data-w]').forEach(b=>b.onclick=()=>{wt=b.dataset.w;WD.a=wt==='s'?180:wt==='bn'?-.6:.6;WD.b=0;wsync()});
[['wr','r'],['wa','a'],['wb','b'],['wh','hz'],['wd','ma'],['wn','md'],['wf','sf']].forEach(([id,k])=>$(id).oninput=e=>{let v=+e.target.value;if(k==='a'&&wt==='bn')v=-v;WD[k]=v;const p=editable(sel)?curPin():null;if(p){p[k]=v;sel.wd=true}if(['r','b','ma'].includes(k))flashUntil=performance.now()+700;});
$('ww').onchange=e=>{WD.w=e.target.value;const p=curPin();if(p)p.w=WD.w};
$('wm').onchange=e=>{WD.mw=e.target.value;const p=curPin();if(p)p.mw=WD.mw};
$('wu').onclick=()=>{if(sel&&sel.pins.length){sel.pins.splice(curIdx(sel),1);sel.ps=undefined;sel.wd=true;renderPins()}};
$('wc').onclick=()=>{if(sel){sel.pins=[];sel.ps=undefined;sel.wd=true;renderPins()}};
$('wbake').onclick=()=>{
  const l=sel;if(!l||!l.pins.length)return;pushUndo();
  const oldLvl=lvl;lvl=0;l.wo=null;l.sd=null;l.wd=true;warpFrame(l);lvl=oldLvl;
  if(l.wo){ensureBase(l);const bw=l._bw,bh=l._bh,bg=l.base.getContext('2d'),R=l.wo.width,sx=(R-bw/WX)/2,sy=(R-bh/WX)/2;bg.clearRect(0,0,bw,bh);bg.drawImage(l.wo,sx,sy,bw/WX,bh/WX,0,0,bw,bh);if(l.pen)l.pen.getContext('2d').clearRect(0,0,l.pen.width,l.pen.height);bumpBP(l,1,1);recompose(l)}
  l.pins=[];l.syncTo=null;l.ps=undefined;l.wo=null;l.sd=null;renderPins();
  note('歪みを画像に統合しました。見た目はそのままで、一覧からは消えています。');
};
wsync();

const HT={pen:'なぞって描く（あとから「消しゴム」で描いた分だけ消せます）',eraser:'なぞって、描いた分だけ消す（元の絵は残ります）',warp:'触った所を歪ませる（動きは止まります）',mouth:'なぞってマスク領域を塗る（対象に選んだオブジェクトが入った部分が消えます）',mouthx:'マスク領域の塗りを消す',bpaint:'ぼかしたい所をなぞる。塗った所だけが「ぼかし」のバーでぼけます（全体は「全体を塗る」）',bpaintx:'ぼかす範囲の塗りを消す',psel:'コピー／切り取りしたい部分をなぞって囲む',pbox:'コピー／切り取りしたい部分を四角形で選ぶ',pselx:'囲みを消す',ieraser:'なぞって、絵そのものを消す（元の絵には戻せません）'};
