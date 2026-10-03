
const $=id=>document.getElementById(id);
const cv=$('cv'),mctx=cv.getContext('2d');let ctx=mctx;
const oc=document.createElement('canvas'),octx=oc.getContext('2d');
const MR=512;const nb=()=>{const c=document.createElement('canvas');c.width=c.height=MR;return c};
let W,H,dpr,S0;
const E=x=>x*x*(3-2*x),cl=(v,a,b)=>Math.min(Math.max(v,a),b);
function emo(t){const c=document.createElement('canvas');c.width=c.height=320;const g=c.getContext('2d');g.font='272px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(t,160,176);return c}
