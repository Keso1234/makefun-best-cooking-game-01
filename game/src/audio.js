// Synthesised sound only: every effect is a WebAudio oscillator or filtered
// noise, so the game needs no audio files and never breaks offline play.
export function createSoundEngine() {
  let context = null;
  let muted = false;

  function ensureContext() {
    if (context) {
      if (context.state === 'suspended') context.resume();
      return context;
    }
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    context = new AudioContext();
    return context;
  }

  function tone(freq, dur, type, vol, slideTo) {
    if (muted) return;
    const ctx = ensureContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + dur);
    gain.gain.setValueAtTime(vol || 0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  }

  function noise(dur, vol, filterFreq) {
    if (muted) return;
    const ctx = ensureContext();
    if (!ctx) return;
    const length = Math.floor(ctx.sampleRate * dur);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq || 1800;
    const gain = ctx.createGain();
    gain.gain.value = vol || 0.1;
    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start();
  }

  const sounds = {
    click() { tone(660, 0.07, 'triangle', 0.08); },
    chop() { noise(0.09, 0.16, 900); tone(180, 0.08, 'square', 0.05, 90); },
    sizzle() { noise(0.35, 0.07, 4200); },
    ready() { tone(880, 0.12, 'sine', 0.1); setTimeout(() => tone(1174, 0.14, 'sine', 0.1), 90); },
    add() { tone(520, 0.09, 'triangle', 0.1, 760); },
    serve() {
      tone(523, 0.12, 'triangle', 0.12);
      setTimeout(() => tone(659, 0.12, 'triangle', 0.12), 100);
      setTimeout(() => tone(784, 0.2, 'triangle', 0.14), 200);
    },
    buzz() { tone(140, 0.22, 'sawtooth', 0.1, 90); },
    expire() { tone(320, 0.3, 'sawtooth', 0.1, 160); tone(220, 0.35, 'sawtooth', 0.08, 110); },
    levelup() {
      [523, 659, 784, 1046].forEach((freq, i) => setTimeout(() => tone(freq, 0.16, 'triangle', 0.12), i * 110));
    },
    win() {
      [523, 659, 784, 1046, 1318].forEach((freq, i) => setTimeout(() => tone(freq, 0.22, 'triangle', 0.12), i * 130));
    },
    lose() {
      [392, 330, 262, 196].forEach((freq, i) => setTimeout(() => tone(freq, 0.25, 'triangle', 0.1), i * 150));
    },
  };

  return {
    unlock() { ensureContext(); },
    setMuted(value) { muted = value; },
    isMuted() { return muted; },
    play(name) { if (sounds[name]) sounds[name](); },
  };
}
