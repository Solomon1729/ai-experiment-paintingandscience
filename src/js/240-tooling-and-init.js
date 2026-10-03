let strokeActor=null;
let tipEl=null;
function hideTip(){if(tipEl){tipEl.remove();tipEl=null}}
function showTip(el,text){
  hideTip();tipEl=document.createElement('div');tipEl.className='ltip';tipEl.textContent=text;document.body.appendChild(tipEl);
  const r=el.getBoundingClientRect();
  tipEl.style.left=Math.min(innerWidth-tipEl.offsetWidth-8,Math.max(8,r.left+r.width/2-tipEl.offsetWidth/2))+'px';
  tipEl.style.top=Math.max(8,r.top-tipEl.offsetHeight-8)+'px';
}
function armTip(el){
  const text=el.getAttribute('aria-label');if(!text||el._tipped)return;el._tipped=1;el.title=text;
  let t;
  el.addEventListener('pointerdown',e=>{if(e.pointerType!=='touch')return;clearTimeout(t);t=setTimeout(()=>showTip(el,text),480)});
  el.addEventListener('pointerup',()=>{clearTimeout(t);setTimeout(hideTip,900)});
  el.addEventListener('pointercancel',()=>{clearTimeout(t);hideTip()});
  el.addEventListener('pointermove',()=>clearTimeout(t));
}
function armTips(root){root.querySelectorAll('[aria-label]').forEach(armTip)}
const HINT=$('ht').textContent;
let lastPen='pen',lastMask='mouth',lastPart='psel';
const seen={};let hto=null;
function setTool(t){tool=t;paint=t==='mouth'||t==='mouthx';erase=t==='mouthx';bpn=t==='bpaint'||t==='bpaintx';berase=t==='bpaintx';pbox=t==='pbox';psn=t==='psel'||t==='pselx';serase=t==='pselx';
  if(t==='pen'||t==='eraser'||t==='ieraser')lastPen=t;if(paint||bpn)lastMask=t;if(psn||pbox)lastPart=t;
  const on=new Set([lastPen,lastMask,lastPart,t]);document.querySelectorAll('#tp [data-tool]').forEach(b=>b.classList.toggle('on',on.has(b.dataset.tool)));
  $('ht').textContent=HT[t]||HINT;
  $('es2').style.display=(t==='eraser'||t==='ieraser')?'':'none';
  const pcolEl=$('pcol'),pcolPk=document.querySelector('.pk[data-for="pcol"]');
  if(pcolEl)pcolEl.style.display=t==='pen'?'':'none';
  if(pcolPk)pcolPk.style.display=t==='pen'?'':'none';
  if(t!=='move'&&!seen[t]){seen[t]=1;$('hint').hidden=false;clearTimeout(hto);hto=setTimeout(()=>{$('hint').hidden=true},4500)}}
const TT={adj:()=>'move',fx:()=>'move',pt:()=>lastPart,pl:()=>'move',mo:()=>'move',bg:()=>'move',ph:()=>'move',wp:()=>'warp',dr:()=>lastPen,mk:()=>lastMask};
function setTab(t){document.querySelectorAll('.tab').forEach(e=>e.classList.toggle('on',e.dataset.tab===t));document.querySelectorAll('#tabs [data-t]').forEach(b=>b.classList.toggle('on',b.dataset.t===t));document.getElementById('tabs').style.display=t==='ph'?'none':'flex';$('physMode').textContent=t==='ph'?'🎬 アニメーションに戻る':'⚙️ 物理モードに切り替え';if(t==='bg'){const b=document.querySelector('#tabs [data-t="bg"]');if(b)b.classList.remove('flag')}adjMode='';if(t==='adj'||t==='fx'){rngT=t;const T=document.querySelector('.tab[data-tab="'+t+'"]');T.insertBefore($('adjRange'),T.firstChild)}adjUi();setTool(TT[t]())}
document.querySelectorAll('#tp [data-tool]').forEach(b=>b.onclick=()=>setTool(b.dataset.tool));
$('tc').onclick=()=>{const c=document.body.classList.toggle('tpc');$('tc').textContent=c?'▴':'▾'};
$('gd').onclick=()=>{guide=!guide;$('gd').classList.toggle('on',guide)};
$('gs').oninput=e=>{gs=+e.target.value};
$('pl').onclick=()=>{paused=!paused;$('pl').textContent=paused?'▶ うごかす':'⏸ とめる';$('pl').classList.toggle('on',paused);$('pz').textContent=paused?'▶':'⏸'};
$('pz').onclick=()=>$('pl').click();
$('f').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader(),l=sel;r.onload=()=>{const im=new Image();im.onload=()=>{setImg(l,im);chips()};im.src=r.result};r.readAsDataURL(f)};

function fsSet(on){
  document.body.classList.toggle('fs',on);$('fsb').textContent=on?'✕ 縮小':'⛶ 拡大';
  try{const d=document.documentElement;if(on){d.requestFullscreen&&d.requestFullscreen().catch(()=>{})}else if(document.fullscreenElement)document.exitFullscreen()}catch(_){}
  up();if(!vLock){Z.s=1;Z.x=0;Z.y=0}fit();frame(sel);
}
$('fsb').onclick=()=>fsSet(!document.body.classList.contains('fs'));
(function(){
  const g=$('grip');let sy=0,sh=0,on=false;
  g.addEventListener('pointerdown',e=>{on=true;sy=e.clientY;sh=$('tp').getBoundingClientRect().height;try{g.setPointerCapture(e.pointerId)}catch(_){}});
  g.addEventListener('pointermove',e=>{if(!on)return;const h=cl(sh-(e.clientY-sy),120,innerHeight*.86);document.documentElement.style.setProperty('--tph',h+'px')});
  g.addEventListener('dblclick',()=>document.documentElement.style.removeProperty('--tph'));
  const stop=()=>{on=false};g.addEventListener('pointerup',stop);g.addEventListener('pointercancel',stop);
})();
addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('fs'))fsSet(false)});
document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&document.body.classList.contains('fs'))fsSet(false)});
if(window.ResizeObserver)new ResizeObserver(()=>fit()).observe($('wrap'));
addEventListener('resize',fit);

fit();add();add();setSel(AC[0]);setTab('pl');initExtra();armTips(document);rulerTxUpdate();
requestAnimationFrame(t=>{last=t;loop(t)});

/* ロック中レイヤーの編集ボタンを止める（B-2） */
['pcut','pcopy','pdup','wbake','bbake','bfill','wc','wu'].forEach(id=>{const b=$(id),f=b&&b.onclick;if(f)b.onclick=function(...a){if(blocked(sel))return;return f.apply(this,a)}});
layUi();
