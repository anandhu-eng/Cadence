'use strict';

/* ── Data ── */

const TOPICS = [
  // Gratitude & Small Wins
  "Describe one moment from yesterday that you wouldn't want to have missed — even if it was small.",
  "Think of a person who made your life better in a way they probably don't know about. What would you tell them?",
  "What's something you have today that your past self would have been genuinely grateful for?",
  "Describe a recent moment — however brief — when you felt completely at ease. What was around you?",
  "What's one thing about your daily life that you take for granted but would miss enormously if it disappeared?",
  "Think of a small act of kindness you witnessed recently — from a stranger or someone you know. Describe it.",
  "What's a skill or ability you have that you rarely stop to appreciate? Where did it come from?",
  "Describe a place — physical or otherwise — where you consistently feel like yourself. What makes it that way?",
  "What's something that happened this week that, looking back, you're glad occurred — even if it was inconvenient?",
  "Think of a sensory detail from the past few days — a sound, a smell, a texture — that you found unexpectedly pleasant. Describe it.",

  // Growth & Learning
  "What's something you've gotten noticeably better at in the past year — and what did that improvement actually cost you?",
  "Describe a time you were wrong about something important. What did it feel like when you finally realised it?",
  "What's a challenge you're currently in the middle of, and how is it quietly changing you?",
  "Think of yourself five years ago. What would you want to say to that person — not to fix them, but to reassure them?",
  "What's one thing you learned recently that made you see the world slightly differently?",
  "Describe a moment when feedback — even uncomfortable feedback — turned out to be exactly what you needed.",
  "What's a habit or pattern you've noticed in yourself that you'd like to understand better?",
  "Think of a book, conversation, or experience that rewired how you think about something. What was it?",
  "What's something you used to find difficult that now comes naturally? How did that shift happen?",
  "Describe a time you chose to stay curious instead of becoming defensive. What made that possible?",

  // Values & Identity
  "What's a value you genuinely live by — not just say you do — and how did you come to hold it?",
  "Describe a moment when you had to choose between what was easy and what was right. What happened?",
  "What kind of person do you want to be remembered as — and how close are you to being that person today?",
  "What's something you believe that most people around you don't? How do you sit with that difference?",
  "If you stripped away your job title, your roles, and your routines — what would remain that's distinctly you?",
  "What's a decision you've made that others questioned, but that you'd make exactly the same way again?",
  "Describe a time your actions lined up perfectly with your values. What did that feel like?",
  "What's something you've changed your mind about that you once felt was a fixed part of who you are?",
  "Think of a quality you deeply admire in someone else. How much of it do you already have?",
  "What does living a good life look like to you — specifically, not abstractly?",

  // Relationships & Connection
  "Describe someone in your life who seems to bring out the best in you. What specifically do they do?",
  "Think of a relationship that has quietly grown stronger over time. What do you think built it?",
  "Is there something you've been meaning to say to someone but haven't? What's holding you back?",
  "Describe a moment when someone showed up for you unexpectedly. How did it change things?",
  "What's one thing you wish you did differently in how you show up for the people closest to you?",
  "Think of a relationship that taught you something about yourself — where you saw a side of yourself you hadn't before.",
  "Describe a conversation you've had recently that left you feeling genuinely understood. What made it work?",
  "Is there someone in your life you've been taking for granted? What would it mean to show them you see them?",
  "Think of someone you've lost touch with. What do you miss about them, and what did they bring out in you?",
  "What does it look like when you're at your best in a relationship? What conditions make that version of you appear?",

  // Resilience & Forward Motion
  "Describe a difficult period in your life that — looking back — you're quietly glad you went through.",
  "What's something you've been avoiding that, if you faced it, would probably make your life better?",
  "Think of a time when things didn't go to plan but you adapted anyway. What did that feel like in the moment?",
  "What does a version of your life that's slightly better than today look like? What's one small thing separating it from now?",
  "What's the best advice you've ever received that you still carry with you — and do you actually live by it?",
  "Describe a moment when you surprised yourself with your own resilience. What made you capable of that?",
  "What's a fear you've walked toward — deliberately — in the last year? What did you find on the other side?",
  "Think of something you once thought would break you that didn't. How did that change your sense of what you can handle?",
  "What's one thing you want to be different about your life a year from now — and what's the first honest step toward it?",
  "Describe the last time you felt genuinely proud of yourself. What had you done, and why did it matter?"
];

const QUOTES = [
  "“Reflection is not looking back. It’s seeing clearly.”",
  "“The question you answer honestly is the one that changes you.”",
  "“You showed up this morning. That’s where it starts.”",
  "“Growth is mostly quiet. You’re growing.”",
  "“Saying it out loud makes it real. That’s why this works.”",
  "“The person you’re becoming is built in moments like this.”",
  "“Small revelations, every morning.”",
  "“Clarity comes from speaking what’s usually kept silent.”",
  "“You don’t need to have it figured out. You just need to keep showing up.”",
  "“Same time tomorrow.”"
];

