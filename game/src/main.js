// Sizzle & Serve — boot, game loop and screenshot mode.
// ?shot=title|play|serve|rush&seed=7 renders one staged frame for screenshots.
import { VIEW } from './config.js';
import { createSoundEngine } from './audio.js';
import { createWorld, startShift, tick } from './world.js';
import { drawGame } from './render.js';
import { attachInput } from './input.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = VIEW.width;
canvas.height = VIEW.height;

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const seed = Number(params.get('seed') || 7) || 7;

const world = createWorld(seed);
const sound = createSoundEngine();
attachInput(canvas, world, sound);

if (shotName) {
  stageShot(shotName, world);
} else {
  // A live kitchen hums behind the title panel.
  startShift(world);
  world.screen = 'title';
  world.message = '';
  world.messageT = 0;
}

let lastTime = performance.now();

function frame(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  if (!shotName) {
    const sounds = tick(world, dt);
    for (const name of sounds) sound.play(name);
  }
  drawGame(ctx, world);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);

// Exposed for play-testing in the browser console.
window.__game = { world, sound };
