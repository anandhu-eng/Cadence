# Cadence

A mobile-first daily speech practice tool that helps you develop controlled, confident communication through structured writing, metronome-paced speaking, and rotating topic prompts.

---

## What it does

Each session is a four-step ritual:

1. **Topic** — A prompt is drawn from a bank of 25 curated topics across five categories. Shuffle until one feels right.
2. **Write** — Spend a minute writing your thoughts. No editing, no perfection. The word count unlocks the next step at 10 words.
3. **Speak** — Your written text is hidden. Speak from instinct at 85 BPM, guided by the Cadence Pulse — a glowing circle that expands on every beat, synced precisely to a soft metronome click via the Web Audio API.
4. **Summary** — See your time spoken and words written. Start a new round or repeat the same topic.

---

## Features

- 25 topic prompts spanning personal experience, opinion, explanation, storytelling, and professional scenarios
- Drift-free 85 BPM metronome using the Web Audio API lookahead scheduling pattern
- Visual pulse animation driven by the audio scheduler — not an independent CSS timer
- Smooth 200ms fade transitions between screens
- Live word count with a threshold gate on the speak button
- Session timer counting up during the speaking phase
- Rotating motivational lines on the summary screen
- Safe-area inset support for notched iPhones (`viewport-fit=cover`)
- No frameworks, no build tools, no dependencies — three plain files

---

## Project structure

```
cadence/
├── index.html    # Markup — four screen divs, no inline styles or scripts
├── styles.css    # All styles — design tokens, layout, components, screen-specific rules
└── app.js        # All logic — data, audio scheduler, pulse, timer, screen navigation
```

---

## Running locally

No build step. Open `index.html` directly in a browser, or serve with any static file server:

```bash
# Python
python3 -m http.server 8000

# Node (npx)
npx serve .
```

Then open `http://localhost:8000`.

> **Note:** Web Audio API requires a user gesture before audio can play. The metronome starts on the "Start Speaking →" tap, which satisfies the browser requirement automatically.

---

## Browser support

Tested on:
- Safari iOS 16+
- Chrome Android 110+
- Chrome / Safari / Firefox desktop (latest)

Requires: Web Audio API, CSS custom properties, `position: fixed`, `100dvh`.

---

## Tech

| Concern | Approach |
|---|---|
| Fonts | Google Fonts — DM Serif Display (wordmark, topics) + Inter (UI) |
| Audio | Web Audio API — `OscillatorNode` + `GainNode`, lookahead scheduler |
| Animation | JS-driven inline style writes synced to audio clock |
| Layout | Single centered column, `max-width: 420px`, `position: fixed` screens |
| Transitions | CSS `opacity` + `pointer-events` toggle, 200ms ease |
| State | Module-level variables — no localStorage, no frameworks |

---

## Design

- **Background:** `#0A0E1A` — deep midnight navy
- **Surfaces:** `#111827`
- **Accent:** `#F5A623` — warm amber, used only for the pulse, CTAs, and active states
- **Text:** `#F0F0F0` primary, `#6B7280` secondary
