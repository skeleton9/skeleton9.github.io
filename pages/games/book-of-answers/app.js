const answers = [
  '先迈出一小步，再决定下一步。','你可以比现在更相信自己。','给这件事一点生长的时间。','去问那个你一直想问的人。','答案藏在你还没尝试的方法里。','把选择留给更平静的自己。','今天就开始，不必等到完美。','先听完，再作决定。','这一次，试着表达真实的需要。','换一个角度，路就出现了。','你已经知道什么对自己重要。','不要替尚未发生的事下结论。','让行动替你回答。','先放下，再看清。','值得，但需要耐心。','小小的改变会带来新的可能。','向前走，也记得休息。','去确认事实，而非反复猜测。','试着接受一个不一样的结果。','此刻适合重新整理方向。','把复杂的问题拆成简单的一步。','给对方一个解释的机会。','你可以温柔，也可以坚定。','这件事值得一次认真尝试。','暂时没有答案，也没有关系。','留一点空间，让意外发生。','把时间花在你能改变的部分。','去找一个有经验的人聊聊。','允许自己改变主意。','先照顾好自己的状态。','不要让一次失误定义全部。','那个微小的念头值得记录。','选择让你更自在的方向。','再多看一条路。','先完成，再慢慢打磨。','你不需要立刻回应。','坦诚会让事情变得简单。','让期待靠近现实一点。','把注意力带回今天。','去做一件让你恢复能量的小事。','耐心听听心里最轻的声音。','放下比较，找到自己的节奏。','把担心写下来，再逐一看清。','这一次，可以主动一点。','先做一个小实验。','有些事需要合作才能完成。','别忘了你已经走过的路。','给新的可能留一扇门。'
];
const book = document.getElementById('book');
const hint = document.getElementById('hint');
const after = document.getElementById('after');
const answer = document.getElementById('answer');
let state = 'closed';
let startTime = 0;
let frame;
let lastIndex = -1;
let soundEnabled = false;
let audio;
function chime() {
  if (!soundEnabled) return;
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    audio.resume();
    [261.63, 392, 523.25].forEach((frequency, index) => {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      const time = audio.currentTime + index * .13;
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(.035, time + .03);
      gain.gain.exponentialRampToValueAtTime(.001, time + 1.8);
      oscillator.connect(gain).connect(audio.destination);
      oscillator.start(time);
      oscillator.stop(time + 2);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    });
  } catch { /* Sound is optional when audio is unavailable. */ }
}
function charge() {
  const progress = Math.min((performance.now() - startTime) / 1600, 1);
  document.body.style.setProperty('--charge', progress);
  if (progress === 1) hint.textContent = '问题已在心中 · 松开，听见答案';
  if (state === 'holding') frame = requestAnimationFrame(charge);
}
function begin() {
  if (state !== 'closed') return;
  state = 'holding';
  startTime = performance.now();
  document.body.classList.add('holding');
  hint.textContent = '慢慢呼吸，把问题放在心里…';
  charge();
}
function reveal() {
  if (state !== 'holding') return;
  cancelAnimationFrame(frame);
  state = 'open';
  const random = crypto.getRandomValues(new Uint32Array(1))[0];
  let index = random % (answers.length - 1);
  if (index >= lastIndex && lastIndex >= 0) index++;
  lastIndex = index;
  answer.textContent = answers[index];
  document.body.classList.remove('holding');
  document.body.classList.add('open');
  after.hidden = false;
  hint.textContent = answers[index];
  book.setAttribute('aria-label', `答案：${answers[index]}`);
  chime();
}
function cancel() {
  if (state !== 'holding') return;
  cancelAnimationFrame(frame);
  state = 'closed';
  document.body.classList.remove('holding');
  document.body.style.setProperty('--charge', 0);
  hint.textContent = '按住书封，默想问题 · 松开揭晓';
}
book.addEventListener('pointerdown', event => {
  if (event.button !== 0 || state !== 'closed') return;
  book.setPointerCapture(event.pointerId);
  begin();
});
book.addEventListener('pointerup', reveal);
book.addEventListener('pointercancel', cancel);
book.addEventListener('keydown', event => {
  if ([' ', 'Enter'].includes(event.key)) { event.preventDefault(); if (!event.repeat) begin(); }
});
book.addEventListener('keyup', event => {
  if ([' ', 'Enter'].includes(event.key)) { event.preventDefault(); reveal(); }
});
book.addEventListener('click', () => { if (state === 'closed') { begin(); reveal(); } });
book.addEventListener('blur', cancel);
window.addEventListener('blur', cancel);
document.addEventListener('visibilitychange', () => { if (document.hidden) cancel(); });
document.getElementById('again').onclick = () => {
  state = 'closed';
  document.body.classList.remove('open');
  document.body.style.setProperty('--charge', 0);
  after.hidden = true;
  hint.textContent = '按住书封，默想问题 · 松开揭晓';
  book.setAttribute('aria-label', '按住书封，默想问题后松开揭晓答案');
  book.focus();
};
document.getElementById('copy').onclick = async () => {
  try { await navigator.clipboard.writeText(answer.textContent); hint.textContent = '答案已复制'; }
  catch { hint.textContent = `请手动复制：${answer.textContent}`; }
};
document.getElementById('sound').onclick = event => {
  soundEnabled = !soundEnabled;
  event.currentTarget.textContent = `声音 · ${soundEnabled ? '开启' : '关闭'}`;
  event.currentTarget.setAttribute('aria-pressed', String(soundEnabled));
  if (soundEnabled) chime();
};
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const dust = document.getElementById('dust');
  for (let i = 0; i < 32; i++) {
    const mote = document.createElement('i');
    mote.className = 'mote';
    mote.style.left = `${Math.random() * 100}%`;
    mote.style.top = `${20 + Math.random() * 80}%`;
    mote.style.setProperty('--duration', `${7 + Math.random() * 10}s`);
    mote.style.animationDelay = `${-Math.random() * 15}s`;
    dust.append(mote);
  }
}
