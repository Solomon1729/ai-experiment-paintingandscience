

/* 背景 */
const BG={m:'grad',c:'#c9f0e4',c2:'#f5cf7a',img:null,b:0};
function drawBG(){
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.save();if(FILT&&BG.b)ctx.filter='blur('+BG.b+'px)';
  if(BG.img){const iw=BG.img.naturalWidth||BG.img.width,ih=BG.img.naturalHeight||BG.img.height,k=Math.max(W/iw,H/ih);ctx.drawImage(BG.img,(W-iw*k)/2,(H-ih*k)/2,iw*k,ih*k)}
  else if(BG.m==='solid'){ctx.fillStyle=BG.c;ctx.fillRect(0,0,W,H)}
  else if(BG.m==='grad'){const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,BG.c);g.addColorStop(.62,BG.c);g.addColorStop(.62,BG.c2);g.addColorStop(1,BG.c2);ctx.fillStyle=g;ctx.fillRect(0,0,W,H)}
  ctx.restore();
}
$('bg1').oninput=e=>{BG.c=e.target.value};$('bg2').oninput=e=>{BG.c2=e.target.value};$('bgm').onchange=e=>{BG.m=e.target.value};
$('bgf').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{BG.img=im};im.src=r.result};r.readAsDataURL(f)};
$('bgr').onclick=()=>{BG.img=null};

/* 書き出し: 録画(動画)・静止画 */
function flagOutput(){const b=document.querySelector('#tabs [data-t="bg"]');if(b&&!document.querySelector('.tab[data-tab="bg"]').classList.contains('on'))b.classList.add('flag')}
function showOut(url,kind,ext){
  const o=$('out');o.innerHTML='';const el=document.createElement(kind);el.src=url;
  if(kind==='video'){el.controls=true;el.playsInline=true;el.muted=true}
  el.style.cssText='max-width:100%;border-radius:12px;margin-top:8px;display:block';
  const a=document.createElement('a');a.href=url;a.download='action-maker.'+ext;a.textContent='⬇ 保存（'+ext+'）';a.className='file';a.style.cssText='display:inline-block;margin-top:6px';
  o.append(el,a);flagOutput();
}
$('snap').onclick=()=>cv.toBlob(b=>b&&showOut(URL.createObjectURL(b),'img','png'),'image/png');
let mr=null,chunks=[];
function setRec(on){$('rec').textContent=on?'⏹ 停止':'⏺ 録画';$('rec').classList.toggle('on',on);$('rc2').textContent=on?'⏹':'⏺';$('rc2').classList.toggle('rec',on);if(!on)$('rtx').textContent=''}
$('rec').onclick=()=>{
  if(mr){mr.stop();return}
  if(!cv.captureStream||!window.MediaRecorder){$('rtx').textContent='この端末は録画に未対応です';return}
  const mt=['video/webm;codecs=vp9','video/webm','video/mp4'].find(t=>MediaRecorder.isTypeSupported(t))||'';
  try{mr=new MediaRecorder(cv.captureStream(30),mt?{mimeType:mt,videoBitsPerSecond:6e6}:{})}catch(_){$('rtx').textContent='録画を始められませんでした';mr=null;return}
  chunks=[];mr.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
  mr.onstop=()=>{clearInterval(tm);const t=mr.mimeType||mt||'video/webm';showOut(URL.createObjectURL(new Blob(chunks,{type:t})),'video',t.includes('mp4')?'mp4':'webm');mr=null;setRec(false)};
  mr.start();setRec(true);const t0=Date.now();
  tm=setInterval(()=>{const q=(Date.now()-t0)/1000;$('rtx').textContent=q.toFixed(0)+'秒';if(q>=60&&mr)mr.stop()},500);
};
$('rc2').onclick=()=>$('rec').click();
