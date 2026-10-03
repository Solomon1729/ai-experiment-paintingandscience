
/* ===== 指定した所だけぼかす(ぼかしマスク) ===== */
const ob1=document.createElement('canvas'),og1=ob1.getContext('2d'),ob2=document.createElement('canvas'),og2=ob2.getContext('2d');
function blurRegion(l,S){
  const cur=ctx.getTransform(),main=ctx;
  for(const g of[og1,og2]){g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,ob1.width,ob1.height);g.setTransform(cur)}
  ctx=og1;img(l,S,0);ctx=og2;img(l,S,l.blur);ctx=main;
  og1.globalCompositeOperation='destination-out';og2.globalCompositeOperation='destination-in';
  og1.drawImage(l.bm,-S/2,-S/2,S,S);og2.drawImage(l.bm,-S/2,-S/2,S,S);
  og1.globalCompositeOperation=og2.globalCompositeOperation='source-over';
  main.save();main.setTransform(1,0,0,1,0,0);main.drawImage(ob1,0,0);main.drawImage(ob2,0,0);main.restore();
}
function strokeSel(q){
  const l=pl;if(!l||!l.M)return;const key=psn?'sm':'bm',col=psn?'#ff5d8f':'#3b82f6',er=psn?serase:berase;
  const c=l[key]||(l[key]=nb()),a=loc(l,q),g=c.getContext('2d'),x=a.u*MR,y=a.v*MR;
  const bsz=psn?brushParts:brushBlur;g.globalCompositeOperation=er?'destination-out':'source-over';g.strokeStyle=g.fillStyle=g.shadowColor=col;g.shadowBlur=bsz*.7;g.lineWidth=bsz*2;g.lineCap='round';
  g.beginPath();g.moveTo(lp?lp.x:x,lp?lp.y:y);g.lineTo(x,y);g.stroke();lp={x,y};l[psn?'hasSm':'hasBm']=true;l[key+'v']=(l[key+'v']||0)+1;if(!psn&&l.blur===0){l.blur=15;$('bl').value=15;$('blv').textContent='15px'}
}
function rectSel(l,a,b){
  if(!l||!l.M)return;
  const c=l.sm||(l.sm=nb()),g=c.getContext('2d');
  const x=Math.min(a.u,b.u)*MR,y=Math.min(a.v,b.v)*MR,w=Math.abs(b.u-a.u)*MR,h=Math.abs(b.v-a.v)*MR;
  g.clearRect(0,0,MR,MR);
  g.globalCompositeOperation='source-over';g.fillStyle='#ff5d8f';g.fillRect(x,y,w,h);
  l.hasSm=w>0&&h>0;l.smv=(l.smv||0)+1;
}
function fillSel(key,col){const l=sel;const c=l[key]||(l[key]=nb()),g=c.getContext('2d');g.globalCompositeOperation='source-over';g.fillStyle=col;g.fillRect(0,0,MR,MR);l[key==='bm'?'hasBm':'hasSm']=true;l[key+'v']=(l[key+'v']||0)+1;if(key==='bm'&&l.blur===0){l.blur=15;$('bl').value=15;$('blv').textContent='15px'}}
function outlineOf(l,key,vk,col){
  const v=l[vk]||0,f='_ol'+key,o=l[f];if(o&&o.v===v)return o.c;
  const c=nb(),g=c.getContext('2d'),e=nb(),eg=e.getContext('2d'),src=l[key];
  eg.drawImage(src,0,0);eg.globalCompositeOperation='destination-in';for(const[dx,dy]of[[5,0],[-5,0],[0,5],[0,-5],[4,4],[-4,4],[4,-4],[-4,-4]])eg.drawImage(src,dx,dy);
  g.drawImage(src,0,0);g.globalCompositeOperation='destination-out';g.drawImage(e,0,0);g.globalCompositeOperation='source-in';g.fillStyle=col;g.fillRect(0,0,MR,MR);
  l[f]={v,c};return c;
}
function ovl(l,S,key,vk,col){const c=l[key];ctx.save();ctx.globalAlpha=.16;ctx.drawImage(c,-S/2,-S/2,S,S);ctx.globalAlpha=1;ctx.drawImage(outlineOf(l,key,vk,col==='#3b82f6'?'#00c3ff':'#ff2d87'),-S/2,-S/2,S,S);ctx.restore()}
let showPins=false,flashUntil=0;
function drawPins(l,S){
  const ci=curIdx(l);ctx.save();ctx.lineWidth=1;ctx.globalAlpha=.55;
  l.pins.forEach((p,i)=>{const x=(p.x-.5)*S,y=(p.y-.5)*S;ctx.strokeStyle=ctx.fillStyle=i===ci?'#ff2d87':'#ffffff';ctx.setLineDash([4,4]);
    ctx.beginPath();ctx.arc(x,y,p.r*S,0,6.283);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.arc(x,y,3,0,6.283);ctx.fill()});
  ctx.restore();
}
function syncBm(){$('bshow').classList.toggle('on',showBm)}
$('bshow').onclick=()=>{showBm=!showBm;syncBm()};
$('bfill').onclick=()=>fillSel('bm','#3b82f6');
$('bbs').oninput=e=>{brushBlur=+e.target.value};
$('bbake').onclick=()=>{
  const l=sel;if(!l||!l.hasBm||!l.blur){note('先にぼかしを塗って、強さを付けてください');return}
  pushUndo();
  const{c,W,H}=boxCv(l);ensureBase(l);const BR=l._bw;
  l.base.getContext('2d').clearRect(0,0,BR,BR);l.base.getContext('2d').drawImage(c,0,0,c.width,c.height,0,0,BR,BR);
  if(l.pen)l.pen.getContext('2d').clearRect(0,0,l.pen.width,l.pen.height);bumpBP(l,1,1);
  l.blur=0;l.hasBm=false;if(l.bm)l.bm.getContext('2d').clearRect(0,0,MR,MR);
  recompose(l);
  note('ぼかしを画像に統合しました。');
};
const cmpOn=()=>{cmp=true},cmpOff=()=>{cmp=false};$('bcmp').onpointerdown=cmpOn;$('bcmp').onpointerup=$('bcmp').onpointerleave=$('bcmp').onpointercancel=cmpOff;
$('bmc').onclick=()=>{if(sel.bm)sel.bm.getContext('2d').clearRect(0,0,MR,MR);sel.hasBm=false;sel.bmv=(sel.bmv||0)+1};
