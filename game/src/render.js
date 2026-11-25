// Drawing: the whole kitchen on one canvas — wall, order board, prep
// stations, plate station, ingredient counter, HUD and every screen.
import { PALETTE, VIEW, INGREDIENTS, RECIPE_BY_ID, formatTime } from './config.js';
import { drawIngredient, drawIngredientIcon } from './ingredients.js';
import { plateProgress, selectedOrder } from './world.js';

export function computeLayout(world) {
  const bins = INGREDIENTS.map((ing, i) => ({ id: ing.id, x: 24 + i * 208, y: 544, w: 192, h: 148 }));
  const prepSlots = [0, 1, 2].map((i) => ({ index: i, x: 24 + i * 192, y: 240, w: 176, h: 150 }));
  const tickets = world.orders.map((order, i) => ({ id: order.id, x: 24 + i * 428, y: 76, w: 400, h: 118 }));
  return {
    bins, prepSlots, tickets,
    serve: { x: 660, y: 452, w: 300, h: 58 },
    trash: { x: 950, y: 452, w: 60, h: 58 },
    mute: { x: 1204, y: 12, w: 52, h: 40 },
    start: { x: 490, y: 520, w: 300, h: 64 },
    restart: { x: 490, y: 540, w: 300, h: 64 },
    resume: { x: 490, y: 420, w: 300, h: 64 },
    plate: { x: 718, y: 243, w: 184, h: 184 },
  };
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, weight, align) {
  ctx.fillStyle = color;
  ctx.font = `${weight || 'bold'} ${size}px "Trebuchet MS", Verdana, sans-serif`;
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function drawCustomerFace(ctx, customer, x, y, r, mood) {
  circle(ctx, x, y, r, customer.skin);
  ctx.fillStyle = customer.hair;
  ctx.beginPath();
  ctx.arc(x, y - r * 0.35, r * 0.92, Math.PI * 0.95, Math.PI * 2.05);
  ctx.fill();
  ctx.fillStyle = customer.hat;
  ctx.beginPath();
  ctx.arc(x, y - r * 0.45, r * 0.95, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  roundRect(ctx, x - r * 1.05, y - r * 0.62, r * 2.1, r * 0.22, r * 0.1);
  ctx.fill();
  ctx.fillStyle = '#2e2015';
  circle(ctx, x - r * 0.35, y + r * 0.05, r * 0.09, '#2e2015');
  circle(ctx, x + r * 0.35, y + r * 0.05, r * 0.09, '#2e2015');
  ctx.strokeStyle = '#2e2015';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  if (mood === 'angry') {
    ctx.moveTo(x - r * 0.4, y + r * 0.62);
    ctx.lineTo(x + r * 0.4, y + r * 0.62);
  } else {
    ctx.arc(x, y + r * 0.28, r * 0.4, 0.15 * Math.PI, 0.85 * Math.PI);
  }
  ctx.stroke();
}

function circle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawBackground(ctx, world) {
  const grad = ctx.createLinearGradient(0, 0, 0, 720);
  grad.addColorStop(0, PALETTE.wallTop);
  grad.addColorStop(0.55, PALETTE.wallBottom);
  grad.addColorStop(0.55, '#b9833f');
  grad.addColorStop(1, '#8a5f2c');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  // Tile band.
  for (let i = 0; i < 16; i += 1) {
    ctx.fillStyle = i % 2 ? PALETTE.tileMint : PALETTE.tileCream;
    ctx.fillRect(8 + i * 80, 212, 76, 10);
  }
  // Window with sun and hills.
  ctx.fillStyle = '#bfe6f5';
  roundRect(ctx, 1080, 76, 152, 108, 10);
  ctx.fill();
  ctx.save();
  roundRect(ctx, 1080, 76, 152, 108, 10);
  ctx.clip();
  circle(ctx, 1196, 104, 18, '#ffd94d');
  ctx.fillStyle = '#7fb069';
  ctx.beginPath();
  ctx.moveTo(1080, 184);
  ctx.quadraticCurveTo(1140, 140, 1232, 184);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#7a4a21';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(1156, 76);
  ctx.lineTo(1156, 184);
  ctx.moveTo(1080, 130);
  ctx.lineTo(1232, 130);
  ctx.stroke();
  ctx.restore();
  // Hanging lamps.
  [340, 640, 940].forEach((x) => {
    ctx.strokeStyle = '#5b3a1e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 26);
    ctx.stroke();
    ctx.fillStyle = '#e14b32';
    ctx.beginPath();
    ctx.moveTo(x - 22, 30);
    ctx.lineTo(x + 22, 30);
    ctx.lineTo(x + 12, 52);
    ctx.lineTo(x - 12, 52);
    ctx.closePath();
    ctx.fill();
    circle(ctx, x, 54, 9, '#ffe98a');
  });
  // Shelf with jars.
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(24, 196, 300, 10);
  ['#e14b32', '#57b25e', '#f6c945'].forEach((color, i) => {
    ctx.fillStyle = color;
    roundRect(ctx, 48 + i * 62, 158, 40, 38, 6);
    ctx.fill();
    ctx.fillStyle = '#fff3d6';
    ctx.fillRect(48 + i * 62, 172, 40, 10);
  });
}

function drawHud(ctx, world) {
  ctx.fillStyle = 'rgba(58,36,18,0.92)';
  ctx.fillRect(0, 0, VIEW.width, 64);
  text(ctx, 'SIZZLE & SERVE', 24, 33, 24, '#ffe98a', 'bold');
  text(ctx, 'Sunny Skillet Kitchen', 272, 35, 14, '#f2e3c2', 'normal');
  text(ctx, `SCORE  ${world.score}`, 560, 33, 24, '#ffffff', 'bold');
  text(ctx, `Served ${world.served}`, 760, 33, 17, '#cfe8c0', 'bold');
  const shiftLow = world.shiftLeft <= 30 && world.screen === 'play';
  text(ctx, `⏱ ${formatTime(world.shiftLeft)}`, 900, 33, 26, shiftLow ? '#ff8fa3' : '#ffffff', 'bold');
  text(ctx, `Lv ${world.level}`, 1010, 33, 18, '#ffe98a', 'bold');
  for (let i = 0; i < 3; i += 1) {
    text(ctx, i < world.hearts ? '❤' : '♡', 1075 + i * 28, 33, 22, i < world.hearts ? '#ff6b81' : '#8a7a66', 'bold');
  }
  const layout = computeLayout(world);
  ctx.fillStyle = '#5b3a1e';
  roundRect(ctx, layout.mute.x, layout.mute.y, layout.mute.w, layout.mute.h, 8);
  ctx.fill();
  text(ctx, world.muted ? '🔇' : '🔊', layout.mute.x + 26, layout.mute.y + 21, 20, '#fff8e7', 'bold', 'center');
  if (world.combo >= 2) {
    ctx.fillStyle = '#e14b32';
    roundRect(ctx, 560, 44, 150, 18, 9);
    ctx.fill();
    text(ctx, `COMBO x${world.combo}`, 635, 53, 13, '#ffffff', 'bold', 'center');
  }
}

function drawOrderBoard(ctx, world) {
  const layout = computeLayout(world);
  if (world.orders.length === 0) {
    ctx.fillStyle = 'rgba(255,248,231,0.85)';
    roundRect(ctx, 24, 76, 1256, 118, 12);
    ctx.fill();
    text(ctx, 'No orders right now — the next customer is on their way…', 640, 135, 20, PALETTE.inkSoft, 'bold', 'center');
    return;
  }
  world.orders.forEach((order, i) => {
    const rect = layout.tickets[i];
    if (!rect) return;
    const recipe = RECIPE_BY_ID[order.recipeId];
    const selected = world.selectedOrderId === order.id;
    const urgent = order.timeLeft <= 12;
    ctx.fillStyle = selected ? '#fff8e7' : 'rgba(255,248,231,0.92)';
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 12);
    ctx.fill();
    ctx.lineWidth = selected ? 4 : 2;
    ctx.strokeStyle = urgent ? '#e14b32' : selected ? '#f2b705' : '#c98f4e';
    ctx.stroke();
    drawCustomerFace(ctx, order.customer, rect.x + 48, rect.y + 44, 32, urgent ? 'angry' : 'happy');
    text(ctx, order.customer.name, rect.x + 48, rect.y + 96, 13, PALETTE.inkSoft, 'bold', 'center');
    text(ctx, recipe.name, rect.x + 96, rect.y + 30, 21, PALETTE.ink, 'bold');
    text(ctx, `${recipe.base} pts`, rect.x + 96, rect.y + 56, 14, '#8a5a2b', 'bold');
    recipe.needs.forEach((id, j) => {
      drawIngredientIcon(ctx, id, rect.x + 116 + j * 34, rect.y + 84, 30);
    });
    const frac = Math.max(0, order.timeLeft / order.total);
    ctx.fillStyle = '#e8dcc2';
    roundRect(ctx, rect.x + 96, rect.y + 100, 280, 10, 5);
    ctx.fill();
    ctx.fillStyle = frac > 0.5 ? '#3f9e4d' : frac > 0.25 ? '#f2b705' : '#e14b32';
    roundRect(ctx, rect.x + 96, rect.y + 100, 280 * frac, 10, 5);
    ctx.fill();
    text(ctx, `${Math.ceil(order.timeLeft)}s`, rect.x + 386, rect.y + 30, 18, urgent ? '#e14b32' : PALETTE.ink, 'bold', 'right');
    if (selected) text(ctx, '▶ SERVING THIS', rect.x + 386, rect.y + 56, 11, '#b8860b', 'bold', 'right');
  });
}

function drawPrepStations(ctx, world) {
  const layout = computeLayout(world);
  text(ctx, 'PREP STATIONS — click an ingredient below, then collect it when ready', 24, 231, 13, '#fff8e7', 'bold');
  const names = ['CHOP BOARD', 'HOT PAN', 'CHOP BOARD'];
  layout.prepSlots.forEach((slot, i) => {
    const item = world.prep[i];
    ctx.fillStyle = i === 1 ? '#3a3a3a' : '#d9b078';
    roundRect(ctx, slot.x, slot.y, slot.w, slot.h, 12);
    ctx.fill();
    ctx.strokeStyle = '#7a4a21';
    ctx.lineWidth = 3;
    ctx.stroke();
    if (i === 1) {
      ctx.fillStyle = '#e14b32';
      [[-40, 0], [0, 0], [40, 0]].forEach(([dx]) => {
        ctx.beginPath();
        ctx.moveTo(slot.x + 88 + dx - 10, slot.y + 138);
        ctx.quadraticCurveTo(slot.x + 88 + dx, slot.y + 112, slot.x + 88 + dx + 10, slot.y + 138);
        ctx.closePath();
        ctx.fill();
      });
    }
    text(ctx, names[i], slot.x + 88, slot.y + 18, 12, i === 1 ? '#f2e3c2' : '#7a4a21', 'bold', 'center');
    if (!item) {
      ctx.strokeStyle = 'rgba(122,74,33,0.5)';
      ctx.setLineDash([6, 6]);
      ctx.lineWidth = 2;
      roundRect(ctx, slot.x + 28, slot.y + 38, 120, 84, 10);
      ctx.stroke();
      ctx.setLineDash([]);
      text(ctx, 'empty', slot.x + 88, slot.y + 82, 15, '#7a4a21', 'normal', 'center');
    } else {
      drawIngredient(ctx, item.ingredientId, slot.x + 88, slot.y + 78, 34, world.time);
      if (item.ready) {
        ctx.fillStyle = '#3f9e4d';
        roundRect(ctx, slot.x + 18, slot.y + 122, 140, 22, 11);
        ctx.fill();
        text(ctx, '✓ READY — click to plate!', slot.x + 88, slot.y + 133, 12, '#ffffff', 'bold', 'center');
      } else {
        const frac = Math.min(1, item.t / item.dur);
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        roundRect(ctx, slot.x + 18, slot.y + 122, 140, 12, 6);
        ctx.fill();
        ctx.fillStyle = '#f2b705';
        roundRect(ctx, slot.x + 18, slot.y + 122, 140 * frac, 12, 6);
        ctx.fill();
        text(ctx, item.prep === 'grill' ? 'sizzling…' : item.prep === 'chop' ? 'chopping…' : 'wrapping…', slot.x + 88, slot.y + 144, 11, i === 1 ? '#f2e3c2' : '#5b3a1e', 'bold', 'center');
      }
    }
  });
}

function drawPlateStation(ctx, world) {
  const layout = computeLayout(world);
  const order = selectedOrder(world);
  const progress = plateProgress(world, order);
  text(ctx, order ? `YOUR PLATE — ${RECIPE_BY_ID[order.recipeId].name}: ${progress.filled}/${progress.total} parts` : 'YOUR PLATE', 640, 231, 13, '#fff8e7', 'bold');
  ctx.fillStyle = '#c9d2d8';
  roundRect(ctx, 620, 236, 400, 200, 14);
  ctx.fill();
  ctx.strokeStyle = '#8fa0ab';
  ctx.lineWidth = 3;
  ctx.stroke();
  // Recipe slots for the selected order, in a strip at the top of the steel table.
  if (order) {
    const recipe = RECIPE_BY_ID[order.recipeId];
    const needs = {};
    recipe.needs.forEach((id) => { needs[id] = (needs[id] || 0) + 1; });
    const ids = Object.keys(needs);
    ids.forEach((id, i) => {
      const x = 648 + i * 68;
      const have = Math.min(world.plate[id] || 0, needs[id]);
      ctx.fillStyle = have >= needs[id] ? '#cfe8c0' : '#fff3d6';
      roundRect(ctx, x, 244, 60, 44, 9);
      ctx.fill();
      ctx.strokeStyle = have >= needs[id] ? '#3f9e4d' : '#c98f4e';
      ctx.lineWidth = 2;
      ctx.stroke();
      drawIngredientIcon(ctx, id, x + 20, 266, 28);
      text(ctx, `${have}/${needs[id]}`, x + 42, 266, 12, PALETTE.ink, 'bold', 'center');
    });
  }
  // Plate.
  circle(ctx, 810, 362, 72, '#ffffff');
  ctx.strokeStyle = '#d9c9a8';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(810, 362, 60, 0, Math.PI * 2);
  ctx.stroke();
  const placed = Object.entries(world.plate).flatMap(([id, count]) => Array.from({ length: count }, () => id));
  placed.forEach((id, i) => {
    const angle = (i / Math.max(1, placed.length)) * Math.PI * 2 - Math.PI / 2;
    const radius = placed.length === 1 ? 0 : 34;
    drawIngredient(ctx, id, 810 + Math.cos(angle) * radius, 362 + Math.sin(angle) * radius * 0.7, 22, 0);
  });
  if (placed.length === 0) text(ctx, 'empty plate', 810, 362, 15, '#b0a58e', 'normal', 'center');
  // Serve / trash buttons.
  const ready = order && plateProgress(world, order).filled === plateProgress(world, order).total && progress.total > 0;
  ctx.fillStyle = ready ? '#3f9e4d' : '#7a9e7a';
  roundRect(ctx, layout.serve.x, layout.serve.y, layout.serve.w, layout.serve.h, 12);
  ctx.fill();
  ctx.strokeStyle = '#2e6b38';
  ctx.lineWidth = 3;
  ctx.stroke();
  text(ctx, ready ? '🍽 SERVE  (Space)' : 'SERVE  (Space)', layout.serve.x + 150, layout.serve.y + 30, 22, '#ffffff', 'bold', 'center');
  ctx.fillStyle = '#e14b32';
  roundRect(ctx, layout.trash.x, layout.trash.y, layout.trash.w, layout.trash.h, 12);
  ctx.fill();
  text(ctx, '🗑', layout.trash.x + 30, layout.trash.y + 30, 22, '#ffffff', 'bold', 'center');
  // Right panel: combo + tips.
  ctx.fillStyle = 'rgba(255,248,231,0.92)';
  roundRect(ctx, 1040, 236, 216, 274, 12);
  ctx.fill();
  text(ctx, 'RUSH METER', 1148, 262, 14, PALETTE.ink, 'bold', 'center');
  text(ctx, `Combo x${world.combo}`, 1148, 292, 22, '#e14b32', 'bold', 'center');
  text(ctx, `Best combo x${world.bestCombo}`, 1148, 318, 13, PALETTE.inkSoft, 'normal', 'center');
  text(ctx, 'HOW TO PLAY', 1148, 352, 13, PALETTE.ink, 'bold', 'center');
  const tips = ['1–6 pick an ingredient', 'Click a ready item', 'to add it to the plate', 'Click a ticket to', 'choose that order', 'Space serves · T clears', 'P pauses · M mutes'];
  tips.forEach((line, i) => text(ctx, line, 1148, 376 + i * 18, 12, PALETTE.inkSoft, 'normal', 'center'));
}

function drawBins(ctx, world) {
  const layout = computeLayout(world);
  ctx.fillStyle = PALETTE.wood;
  roundRect(ctx, 12, 532, 1256, 176, 14);
  ctx.fill();
  ctx.fillStyle = PALETTE.counterTop;
  ctx.fillRect(12, 532, 1256, 14);
  layout.bins.forEach((bin, i) => {
    const ing = INGREDIENTS[i];
    ctx.fillStyle = '#fff8e7';
    roundRect(ctx, bin.x, bin.y, bin.w, bin.h, 12);
    ctx.fill();
    ctx.strokeStyle = '#c98f4e';
    ctx.lineWidth = 2;
    ctx.stroke();
    drawIngredient(ctx, ing.id, bin.x + 96, bin.y + 52, 36, world.time);
    text(ctx, ing.name, bin.x + 96, bin.y + 100, 18, PALETTE.ink, 'bold', 'center');
    text(ctx, ing.blurb, bin.x + 96, bin.y + 122, 12, PALETTE.inkSoft, 'normal', 'center');
    ctx.fillStyle = '#3a2412';
    circle(ctx, bin.x + 22, bin.y + 22, 13, '#3a2412');
    text(ctx, ing.key, bin.x + 22, bin.y + 23, 14, '#ffe98a', 'bold', 'center');
  });
}

function drawEffects(ctx, world) {
  for (const p of world.particles) {
    ctx.globalAlpha = Math.max(0, 1 - p.t / p.life);
    circle(ctx, p.x, p.y, p.size, p.color);
  }
  ctx.globalAlpha = 1;
  for (const f of world.floats) {
    ctx.globalAlpha = Math.max(0, 1 - f.t / 1.4);
    text(ctx, f.text, f.x, f.y - f.t * 40, 24, f.color, 'bold', 'center');
  }
  ctx.globalAlpha = 1;
  if (world.messageT > 0 && world.message) {
    const colors = { good: '#3f9e4d', warn: '#b8860b', bad: '#e14b32', info: '#3a2412' };
    ctx.fillStyle = colors[world.messageKind] || '#3a2412';
    const w = Math.min(900, ctx.measureText(world.message).width + 400);
    roundRect(ctx, 640 - 380, 668, 760, 36, 18);
    ctx.fill();
    text(ctx, world.message, 640, 687, 16, '#ffffff', 'bold', 'center');
  }
}

function drawPanel(ctx, x, y, w, h, title, lines, button, buttonLabel) {
  ctx.fillStyle = 'rgba(30,18,8,0.55)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = '#fff8e7';
  roundRect(ctx, x, y, w, h, 18);
  ctx.fill();
  ctx.strokeStyle = '#f2b705';
  ctx.lineWidth = 4;
  ctx.stroke();
  text(ctx, title, x + w / 2, y + 52, 38, PALETTE.ink, 'bold', 'center');
  lines.forEach((line, i) => text(ctx, line.text, x + w / 2, y + 110 + i * 30, line.size || 18, line.color || PALETTE.inkSoft, line.weight || 'normal', 'center'));
  if (button) {
    ctx.fillStyle = '#3f9e4d';
    roundRect(ctx, button.x, button.y, button.w, button.h, 12);
    ctx.fill();
    text(ctx, buttonLabel, button.x + button.w / 2, button.y + button.h / 2 + 1, 24, '#ffffff', 'bold', 'center');
  }
}

export function drawGame(ctx, world) {
  ctx.save();
  if (world.shake > 0) ctx.translate((Math.random() - 0.5) * world.shake * 24, (Math.random() - 0.5) * world.shake * 24);
  drawBackground(ctx, world);
  drawHud(ctx, world);
  drawOrderBoard(ctx, world);
  drawPrepStations(ctx, world);
  drawPlateStation(ctx, world);
  drawBins(ctx, world);
  drawEffects(ctx, world);
  ctx.restore();

  const layout = computeLayout(world);
  if (world.screen === 'title') {
    drawPanel(ctx, 290, 90, 700, 500, 'SIZZLE & SERVE', [
      { text: 'Sunny Skillet Kitchen — the lunch rush is on!', size: 20, color: PALETTE.ink, weight: 'bold' },
      { text: 'Customers order, you cook. Grab ingredients, prep them,', size: 17 },
      { text: 'build the dish on the plate and serve it before time runs out.', size: 17 },
      { text: 'Serve fast for speed bonuses. Chain serves for combos.', size: 17 },
      { text: 'Miss 3 orders — or run out of shift time — and the rush ends.', size: 17 },
      { text: 'Click or press 1–6 for ingredients · Space serves · P pauses', size: 16, color: '#b8860b', weight: 'bold' },
      { text: `Best score so far: ${world.best}`, size: 16, color: '#3f9e4d', weight: 'bold' },
    ], layout.start, '▶  START SHIFT');
  } else if (world.screen === 'pause') {
    drawPanel(ctx, 390, 150, 500, 330, 'PAUSED', [
      { text: 'Take a breath, chef. The stoves are holding.', size: 18 },
      { text: `Score ${world.score} · Served ${world.served} · Combo x${world.combo}`, size: 17, color: PALETTE.ink, weight: 'bold' },
    ], layout.resume, '▶  RESUME  (P)');
  } else if (world.screen === 'over') {
    const target = 600;
    const title = world.won ? '🎉 SHIFT COMPLETE!' : world.hearts <= 0 ? '😢 RUSH OVER' : '⏰ SHIFT OVER';
    drawPanel(ctx, 290, 90, 700, 500, title, [
      { text: world.won ? 'You beat the lunch rush — the kitchen loves you!' : world.score >= target ? 'Great cooking! Just short of a clean shift.' : 'The rush got the better of the kitchen today.', size: 18, color: PALETTE.ink, weight: 'bold' },
      { text: `Final score: ${world.score}`, size: 26, color: PALETTE.ink, weight: 'bold' },
      { text: `Dishes served: ${world.served}   ·   Orders missed: ${world.missed}`, size: 18 },
      { text: `Best combo: x${world.bestCombo}   ·   Level reached: ${world.level}`, size: 18 },
      { text: `Best score: ${Math.max(world.best, world.score)}`, size: 17, color: '#3f9e4d', weight: 'bold' },
      { text: 'Press R or click below to cook again.', size: 16, color: '#b8860b', weight: 'bold' },
    ], layout.restart, '↻  COOK AGAIN  (R)');
  }
}
