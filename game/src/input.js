// Input: mouse clicks and keyboard, mapped onto the layout render.js draws.
// Every click does exactly one game action and asks audio to answer at once.
import { INGREDIENTS } from './config.js';
import { computeLayout } from './render.js';
import {
  clearPlate, collectPrep, selectOrder, servePlate, startPrep, startShift,
  togglePause,
} from './world.js';

function inside(x, y, rect) {
  return rect && x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

export function attachInput(canvas, world, sound) {
  function toGameCoords(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * 1280,
      y: ((event.clientY - rect.top) / rect.height) * 720,
    };
  }

  function playSound(name) {
    if (name) sound.play(name);
  }

  function handleClick(x, y) {
    sound.unlock();
    const layout = computeLayout(world);
    if (inside(x, y, layout.mute)) {
      world.muted = !world.muted;
      sound.setMuted(world.muted);
      return;
    }
    if (world.screen === 'title') {
      if (inside(x, y, layout.start)) { startShift(world); playSound('serve'); }
      return;
    }
    if (world.screen === 'over') {
      if (inside(x, y, layout.restart)) { startShift(world); playSound('serve'); }
      return;
    }
    if (world.screen === 'pause') {
      if (inside(x, y, layout.resume)) { togglePause(world); playSound('click'); }
      return;
    }
    if (world.screen !== 'play') return;
    for (const ticket of layout.tickets) {
      if (inside(x, y, ticket)) { selectOrder(world, ticket.id); playSound('click'); return; }
    }
    for (const slot of layout.prepSlots) {
      if (inside(x, y, slot)) {
        const result = collectPrep(world, slot.index);
        playSound(result.sound);
        return;
      }
    }
    if (inside(x, y, layout.serve)) {
      const result = servePlate(world);
      playSound(result.sound);
      return;
    }
    if (inside(x, y, layout.trash)) {
      if (clearPlate(world)) playSound('click');
      return;
    }
    for (const bin of layout.bins) {
      if (inside(x, y, bin)) {
        const result = startPrep(world, bin.id);
        playSound(result.sound);
        return;
      }
    }
  }

  canvas.addEventListener('pointerdown', (event) => {
    const pos = toGameCoords(event);
    handleClick(pos.x, pos.y);
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key === 'm') {
      world.muted = !world.muted;
      sound.setMuted(world.muted);
      return;
    }
    if (world.screen === 'title' && (key === 'enter' || key === ' ')) {
      sound.unlock();
      startShift(world);
      playSound('serve');
      return;
    }
    if (world.screen === 'over' && (key === 'r' || key === 'enter')) {
      startShift(world);
      playSound('serve');
      return;
    }
    if (key === 'p' || key === 'escape') {
      if (togglePause(world)) playSound('click');
      return;
    }
    if (world.screen !== 'play') return;
    if (key === ' ') {
      event.preventDefault();
      const result = servePlate(world);
      playSound(result.sound);
      return;
    }
    if (key === 't') {
      if (clearPlate(world)) playSound('click');
      return;
    }
    const byKey = INGREDIENTS.find((ing) => ing.key === key);
    if (byKey) {
      const result = startPrep(world, byKey.id);
      playSound(result.sound);
    }
  });
}
