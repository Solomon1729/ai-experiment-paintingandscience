/* ===== 歪み: 選択・一覧 ===== */
function pickPin(q,l){
  if(!l.M||!l.pins.length)return;const c=loc(l,q);let bi=-1,bd=1e9;
  l.pins.forEach((p,i)=>{const d=Math.hypot(p.x-c.u,p.y-c.v);if(d<bd){bd=d;bi=i}});
  l.ps=bi;const p=l.pins[bi];loadPin(p);wg={l,p,mv:true};renderPins();
}
function loadPin(p){WD.r=p.r;WD.a=p.a;WD.b=p.b;WD.hz=p.hz;WD.w=p.w;WD.ma=p.ma||0;WD.md=p.md||0;WD.mw=p.mw||'sin';WD.sf=p.sf===undefined?.5:p.sf;wt=p.t;wsync()}
function renderPins(){
  const box=$('pinl');box.innerHTML='';const l=sel;if(!l)return;
  l.pins.forEach((p,i)=>{const b=document.createElement('button'),tn=p.t==='b'?(p.a<0?'凹み':'膨らみ'):p.t==='s'?'螺旋':'タッチ';
    b.textContent=(i+1)+(p.t==='b'?(p.a<0?'🕳':'🫧'):p.t==='s'?'🌀':'👆');b.setAttribute('aria-label',(i+1)+'番目：'+tn);armTip(b);
    b.classList.toggle('on',i===curIdx(l));b.onclick=()=>{l.ps=i;loadPin(p);renderPins()};box.appendChild(b)});
  if(!l.pins.length){const n=document.createElement('span');n.className='note';n.style.margin=0;n.textContent='（まだ歪みがありません。オブジェクトをタップして追加）';box.appendChild(n)}
  const sSel=$('wsyncSel');if(sSel){
    sSel.innerHTML='<option value="">同期しない</option>'+AC.filter(a=>a!==l).map(o=>`<option value="${o.id}"${l.syncTo===o.id?' selected':''}>${o.name}</option>`).join('');
    sSel.value=l.syncTo||'';
  }
}
function setWarpSync(l,id){
  if(id){const t=byId(id);if(!t)return;l.pins=t.pins;l.syncTo=id;l.ps=undefined}
  else{l.pins=l.pins.slice();l.syncTo=null}
  renderPins();
}
$('wsyncSel').onchange=e=>{setWarpSync(sel,+e.target.value||null)};
const wmUi=()=>{$('wm1').classList.toggle('on',wmode==='add');$('wm2').classList.toggle('on',wmode==='pick')};
$('physMode').onclick=()=>{setTab(document.querySelector('.tab[data-tab="ph"]').classList.contains('on')?'pl':'ph')};
$('wm1').onclick=()=>{wmode='add';wmUi()};$('wm2').onclick=()=>{wmode='pick';wmUi()};
$('wsh').onclick=()=>{showPins=!showPins;$('wsh').classList.toggle('on',showPins)};
$('bnd').onclick=()=>{showBounds=!showBounds;$('bnd').classList.toggle('on',showBounds)};
function clearEffects(l){
  if(!l)return;pushUndo();
  l.ch=mkc();l.pins=[];l.syncTo=null;l.rot=0;l.rr=0;l.blur=0;l.bm=null;l.hasBm=false;l.bmOn=false;l.wo=null;l.sd=null;l.dirty=true;l.wd=true;
  setSel(l);note('エフェクトを全部消しました（画像はそのままです）');
}
$('clrfx').onclick=()=>clearEffects(sel);
