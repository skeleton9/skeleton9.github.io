const $=s=>document.querySelector(s), colors=['#df595c','#e9bd48','#438bdd','#41ae85','#e3ddc9','#a663cd','#e78c3f'],names=['砖红色','金黄色','湖蓝色','松绿色','米白色','紫罗兰色','暖橙色'],modes=['轻松','标准','挑战'];let state,selected=-1,hints=[],sound=true,audio;
let celebrationTimer=null,celebrating=false;
function save(){try{localStorage.setItem('color-sort-v2-capacity7',JSON.stringify(state));}catch{}}
function fresh(mode=0,level=1){stopCelebration();const g=Game.generate([3,5,7][mode],[60,140,260][mode]);state={mode,level,board:g.board,initial:Game.copy(g.board),route:g.route,history:[],elapsed:0,done:false};selected=-1;hints=[];save();render();message('');}
function message(t){$('#message').textContent=t;}
function tone(){if(!sound)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.connect(g);g.connect(audio.destination);o.frequency.value=440+Math.random()*200;g.gain.setValueAtTime(.07,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.15);o.start();o.stop(audio.currentTime+.16);}catch{}}
function render(){const focus=document.activeElement?.dataset?.tube;$('#board').innerHTML=state.board.map((t,i)=>`<div class="tube-wrap"><button class="tube ${selected===i?'selected':''} ${hints.includes(i)?'hinted':''} ${t.length===Game.CAPACITY&&t.every(c=>c===t[0])?'complete':''}" data-tube="${i}" aria-pressed="${selected===i}" aria-label="第 ${i+1} 管，从底到顶：${t.map(c=>names[c]).join('、')||'空管'}">${t.map(c=>`<span class="ball ball-${c+1}" style="--color:${colors[c]};--ink:${[0,2,5].includes(c)?'#ffffff':'#15182a'};--sprite:url('assets/ball-${c+1}.png?v=20261102q')"></span>`).join('')}</button></div>`).join('');$('#board').dataset.count=state.board.length;$('#moves').textContent=state.history.length;$('#level').textContent=String(state.level).padStart(2,'0');$('#progress').textContent=state.board.filter(t=>t.length===Game.CAPACITY&&t.every(c=>c===t[0])).length+'/'+[3,5,7][state.mode];$('#undo').disabled=!state.history.length;document.querySelectorAll('[data-mode]').forEach(b=>{b.classList.toggle('active',+b.dataset.mode===state.mode);b.setAttribute('aria-pressed',+b.dataset.mode===state.mode);});if(focus!==undefined)document.querySelector(`[data-tube="${focus}"]`)?.focus({preventScroll:true});clock();}
function clock(){const s=state.elapsed;$('#time').textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');}
function show(content,label,action){$('#dialogContent').innerHTML=content;$('#dialogAction').textContent=label;$('#dialogAction').onclick=()=>{$('#dialog').close();action?.();};$('#dialog').showModal();}
$('#board').onclick=e=>{if(performance.now()<suppressClickUntil)return;const el=e.target.closest('[data-tube]');if(!el||state.done)return;const ball=e.target.closest('.ball');if(ball&&ball!==el.lastElementChild){message('只有最上方的彩球可以移动');return;}const i=+el.dataset.tube;hints=[];if(selected===i){selected=-1;render();return;}if(selected<0){if(!state.board[i].length){message('先选择一根有彩球的管子');return;}selected=i;message(`已选第 ${i+1} 管，选择任意有空位的管子`);render();return;}if(!Game.legal(state.board,selected,i)){message(state.board[i].length===Game.CAPACITY?'这根管子已经满了，请换一个位置':'请选择有空位的其他管子');selected=-1;render();return;}moveBall(selected,i);};
function moveBall(from,i){if(!Game.legal(state.board,from,i))return;state.history.push(Game.copy(state.board));state.board[i].push(state.board[from].pop());selected=-1;tone();state.done=Game.won(state.board);save();render();message('');if(state.done)celebrate();}
function stopCelebration(){
  clearTimeout(celebrationTimer);celebrationTimer=null;celebrating=false;
  document.querySelector('.game').classList.remove('celebrating');
  document.querySelector('.confetti')?.remove();
  document.querySelectorAll('#undo,#hint,#restart,#next,[data-mode],#help').forEach(b=>b.disabled=false);
}
function victoryTone(){
  if(!sound)return;
  try{
    audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();
    [523.25,659.25,783.99,1046.5].forEach((frequency,i)=>{
      const o=audio.createOscillator(),g=audio.createGain(),at=audio.currentTime+.1+i*.16;
      o.type='sine';o.frequency.value=frequency;o.connect(g);g.connect(audio.destination);
      g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(.09,at+.025);
      g.gain.exponentialRampToValueAtTime(.001,at+.65);o.start(at);o.stop(at+.7);
    });
  }catch{}
}
function celebrate(){
  stopCelebration();celebrating=true;
  const completedState=state;
  message('');
  document.querySelectorAll('#undo,#hint,#restart,#next,[data-mode],#help').forEach(b=>b.disabled=true);
  document.querySelectorAll('.tube-wrap').forEach((t,i)=>t.style.setProperty('--order',i));
  document.querySelector('.game').classList.add('celebrating');
  const confetti=document.createElement('div');confetti.className='confetti';confetti.setAttribute('aria-hidden','true');
  for(let i=0;i<32;i++){
    const piece=document.createElement('i');
    piece.style.cssText=`--x:${Math.random()*100}%;--delay:${Math.random()*.45}s;--drift:${Math.random()*120-60}px;--color:${colors[i%colors.length]}`;
    confetti.append(piece);
  }
  document.querySelector('.game').append(confetti);victoryTone();
  celebrationTimer=setTimeout(()=>{
    stopCelebration();
    if(state!==completedState||!state.done)return;
    render();
    show(`<div class="win-icon">✦</div><h2>通关！</h2><p>${state.history.length} 步 · ${$('#time').textContent}</p>`,'下一关',()=>fresh(state.mode,state.level+1));
  },2800);
}


$('#undo').onclick=()=>{if(!state.history.length)return;state.board=state.history.pop();state.done=false;selected=-1;hints=[];save();render();message('已撤销');};
$('#hint').onclick=()=>{if(state.done){message('已经完成啦，开始下一关吧！');return;}const h=state.route[Game.key(state.board)];if(h){hints=h;selected=h[0];render();message(`试试把第 ${h[0]+1} 管的顶球移到第 ${h[1]+1} 管`);}else{message('这条分支暂时没有提示。撤销最近的移动，即可回到已知解法。');}};
$('#restart').onclick=()=>show('<h2>重新开始？</h2>','重开',()=>{state.board=Game.copy(state.initial);state.history=[];state.elapsed=0;state.done=false;selected=-1;hints=[];save();render();message('');});
$('#next').onclick=()=>fresh(state.mode,state.level+1);document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{if(+b.dataset.mode!==state.mode)fresh(+b.dataset.mode,1);});$('#sound').onclick=()=>{sound=!sound;$('#sound').textContent=sound?'♫':'♪';$('#sound').setAttribute('aria-label',sound?'关闭声音':'开启声音');$('#sound').setAttribute('aria-pressed',sound);tone();};$('#help').onclick=()=>show('<h2>规则</h2><p>移动每根管子最上方的球，目标管有空位即可放入。</p><p>同色 7 球装满一管，并留出一根空管即可通关。</p>','继续');$('#close').onclick=()=>$('#dialog').close();
try{const s=JSON.parse(localStorage.getItem('color-sort-v2-capacity7'));if(s&&[0,1,2].includes(s.mode)&&Array.isArray(s.board)&&Array.isArray(s.history)&&s.route&&s.board.length===[4,6,8][s.mode]&&s.board.every(t=>Array.isArray(t)&&t.length<=Game.CAPACITY&&t.every(c=>Number.isInteger(c)&&c>=0&&c<[3,5,7][s.mode])))state=s;}catch{}if(!state)fresh();else render();setInterval(()=>{if(!state.done&&!document.hidden&&!$('#dialog').open){state.elapsed++;clock();save();}},1000);