/* ── localStorage state ── */

const STORAGE_KEY = 'cadence-topic-states';

function loadStates() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

function saveStates(states) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
}

function getState(index) {
  return loadStates()[index] || 'active';
}

function setState(index, state) {
  const states = loadStates();
  if (state === 'active') {
    delete states[String(index)];
  } else {
    states[String(index)] = state;
  }
  saveStates(states);
}

function getPool(excludeIndex) {
  const states = loadStates();
  const all = TOPICS.map((_, i) => i).filter(i => i !== excludeIndex);

  const active = all.filter(i => !states[i]);
  if (active.length > 0) return { pool: active, type: 'active' };

  const revisit = all.filter(i => states[i] === 'revisit');
  if (revisit.length > 0) return { pool: revisit, type: 'revisit' };

  return { pool: [], type: 'empty' };
}

function resetDoneTopics() {
  const states = loadStates();
  Object.keys(states).forEach(k => { if (states[k] === 'done') delete states[k]; });
  saveStates(states);
}

/* ── Runtime state ── */

let topic      = '';
let topicIndex = -1;
let words      = 0;
let elapsed    = 0;
let actx       = null;
let nextBeat   = 0;
let schedId    = null;
let timerId    = null;
let startMs    = 0;

const BPM   = 85;
const BEAT  = 60 / BPM;
const AHEAD = 0.1;
const TICK  = 25;

/* ── Pulse ── */

const pulseEl = document.getElementById('pulse');

const PULSE_REST = {
  transition: 'transform 420ms cubic-bezier(.2,.8,.4,1), box-shadow 420ms cubic-bezier(.2,.8,.4,1)',
  transform:  'scale(1)',
  background: 'radial-gradient(circle at 36% 30%, rgba(245,166,35,.22) 0%, rgba(245,166,35,.07) 52%, rgba(245,166,35,.02) 100%)',
  boxShadow:  '0 0 0 1.5px rgba(245,166,35,.28), 0 0 22px rgba(245,166,35,.1), 0 0 48px rgba(245,166,35,.05), inset 0 0 28px rgba(245,166,35,.04)',
};

const PULSE_BEAT = {
  transition: 'transform 55ms cubic-bezier(.1,.7,.4,1), box-shadow 55ms cubic-bezier(.1,.7,.4,1)',
  transform:  'scale(1.15)',
  background: 'radial-gradient(circle at 36% 30%, rgba(245,166,35,.55) 0%, rgba(245,166,35,.2) 48%, rgba(245,166,35,.06) 100%)',
  boxShadow:  '0 0 0 1.5px rgba(245,166,35,.9), 0 0 36px rgba(245,166,35,.6), 0 0 72px rgba(245,166,35,.3), 0 0 110px rgba(245,166,35,.12), inset 0 0 36px rgba(245,166,35,.2)',
};

function applyPulse(state, instant) {
  pulseEl.style.transition = instant ? 'none' : state.transition;
  pulseEl.style.transform  = state.transform;
  pulseEl.style.background = state.background;
  pulseEl.style.boxShadow  = state.boxShadow;
}

applyPulse(PULSE_REST, true);

function firePulse() {
  applyPulse(PULSE_BEAT);
  setTimeout(() => applyPulse(PULSE_REST), 65);
}

/* ── Audio / metronome ── */

function initAudio() {
  if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
  if (actx.state === 'suspended') actx.resume();
}

function scheduleClick(when) {
  const osc  = actx.createOscillator();
  const gain = actx.createGain();
  osc.connect(gain);
  gain.connect(actx.destination);
  osc.type = 'sine';
  osc.frequency.value = 1000;
  gain.gain.setValueAtTime(0, when);
  gain.gain.linearRampToValueAtTime(0.27, when + 0.001);
  gain.gain.linearRampToValueAtTime(0,    when + 0.012);
  osc.start(when);
  osc.stop(when + 0.013);
  const msFromNow = Math.max(0, (when - actx.currentTime) * 1000);
  setTimeout(firePulse, msFromNow);
}

function runScheduler() {
  if (!actx) return;
  while (nextBeat < actx.currentTime + AHEAD) {
    scheduleClick(nextBeat);
    nextBeat += BEAT;
  }
}

function startMetronome() {
  initAudio();
  nextBeat = actx.currentTime + 0.06;
  runScheduler();
  schedId = setInterval(runScheduler, TICK);
}

function stopMetronome() {
  clearInterval(schedId); schedId = null;
  if (actx) { actx.close().catch(() => {}); actx = null; }
}

/* ── Session timer ── */

function formatTime(s) {
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
}

function startTimer() {
  startMs = Date.now(); elapsed = 0;
  document.getElementById('timer').textContent = '00:00';
  timerId = setInterval(() => {
    elapsed = Math.floor((Date.now() - startMs) / 1000);
    document.getElementById('timer').textContent = formatTime(elapsed);
  }, 500);
}

