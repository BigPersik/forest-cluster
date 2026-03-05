/**
 * Simple sound effects via Web Audio API (no external files).
 * Call init() after first user gesture to unlock audio.
 */

let ctx = null;
let muted = false;
let musicGainNode = null;
let musicLoopTimeout = null;
let musicRunning = false;
const MUSIC_VOLUME = 0.08;
const PHRASE_DURATION = 8; // seconds per loop

function getContext() {
  if (ctx) return ctx;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  } catch (_) {
    return null;
  }
  return ctx;
}

function getMusicGain() {
  const c = getContext();
  if (!c) return null;
  if (!musicGainNode) {
    musicGainNode = c.createGain();
    musicGainNode.connect(c.destination);
    musicGainNode.gain.value = muted ? 0 : MUSIC_VOLUME;
  }
  return musicGainNode;
}

/** Call after user click/tap to allow playback. */
export function init() {
  const c = getContext();
  if (c && c.state === 'suspended') c.resume();
  return c;
}

export function setMuted(value) {
  muted = !!value;
  if (musicGainNode) {
    const c = getContext();
    if (c) musicGainNode.gain.setValueAtTime(muted ? 0 : MUSIC_VOLUME, c.currentTime);
  }
}

export function isMuted() {
  return muted;
}

function playTone(options) {
  if (muted) return;
  const c = getContext();
  if (!c) return;
  const {
    frequency = 440,
    duration = 0.1,
    type = 'sine',
    volume = 0.15,
    rampDown = 0.05,
  } = options;
  try {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, c.currentTime);
    gain.gain.setValueAtTime(volume, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, c.currentTime + Math.min(rampDown, duration));
    osc.start(c.currentTime);
    osc.stop(c.currentTime + duration);
  } catch (_) {}
}

/** Short click when spin starts. */
export function playSpin() {
  if (muted) return;
  const c = getContext();
  if (!c) return;
  try {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, c.currentTime);
    gain.gain.setValueAtTime(0.12, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, c.currentTime + 0.06);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + 0.08);
  } catch (_) {}
}

/** Win chime (short ascending notes). */
export function playWin() {
  if (muted) return;
  const c = getContext();
  if (!c) return;
  const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
  notes.forEach((freq, i) => {
    try {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain);
      gain.connect(c.destination);
      osc.type = 'sine';
      const t = c.currentTime + i * 0.08;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
      osc.start(t);
      osc.stop(t + 0.18);
    } catch (_) {}
  });
}

/** Feature trigger (bonus fanfare). */
export function playFeature() {
  if (muted) return;
  const c = getContext();
  if (!c) return;
  const notes = [392, 523.25, 659.25, 783.99]; // G4, C5, E5, G5
  notes.forEach((freq, i) => {
    try {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain);
      gain.connect(c.destination);
      osc.type = 'triangle';
      const t = c.currentTime + i * 0.12;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
      osc.start(t);
      osc.stop(t + 0.22);
    } catch (_) {}
  });
}

/** Soft tick for cascade/reveal (optional). */
export function playReveal() {
  if (muted) return;
  playTone({ frequency: 400, duration: 0.05, volume: 0.08, rampDown: 0.03 });
}

/** Lounge/casino-style chord pad: soft chords in a loop. */
function playMusicPhrase() {
  if (!musicRunning) return;
  const c = getContext();
  const gainNode = getMusicGain();
  if (!c || !gainNode) return;
  // Chord progression (Am7 → Fmaj7 → Cmaj7 → G) — relaxed, casino vibe; each chord 2s
  const chords = [
    [220, 261.63, 329.63],      // Am7 (A3, C4, E4)
    [174.61, 261.63, 349.23],   // Fmaj7 (F3, C4, A4)
    [261.63, 329.63, 392],      // Cmaj7 (C4, E4, G4)
    [196, 261.63, 329.63],     // G (G3, C4, E4)
  ];
  const chordDuration = 2;
  chords.forEach((freqs, chordIndex) => {
    const t0 = c.currentTime + chordIndex * chordDuration;
    freqs.forEach((freq, i) => {
      try {
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.connect(gain);
        gain.connect(gainNode);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t0);
        gain.gain.setValueAtTime(0, t0);
        gain.gain.linearRampToValueAtTime(0.25, t0 + 0.4);
        gain.gain.setValueAtTime(0.25, t0 + chordDuration - 0.3);
        gain.gain.linearRampToValueAtTime(0, t0 + chordDuration);
        osc.start(t0);
        osc.stop(t0 + chordDuration);
      } catch (_) {}
    });
  });
  musicLoopTimeout = setTimeout(playMusicPhrase, PHRASE_DURATION * 1000);
}

/** Start looping background music (call after user gesture). */
export function startBackgroundMusic() {
  if (musicRunning) return;
  const c = getContext();
  if (!c) return;
  musicRunning = true;
  getMusicGain();
  if (muted) return;
  playMusicPhrase();
}

/** Stop background music. */
export function stopBackgroundMusic() {
  musicRunning = false;
  if (musicLoopTimeout) {
    clearTimeout(musicLoopTimeout);
    musicLoopTimeout = null;
  }
}
