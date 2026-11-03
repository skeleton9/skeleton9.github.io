(function(root){
const CAPACITY=7;
const copy=b=>b.map(t=>[...t]), key=b=>JSON.stringify(b), won=b=>b.filter(t=>!t.length).length===1&&b.every(t=>!t.length||(t.length===CAPACITY&&t.every(c=>c===t[0]))), legal=(b,a,z)=>a!==z&&b[a].length>0&&b[z].length<CAPACITY;
function generate(n,steps){let best;for(let attempt=0;attempt<25;attempt++){let b=Array.from({length:n},(_,i)=>Array(CAPACITY).fill(i));b.push([]);let route={},seen=new Set([key(b)]);for(let s=0;s<steps;s++){let opts=[];for(let a=0;a<b.length;a++)for(let z=0;z<b.length;z++){if(a===z||!b[a].length||b[z].length>=CAPACITY)continue;if(b[a].length===1)continue;let c=copy(b);c[z].push(c[a].pop());if(!seen.has(key(c)))opts.push({c,a,z});}if(!opts.length)break;const o=opts[Math.floor(Math.random()*opts.length)];b=o.c;seen.add(key(b));route[key(b)]=[o.z,o.a];}// Fill any remaining empty tube while recording a legal inverse move.
for(let z=0;z<b.length;z++){
if(b[z].length)continue;
const a=b.findIndex(t=>t.length>1);
b[z].push(b[a].pop());
route[key(b)]=[z,a];
}
let score=b.reduce((s,t)=>s+t.slice(1).filter((c,i)=>c!==t[i]).length,0);if(!best||score>best.score)best={board:b,route,score};if(score>=n*2)break;}return best;}
const api={CAPACITY,copy,key,won,legal,generate};if(typeof module!=='undefined')module.exports=api;else root.Game=api;
})(globalThis);