function stopTimer() { clearInterval(timerId); timerId = null; }

/* ── Utilities ── */

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function wordCount(str) { const t = str.trim(); return t ? t.split(/\s+/).length : 0; }

/* ── Screen navigation ── */

const screens = {};
['topic', 'write', 'speak', 'summary'].forEach(id => {
  screens[id] = document.getElementById('s-' + id);
});

function goTo(id) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[id].classList.add('active');
  screens[id].scrollTop = 0;
}

/* ── Topic state UI ── */

function updateStateButtons() {
  const state = getState(topicIndex);
  document.getElementById('btn-revisit').classList.toggle('active', state === 'revisit');
  document.getElementById('btn-done-topic').classList.toggle('active', state === 'done');
}

function showPoolEmpty() {
  document.getElementById('topic-card').style.display  = 'none';
  document.getElementById('pool-empty').style.display  = 'block';
  document.getElementById('btn-ready').disabled        = true;
  document.getElementById('btn-shuffle').disabled      = true;
}

function hidePoolEmpty() {
  document.getElementById('topic-card').style.display  = '';
  document.getElementById('pool-empty').style.display  = 'none';
  document.getElementById('btn-ready').disabled        = false;
  document.getElementById('btn-shuffle').disabled      = false;
}

/* ── Screen 1: Topic ── */

function loadTopic(excludeCurrent) {
  const { pool, type } = getPool(excludeCurrent ? topicIndex : -1);

  if (type === 'empty') {
    showPoolEmpty();
    return;
  }

  topicIndex = pick(pool);
  topic = TOPICS[topicIndex];
  document.getElementById('topic-text').textContent = topic;
  hidePoolEmpty();
}

document.getElementById('btn-shuffle').addEventListener('click', () => loadTopic(true));

document.getElementById('btn-ready').addEventListener('click', () => {
  document.getElementById('write-topic').textContent = topic;
  document.getElementById('ta').value = '';
  words = 0;
  syncWordCount();
  goTo('write');
  setTimeout(() => document.getElementById('ta').focus(), 230);
});

document.getElementById('btn-speak-direct').addEventListener('click', () => {
  document.getElementById('speak-topic').textContent = topic;
  const writtenEl = document.getElementById('written-text');
  writtenEl.textContent = '';
  writtenEl.style.display = 'none';
  words = 0;
  goTo('speak');
  applyPulse(PULSE_REST, true);
  startMetronome();
  startTimer();
});

document.getElementById('btn-revisit').addEventListener('click', () => {
  const current = getState(topicIndex);
  setState(topicIndex, current === 'revisit' ? 'active' : 'revisit');
  updateStateButtons();
});

document.getElementById('btn-done-topic').addEventListener('click', () => {
  const current = getState(topicIndex);
  setState(topicIndex, current === 'done' ? 'active' : 'done');
  updateStateButtons();
});

document.getElementById('btn-reset-pool').addEventListener('click', () => {
  resetDoneTopics();
  loadTopic(false);
});

/* ── Screen 2: Write ── */

function syncWordCount() {
  const n = wordCount(document.getElementById('ta').value);
  words = n;
  const label = document.getElementById('wc');
  label.textContent = n === 1 ? '1 word' : n + ' words';
  label.classList.toggle('go', n >= 10);
  document.getElementById('btn-speak').disabled = n < 10;
}

document.getElementById('ta').addEventListener('input', syncWordCount);
document.getElementById('back-write').addEventListener('click', () => goTo('topic'));

document.getElementById('btn-speak').addEventListener('click', () => {
  document.getElementById('speak-topic').textContent = topic;
  const written = document.getElementById('ta').value.trim();
  const writtenEl = document.getElementById('written-text');
  writtenEl.textContent = written;
  writtenEl.style.display = written ? '' : 'none';
  goTo('speak');
  applyPulse(PULSE_REST, true);
  startMetronome();
  startTimer();
});

/* ── Screen 3: Speak ── */

document.getElementById('btn-done').addEventListener('click', () => {
  stopMetronome();
  stopTimer();
  document.getElementById('s-time').textContent  = formatTime(elapsed);
  document.getElementById('s-words').textContent = words;
  document.getElementById('motiv').textContent   = pick(QUOTES);
  updateStateButtons();
  goTo('summary');
});

/* ── Screen 4: Summary ── */

document.getElementById('btn-new').addEventListener('click', () => {
  loadTopic(true);
  goTo('topic');
});

document.getElementById('btn-same').addEventListener('click', () => {
  document.getElementById('speak-topic').textContent = topic;
  // Keep written text visible if it exists from the write screen; hide otherwise
  const writtenEl = document.getElementById('written-text');
  if (!writtenEl.textContent) writtenEl.style.display = 'none';
  goTo('speak');
  applyPulse(PULSE_REST, true);
  startMetronome();
  startTimer();
});

/* ── Init ── */

loadTopic(false);
