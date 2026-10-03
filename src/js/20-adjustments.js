const COLK=['brightness','contrast','saturation','hue','temperature','highlights','shadows','whites','blacks'],LFK=['clarity','structure','texture','sharp','ambience'];
const ADJ0=()=>({brightness:0,contrast:0,saturation:0,hue:0,temperature:0,highlights:0,shadows:0,whites:0,blacks:0,feather:0});
function ensureAdj(l){if(!l.adj)l.adj=ADJ0();else if(l.adj.feather===undefined)l.adj.feather=0;return l.adj}
function adjActive(l){const a=ensureAdj(l);return COLK.some(k=>Math.abs(a[k])>0.0001)}
const LFD={clarity:{scale:60,locality:70,edge:20,balance:0,softness:30},structure:{scale:40,locality:70,edge:30,balance:0,softness:30},texture:{scale:15,locality:80,edge:20,balance:0,softness:40},sharp:{scale:10,locality:90,edge:50,balance:0,softness:60},ambience:{scale:80,locality:40,edge:0,balance:0,softness:50}};
const LF0=k=>({amount:0,...LFD[k]});
function ensureLF(l){if(!l.lf)l.lf={};for(const k of LFK)if(!l.lf[k])l.lf[k]=LF0(k);return l.lf}
function lfActive(l){const f=ensureLF(l);return LFK.some(k=>Math.abs(f[k].amount)>0.0001)}
let rngT='adj',lfSel='clarity';
function adjSource(l){
  const im=l.img;if(!im||!adjActive(l)&&!lfActive(l)&&!l.hasAdjM&&!l.hasLFM)return im;
  const iw=im.naturalWidth||im.width||0,ih=im.naturalHeight||im.height||0;if(!iw||!ih)return im;
  if(l._adjC&&l._adjC.width===iw&&l._adjC.height===ih&&!l._adjDirty&&l._adjRef===im)return l._adjC;
  const a=ensureAdj(l),MK=adjMask(l,a,'adjm');
  const c=allocCanvas(iw,ih,'色調整'),g=c.getContext('2d');g.drawImage(im,0,0);const d=g.getImageData(0,0,iw,ih),p=d.data;
  const clamp01=v=>Math.max(0,Math.min(1,v)),ss=v=>v*v*(3-2*v);
  const rgbHsl=(r,g,b)=>{const mx=Math.max(r,g,b),mn=Math.min(r,g,b),q=mx-mn,l=(mx+mn)/2;if(!q)return[0,0,l];const sat=l<.5?q/(mx+mn):q/(2-mx-mn);let hh=mx===r?(g-b)/q:mx===g?2+(b-r)/q:4+(r-g)/q;return[(hh<0?hh+6:hh)/6,sat,l]};
  const hslRgb=(h,s,l)=>{if(!s)return[l,l,l];const q=l<.5?l*(1+s):l+s-l*s,pp=2*l-q,fn=t=>{t=(t+1)%1;return t<1/6?pp+(q-pp)*6*t:t<1/2?q:t<2/3?pp+(q-pp)*(2/3-t)*6:pp};return[fn(h+1/3),fn(h),fn(h-1/3)]};
  const b=a.brightness/100,co=a.contrast/100,sa=a.saturation/100,hu=a.hue/360,te=a.temperature/100,hi=a.highlights/100,sh=a.shadows/100,wh=a.whites/100,bl=a.blacks/100;
  for(let y=0;y<ih;y++)for(let x=0;x<iw;x++){
    const j=(y*iw+x)*4,al=p[j+3];if(!al)continue;
    let r=p[j]/255,gc=p[j+1]/255,bv=p[j+2]/255;
    const orig=[r,gc,bv],L=.2126*r+.7152*gc+.0722*bv;
    let v=L+b*.22;
    v+=wh*.20*Math.pow(v,3)+bl*.20*Math.pow(1-v,3);
    v+=hi*.18*ss(clamp01((v-.5)/.5))+sh*.18*(1-ss(clamp01(v/.5)));
    v=.5+(v-.5)*(1+co);
    const oldL=Math.max(.0001,L),scale=clamp01(v)/oldL;
    r=clamp01(r*scale);gc=clamp01(gc*scale);bv=clamp01(bv*scale);
    const hsl=rgbHsl(r,gc,bv);hsl[0]=(hsl[0]+hu+1)%1;hsl[1]=clamp01(hsl[1]*(1+sa));[r,gc,bv]=hslRgb(hsl[0],hsl[1],hsl[2]);
    r=clamp01(r+te*.10);gc=clamp01(gc+te*.025);bv=clamp01(bv-te*.10);
    let mix=1;if(MK){const mx=Math.floor(x/iw*MR),my=Math.floor(y/ih*MR);mix=MK[my*MR+mx]}
    p[j]=Math.round((orig[0]*(1-mix)+r*mix)*255);p[j+1]=Math.round((orig[1]*(1-mix)+gc*mix)*255);p[j+2]=Math.round((orig[2]*(1-mix)+bv*mix)*255);
  }
  txPass(p,iw,ih,ensureLF(l),adjMask(l,a,'lfm'));
  g.putImageData(d,0,0);l._adjC=c;l._adjRef=im;l._adjDirty=false;return c;
}
function adjMask(l,a,key){
  const k=key==='lfm'?'lf':'adj';if(!rngOn(l,k))return null;const c=l[key];if(!c)return new Float32Array(MR*MR);const R=c.getContext('2d').getImageData(0,0,MR,MR).data,mk=new Float32Array(MR*MR);
  for(let i=0;i<mk.length;i++)mk[i]=R[i*4+3]/255;
  const fe=(a.feather||0)/100;return fe>.001?boxBlur(mk,MR,MR,fe*MR*.06):mk;
}
function boxBlur(src,w,h,r){
  r=Math.max(1,Math.round(r));const t=new Float32Array(w*h),o=new Float32Array(w*h),n=2*r+1;let a=src;
  for(let it=0;it<2;it++){
    for(let y=0;y<h;y++){const rw=y*w;let s=0;for(let x=-r;x<=r;x++)s+=a[rw+Math.min(w-1,Math.max(0,x))];
      for(let x=0;x<w;x++){t[rw+x]=s/n;s+=a[rw+Math.min(w-1,x+r+1)]-a[rw+Math.max(0,x-r)]}}
    for(let x=0;x<w;x++){let s=0;for(let y=-r;y<=r;y++)s+=t[Math.min(h-1,Math.max(0,y))*w+x];
      for(let y=0;y<h;y++){o[y*w+x]=s/n;s+=t[Math.min(h-1,y+r+1)*w+x]-t[Math.max(0,y-r)*w+x]}}
    a=o;
  }
  return o;
}
function txPass(p,iw,ih,f,MK){
  const on=LFK.filter(k=>Math.abs(f[k].amount)>.0001),N=iw*ih;if(!on.length||N>12e6)return;
  const Lc=new Float32Array(N),dl=new Float32Array(N);let mean=0,cnt=0,am=0;
  for(let i=0;i<N;i++){const j=i*4;Lc[i]=(.2126*p[j]+.7152*p[j+1]+.0722*p[j+2])/255;if(p[j+3]){mean+=Lc[i];cnt++}}
  mean=cnt?mean/cnt:.5;
  const cl=v=>v<0?0:v>1?1:v,ss=v=>v*v*(3-2*v),u=Math.max(1,Math.min(iw,ih)/400);
  const CFG={sharp:[.5,1.2,0],texture:[1.2,1.5,0],structure:[3.5,1,.5],clarity:[8,1,1],ambience:[30,.9,1]};
  on.forEach(key=>{
    const v=f[key],[rr,gn,mw]=CFG[key],kk=.25+v.scale/100*1.75,loc=v.locality/100,ed=v.edge/100,bal=v.balance/100,so=v.softness/100,g=v.amount/100*gn,B=boxBlur(Lc,iw,ih,rr*u*kk),cg=.004+so*.03;
    if(key==='ambience')am+=v.amount/100*.35;
    for(let i=0;i<N;i++){
      const L=Lc[i];let D=L-(B[i]*loc+mean*(1-loc));const a=Math.abs(D);
      D*=1/Math.sqrt(1+(a/.25)*(a/.25));D*=ss(cl(a/cg));D*=(1-ed)+ed*ss(cl(a/.12));
      dl[i]+=g*D*Math.max(0,1+bal*(2*L-1))*(1-mw*.7*Math.pow(Math.abs(2*L-1),2));
    }
  });
  for(let i=0;i<N;i++){
    const j=i*4;if(!p[j+3])continue;let m=1;
    if(MK){const x=i%iw,y=(i/iw)|0;m=MK[Math.floor(y/ih*MR)*MR+Math.floor(x/iw*MR)]}
    if(m<=0)continue;const d=dl[i]*m;
    let r=p[j]/255+d,gg=p[j+1]/255+d,b=p[j+2]/255+d;
    if(am){const gr=.2126*r+.7152*gg+.0722*b,s=1+am*m*(.5+Lc[i]);r=gr+(r-gr)*s;gg=gr+(gg-gr)*s;b=gr+(b-gr)*s}
    p[j]=Math.round(cl(r)*255);p[j+1]=Math.round(cl(gg)*255);p[j+2]=Math.round(cl(b)*255);
  }
}
function adjDirty(l){l._adjDirty=true;l._adjC=null;l.dirty=true;l.wd=true}
function adjUi(){
  if(!sel)return;const a=ensureAdj(sel),map=[['adjBr','brightness','adjBrv'],['adjCo','contrast','adjCov'],['adjSa','saturation','adjSav'],['adjHu','hue','adjHuv'],['adjTe','temperature','adjTev'],['adjHi','highlights','adjHiv'],['adjSh','shadows','adjShv'],['adjWh','whites','adjWhv'],['adjBl','blacks','adjBlv'],['adjFe','feather','adjFev']];
  map.forEach(([id,k,v])=>{$(id).value=a[k];$(v).textContent=k==='hue'?a[k]+'°':a[k]});
  $('adjPaint').classList.toggle('on',adjMode==='paint');$('adjErase').classList.toggle('on',adjMode==='erase');$('adjShow').classList.toggle('on',adjShow);{const on=rngOn(sel,rk());$('adjScAll').classList.toggle('on',!on);$('adjScRng').classList.toggle('on',on);$('adjRngRow').style.display=$('adjBsRow').style.display=on?'':'none'}lfUi();
}
function rk(){return rngT==='fx'?'lf':'adj'}
function rngOn(l,k){const v=l[k+'Rng'];return v===undefined?!!l[k+'m']:!!v}
function setScope(on){if(!sel)return;const k=rk();if(sel[k+'Rng']!==undefined&&rngOn(sel,k)===on)return;pushUndo();sel[k+'Rng']=on;if(!on)adjMode='';adjDirty(sel);paintFrame();adjUi()}
const RKS=()=>rngT==='fx'?['lfm','hasLFM','lfmv']:['adjm','hasAdjM','adjmv'];
function adjBrushAt(q,l){
  if(!l||!l.M)return;ensureAdj(l);l[rk()+'Rng']=true;const[m,h,vv]=RKS();if(!l[m])l[m]=nb();
  const t=l.M.inverse().transformPoint(new DOMPoint(q.x*dpr,q.y*dpr)),S=S0*l.size,x=(t.x/S+.5)*MR,y=(t.y/S+.5)*MR,g=l[m].getContext('2d');
  g.globalCompositeOperation=adjMode==='erase'?'destination-out':'source-over';g.globalAlpha=1;g.fillStyle='#fff';g.lineWidth=adjBrush*2;g.lineCap=g.lineJoin='round';
  g.beginPath();g.moveTo(lp?lp.x:x,lp?lp.y:y);g.lineTo(x,y);g.stroke();lp={x,y};l[h]=true;l[vv]=(l[vv]||0)+1;adjDirty(l);
}
function adjAll(on){
  if(!sel)return;pushUndo();sel[rk()+'Rng']=true;const[m,h,vv]=RKS();if(!sel[m])sel[m]=nb();const g=sel[m].getContext('2d');g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-over';g.globalAlpha=1;g.clearRect(0,0,MR,MR);if(on){g.fillStyle='#fff';g.fillRect(0,0,MR,MR);sel[h]=true}else sel[h]=false;sel[vv]=(sel[vv]||0)+1;adjDirty(sel);paintFrame();adjUi();
}
const LFN={clarity:'明瞭度：中〜大きめの局所コントラスト。面のメリハリ・存在感。',structure:'ストラクチャ：中程度の局所構造。立体感・奥行き。',texture:'テクスチャ：細かい表面構造。髪・布・木などの肌理。',sharp:'シャープ：輪郭の鮮鋭化。ノイズ抑制を上げるとザラつきにくい。',ambience:'アンビエンス：局所の明暗差に連動して彩度も動かし、雰囲気を変える。'};
const LFR=[['fxAm','amount'],['fxSc','scale'],['fxLo','locality'],['fxEd','edge'],['fxBa','balance'],['fxSo','softness']];
function lfUi(){
  if(!sel)return;const v=ensureLF(sel)[lfSel];
  LFR.forEach(([id,k])=>{$(id).value=v[k];$(id+'v').textContent=v[k]});
  document.querySelectorAll('#fxEff [data-fx]').forEach(b=>b.classList.toggle('on',b.dataset.fx===lfSel));$('fxNote').textContent=LFN[lfSel];
  const c=$('fxPad'),g=c.getContext('2d'),w=c.width,h=c.height;g.clearRect(0,0,w,h);g.strokeStyle='#888';g.lineWidth=1;g.strokeRect(.5,.5,w-1,h-1);
  g.globalAlpha=.3;g.beginPath();g.moveTo(w/2,0);g.lineTo(w/2,h);g.moveTo(0,h/2);g.lineTo(w,h/2);g.stroke();g.globalAlpha=1;
  g.fillStyle='#e0245e';g.beginPath();g.arc(v.scale/100*w,(1-v.locality/100)*h,7,0,7);g.fill();
}
function lfPadSet(e){if(!sel)return;const r=$('fxPad').getBoundingClientRect(),v=ensureLF(sel)[lfSel],c=x=>Math.max(0,Math.min(100,Math.round(x)));v.scale=c((e.clientX-r.left)/r.width*100);v.locality=c((1-(e.clientY-r.top)/r.height)*100);adjDirty(sel);lfUi();paintFrame()}
function adjReset(){
  if(!sel)return;pushUndo();{const a=ensureAdj(sel);COLK.forEach(k=>a[k]=0)}sel._adjDirty=true;sel._adjC=null;sel.adjmv=(sel.adjmv||0);adjDirty(sel);paintFrame();adjUi();
}
