/* ===== スポイト(画面の色を取る) ===== */
let pickFor=null,picking=false;
function setColor(id,hex){const el=$(id);el.value=hex;el.dispatchEvent(new Event('input',{bubbles:true}))}
function pickAt(q){const d=mctx.getImageData(Math.round(q.x*dpr),Math.round(q.y*dpr),1,1).data;if(d[3]>0)setColor(pickFor,'#'+[d[0],d[1],d[2]].map(v=>v.toString(16).padStart(2,'0')).join(''));pickFor=null;picking=false;$('hint').hidden=true}
document.querySelectorAll('.pk').forEach(b=>b.onclick=async()=>{
  const id=b.dataset.for;
  if(window.EyeDropper){try{const r=await new EyeDropper().open();setColor(id,r.sRGBHex)}catch(_){}return}
  pickFor=id;picking=true;note('キャンバスをタップすると、その場所の色を取ります');
});
addEventListener('keydown',e=>{if(e.key==='Escape'&&pickFor){pickFor=null;picking=false}});