// Pointer capture keeps the ball attached to mouse, pen, or finger outside the tube.
let drag=null,suppressClickUntil=0;
const boardElement=$('#board');
boardElement.addEventListener('pointerdown',e=>{
  if(!e.isPrimary||e.button!==0||state.done||drag)return;
  const ball=e.target.closest('.ball'),tube=ball?.closest('[data-tube]');
  if(!tube)return;
  if(ball!==tube.lastElementChild){message('只有最上方的彩球可以移动');return;}
  const rect=ball.getBoundingClientRect();
  drag={id:e.pointerId,from:+tube.dataset.tube,ball,startX:e.clientX,startY:e.clientY,offsetX:e.clientX-rect.left,offsetY:e.clientY-rect.top,rect,ghost:null};
  boardElement.setPointerCapture(e.pointerId);
});
function dropTarget(x,y){return document.elementFromPoint(x,y)?.closest('[data-tube]');}
function clearDropHighlights(){boardElement.querySelectorAll('.drop-valid,.drop-invalid').forEach(t=>t.classList.remove('drop-valid','drop-invalid'));}
boardElement.addEventListener('pointermove',e=>{
  if(!drag||drag.id!==e.pointerId)return;
  if(!drag.ghost&&Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)<5)return;
  if(!drag.ghost){
    selected=-1;hints=[];
    boardElement.querySelectorAll('.selected,.hinted').forEach(t=>t.classList.remove('selected','hinted'));
    const ghost=drag.ball.cloneNode(true);ghost.classList.add('drag-ghost');ghost.setAttribute('aria-hidden','true');
    ghost.style.width=drag.rect.width+'px';ghost.style.height=drag.rect.height+'px';
    document.body.append(ghost);drag.ghost=ghost;drag.ball.classList.add('drag-origin');document.body.classList.add('dragging');
  }
  e.preventDefault();
  drag.ghost.style.left=(e.clientX-drag.offsetX)+'px';drag.ghost.style.top=(e.clientY-drag.offsetY)+'px';
  clearDropHighlights();const target=dropTarget(e.clientX,e.clientY);
  if(target&&+target.dataset.tube!==drag.from)target.classList.add(Game.legal(state.board,drag.from,+target.dataset.tube)?'drop-valid':'drop-invalid');
});
function finishDrag(e,cancel=false){
  if(!drag||(e.pointerId!==undefined&&drag.id!==e.pointerId))return;
  const d=drag;drag=null;
  const target=!cancel&&d.ghost?dropTarget(e.clientX,e.clientY):null;
  d.ghost?.remove();d.ball.classList.remove('drag-origin');document.body.classList.remove('dragging');clearDropHighlights();
  if(boardElement.hasPointerCapture(d.id))boardElement.releasePointerCapture(d.id);
  if(!d.ghost)return;
  suppressClickUntil=performance.now()+450;
  if(target&&Game.legal(state.board,d.from,+target.dataset.tube)){moveBall(d.from,+target.dataset.tube);}
  else{selected=-1;render();message(cancel?'拖动已取消，彩球已回到原位':'这里不能放置，彩球已回到原位');}
}
boardElement.addEventListener('pointerup',e=>finishDrag(e));
boardElement.addEventListener('pointercancel',e=>finishDrag(e,true));
boardElement.addEventListener('lostpointercapture',e=>finishDrag(e,true));
window.addEventListener('blur',()=>finishDrag({},true));
window.addEventListener('keydown',e=>{if(e.key==='Escape')finishDrag({},true);});

