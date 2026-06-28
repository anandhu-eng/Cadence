'use strict';

/* ── Data ── */

const TOPICS = [
  // Personal experience
  "Describe the moment you realised you were more capable than you thought you were.",
  "Walk through your morning routine and explain why each step genuinely matters to you.",
  "Tell the story of a small habit that quietly changed your life for the better.",
  "Describe a place you visited once that you still think about regularly.",
  "What's one belief you held strongly five years ago that you no longer hold — and why did it shift?",
  // Opinion
  "There's a widely praised film, book, or food you genuinely don't enjoy. Make the case.",
  "Name one social norm most people follow without questioning — and argue for or against it.",
  "What's the most underrated skill a person can develop? Build the argument.",
  "Pick something people romanticise that's actually overrated and explain your thinking.",
  "Is it better to be a specialist or a generalist in today's world? Take a position.",
  // Explanation
  "Explain how compound interest works to someone who has never thought seriously about money.",
  "Describe how the internet physically moves data from your device to another — in plain language.",
  "Explain why sleep affects learning and memory, as if talking to a curious twelve-year-old.",
  "Walk someone through exactly how you'd approach a problem you've never seen before.",
  "Explain what makes a great question different from a mediocre one — and give a concrete example.",
  // Storytelling
  "Describe a stranger you once observed in public who made a lasting impression on you.",
  "Recreate the atmosphere of the most unusual room you've ever been in.",
  "Tell the story of a time something went wrong in a way that later turned out to be a gift.",
  "Describe an ordinary weekday morning in your life as if it were a scene in a film.",
  "Paint a picture of a conversation — real or imagined — that changed how you see yourself.",
  // Professional
  "Pitch an idea you genuinely believe in but haven't fully worked out yet.",
  "Describe a professional mistake you made and what it actually taught you.",
  "Explain your current role or field to someone at a dinner party who has never heard of it.",
  "What's a decision you made under pressure that you'd make exactly the same way again — and why?",
  "Describe the most effective colleague or manager you've worked with. What specifically made them that way?"
];

const QUOTES = [
  "“Rhythm before perfection.”",
  "“Every round builds the muscle.”",
  "“Pace is a skill. You just practiced it.”",
  "“The voice gets clearer with each rep.”",
  "“Fluency is built in small, consistent doses.”",
  "“You spoke. That’s the only requirement.”",
  "“Confidence lives on the other side of repetition.”",
  "“The pause is not a flaw. It’s punctuation.”",
  "“Speak again tomorrow. That’s all.”",
  "“Precision takes practice. You’re practicing.”"
];

/* ── State ── */

let topic   = '';
let words   = 0;
let elapsed = 0;
let actx    = null;
let nextBeat = 0;
let schedId  = null;
let timerId  = null;
let startMs  = 0;

const BPM   = 85;
const BEAT  = 60 / BPM;  // ~0.7059s per beat
const AHEAD = 0.1;        // seconds to schedule ahead
const TICK  = 25;         // scheduler poll interval (ms)

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
  pulseEl.style.transition  = instant ? 'none' : state.transition;
  pulseEl.style.transform   = state.transform;
  pulseEl.style.background  = state.background;
  pulseEl.style.boxShadow   = state.boxShadow;
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
  const osc = actx.createOscillator();
  const gain = actx.createGain();
  osc.connect(gain);
  gain.connect(actx.destination);

  osc.type = 'sine';
  osc.frequency.value = 1000;

  gain.gain.setValueAtTime(0, when);
  gain.gain.linearRampToValueAtTime(0.27, when + 0.001);  // 1ms attack
  gain.gain.linearRampToValueAtTime(0,    when + 0.012);  // 10ms release

  osc.start(when);
  osc.stop(when + 0.013);

  // Fire visual pulse in sync with the audio click
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
  clearInterval(schedId);
  schedId = null;
  if (actx) { actx.close().catch(() => {}); actx = null; }
}

/* ── Session timer ── */

function formatTime(s) {
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
}

function startTimer() {
  startMs = Date.now();
  elapsed = 0;
  document.getElementById('timer').textContent = '00:00';
  timerId = setInterval(() => {
    elapsed = Math.floor((Date.now() - startMs) / 1000);
    document.getElementById('timer').textContent = formatTime(elapsed);
  }, 500);
}

function stopTimer() {
  clearInterval(timerId);
  timerId = null;
}

/* ── Utilities ── */

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function pickBut(arr, exclude) {
  const filtered = arr.filter(t => t !== exclude);
  return pick(filtered.length ? filtered : arr);
}
function wordCount(str) {
  const trimmed = str.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

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

/* ── Screen 1: Topic ── */

function loadTopic(excludeCurrent) {
  topic = excludeCurrent ? pickBut(TOPICS, topic) : pick(TOPICS);
  document.getElementById('topic-text').textContent = topic;
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
  document.getElementById('written-text').textContent = document.getElementById('ta').value.trim();
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
  goTo('summary');
});

/* ── Screen 4: Summary ── */

document.getElementById('btn-new').addEventListener('click', () => {
  loadTopic(true);
  goTo('topic');
});

document.getElementById('btn-same').addEventListener('click', () => {
  document.getElementById('speak-topic').textContent = topic;
  goTo('speak');
  applyPulse(PULSE_REST, true);
  startMetronome();
  startTimer();
});

/* ── Init ── */

loadTopic(false);
