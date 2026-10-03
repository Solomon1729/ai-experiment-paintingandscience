
/* ===== 処理の軽さ(自動で段階を下げる) ===== */
let pavg=16,pcool=120,lvl=0,wq='auto';
const LV=[1,1,2],LVN=['高品質','標準','軽い'];
function setLvl(n){lvl=n;wskip=LV[n];for(const a of AC){a.wo=null;a.sd=null;a.dirty=true;a._wr=undefined}$('qtx').textContent='現在：'+LVN[n]+(wq==='auto'?'（自動）':'')}
function perfTick(ms){
  if(wq!=='auto'||!wAct||ms>250||!AC.some(a=>a.pins.length))return;pavg=pavg*.94+ms*.06;if(--pcool>0)return;
  if(pavg>38&&lvl<2){setLvl(lvl+1);pcool=150;pavg=16;note('動きのある歪みが多く、画質を少し下げました（「背景・出力」タブの「処理の軽さ」で固定できます）')}
  else if(pavg<20&&lvl>0){setLvl(lvl-1);pcool=300;pavg=17}
}
$('qs').onchange=e=>{wq=e.target.value;if(wq!=='auto')setLvl(+wq);else $('qtx').textContent='現在：'+LVN[lvl]+'（自動）'};