// On phones, derive tube height from the rendered ball instead of an estimated
// aspect ratio: seven balls, six gaps, and exactly 20px above the top ball.
function syncMobileTubeHeights(){
  const tubes=[...boardElement.querySelectorAll('.tube')];
  const compact=window.matchMedia('(max-width: 760px)').matches&&state.board.length>=6;
  if(!compact){
    tubes.forEach(tube=>{tube.style.height='';tube.style.aspectRatio='';});
    return;
  }
  const ball=boardElement.querySelector('.ball');
  const tube=tubes[0];
  if(!ball||!tube)return;
  const style=getComputedStyle(tube);
  const gap=parseFloat(style.rowGap)||parseFloat(style.gap)||0;
  const shell=['paddingTop','paddingBottom','borderTopWidth','borderBottomWidth']
    .reduce((sum,key)=>sum+(parseFloat(style[key])||0),0);
  const height=Math.ceil(
    ball.getBoundingClientRect().height*Game.CAPACITY+
    gap*(Game.CAPACITY-1)+20+shell
  );
  tubes.forEach(item=>{item.style.height=`${height}px`;item.style.aspectRatio='auto';});
}
const tubeSizeObserver=new MutationObserver(()=>requestAnimationFrame(syncMobileTubeHeights));
tubeSizeObserver.observe(boardElement,{childList:true});
window.addEventListener('resize',()=>requestAnimationFrame(syncMobileTubeHeights));
requestAnimationFrame(syncMobileTubeHeights);
