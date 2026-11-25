// Game state and rules: orders, prep stations, the plate, scoring, levels,
// the shift timer and game over. No drawing here — render.js does that.
import {
  CUSTOMERS, INGREDIENTS, INGREDIENT_BY_ID, MAX_HEARTS, MAX_ORDERS,
  PREP_SLOTS, RECIPES, RECIPE_BY_ID, SHIFT_SECONDS, COMBO_TIP, levelFor,
} from './config.js';
import { mulberry32, pickRandom } from './random.js';

let nextOrderId = 1;
let nextCustomer = 0;

export function createWorld(seed) {
  const random = mulberry32(seed || 20261125);
  const world = {
    random,
    screen: 'title',
    time: 0,
    shiftLeft: SHIFT_SECONDS,
    score: 0,
    served: 0,
    missed: 0,
    hearts: MAX_HEARTS,
    combo: 0,
    bestCombo: 0,
    level: 1,
    orders: [],
    selectedOrderId: null,
    prep: Array.from({ length: PREP_SLOTS }, () => null),
    plate: {},
    message: '',
    messageT: 0,
    messageKind: 'info',
    particles: [],
    floats: [],
    shake: 0,
    spawnT: 2,
    muted: false,
    best: 0,
    won: false,
    demo: false,
  };
  return world;
}

function recipeNeeds(recipe) {
  const counts = {};
  recipe.needs.forEach((id) => { counts[id] = (counts[id] || 0) + 1; });
  return counts;
}

export function plateMatchesOrder(world, order) {
  if (!order) return false;
  const needs = recipeNeeds(RECIPE_BY_ID[order.recipeId]);
  const keys = new Set([...Object.keys(needs), ...Object.keys(world.plate)]);
  for (const key of keys) {
    if ((world.plate[key] || 0) !== (needs[key] || 0)) return false;
  }
  return true;
}

export function plateProgress(world, order) {
  if (!order) return { filled: 0, total: 0 };
  const needs = recipeNeeds(RECIPE_BY_ID[order.recipeId]);
  let filled = 0;
  let total = 0;
  for (const [id, count] of Object.entries(needs)) {
    total += count;
    filled += Math.min(world.plate[id] || 0, count);
  }
  return { filled, total };
}

function spawnOrder(world) {
  const info = levelFor(world.served);
  const recipe = pickRandom(world.random, RECIPES);
  const customer = CUSTOMERS[nextCustomer % CUSTOMERS.length];
  nextCustomer += 1;
  const order = {
    id: nextOrderId,
    recipeId: recipe.id,
    timeLeft: info.orderTime,
    total: info.orderTime,
    customer,
    born: world.time,
  };
  nextOrderId += 1;
  world.orders.push(order);
  if (!world.selectedOrderId) world.selectedOrderId = order.id;
  return order;
}

export function selectedOrder(world) {
  return world.orders.find((o) => o.id === world.selectedOrderId) || world.orders[0] || null;
}

export function startShift(world) {
  world.screen = 'play';
  world.time = 0;
  world.shiftLeft = SHIFT_SECONDS;
  world.score = 0;
  world.served = 0;
  world.missed = 0;
  world.hearts = MAX_HEARTS;
  world.combo = 0;
  world.bestCombo = 0;
  world.level = 1;
  world.orders = [];
  world.selectedOrderId = null;
  world.prep = Array.from({ length: PREP_SLOTS }, () => null);
  world.plate = {};
  world.particles = [];
  world.floats = [];
  world.spawnT = 1.2;
  world.won = false;
  world.message = 'Shift started — first order coming up!';
  world.messageT = 3;
  world.messageKind = 'info';
  spawnOrder(world);
  spawnOrder(world);
}

export function selectOrder(world, orderId) {
  if (world.orders.some((o) => o.id === orderId)) {
    world.selectedOrderId = orderId;
    return true;
  }
  return false;
}

export function startPrep(world, ingredientId) {
  if (world.screen !== 'play') return { ok: false, reason: 'not-playing' };
  const ingredient = INGREDIENT_BY_ID[ingredientId];
  if (!ingredient) return { ok: false, reason: 'unknown' };
  // Each prep station has a job: chop boards (slots 0 and 2), hot pan (slot 1).
  // An ingredient first tries a station of its own kind, then any free one.
  const slotTypes = ['chop', 'grill', 'chop'];
  let slot = world.prep.findIndex((item, i) => item === null && slotTypes[i] === ingredient.prep);
  if (slot === -1) slot = world.prep.findIndex((item) => item === null);
  if (slot === -1) {
    world.message = 'Prep stations full — collect a ready item first!';
    world.messageT = 2;
    world.messageKind = 'warn';
    return { ok: false, reason: 'full', sound: 'buzz' };
  }
  world.prep[slot] = { ingredientId, t: 0, dur: ingredient.prepTime, ready: false, prep: ingredient.prep };
  if (ingredient.prep === 'grill') return { ok: true, sound: 'sizzle' };
  if (ingredient.prep === 'chop') return { ok: true, sound: 'chop' };
  return { ok: true, sound: 'click' };
}

export function collectPrep(world, slotIndex) {
  if (world.screen !== 'play') return { ok: false };
  const item = world.prep[slotIndex];
  if (!item || !item.ready) return { ok: false, reason: 'not-ready', sound: item ? 'buzz' : null };
  const order = selectedOrder(world);
  const needs = order ? recipeNeeds(RECIPE_BY_ID[order.recipeId]) : null;
  const wanted = needs ? (needs[item.ingredientId] || 0) : 99;
  const onPlate = world.plate[item.ingredientId] || 0;
  world.prep[slotIndex] = null;
  world.plate[item.ingredientId] = onPlate + 1;
  if (order && onPlate + 1 > wanted) {
    world.message = `${INGREDIENT_BY_ID[item.ingredientId].name} is not in this dish — trash the plate to fix it.`;
    world.messageT = 2.5;
    world.messageKind = 'warn';
    return { ok: true, sound: 'buzz', extra: true };
  }
  return { ok: true, sound: 'add' };
}

export function clearPlate(world) {
  if (Object.keys(world.plate).length === 0) return false;
  world.plate = {};
  world.message = 'Plate cleared.';
  world.messageT = 1.5;
  world.messageKind = 'info';
  return true;
}

export function servePlate(world) {
  if (world.screen !== 'play') return { ok: false };
  const order = selectedOrder(world);
  if (!order) return { ok: false, reason: 'no-order', sound: 'buzz' };
  if (!plateMatchesOrder(world, order)) {
    const progress = plateProgress(world, order);
    world.combo = 0;
    world.shake = 0.35;
    world.message = `Not yet — ${RECIPE_BY_ID[order.recipeId].name} needs ${progress.filled}/${progress.total} parts.`;
    world.messageT = 2.5;
    world.messageKind = 'warn';
    return { ok: false, reason: 'incomplete', sound: 'buzz' };
  }
  const recipe = RECIPE_BY_ID[order.recipeId];
  const timeBonus = Math.round((order.timeLeft / order.total) * 60);
  const comboBonus = world.combo * COMBO_TIP;
  const points = recipe.base + timeBonus + comboBonus;
  world.score += points;
  world.served += 1;
  world.combo += 1;
  world.bestCombo = Math.max(world.bestCombo, world.combo);
  world.orders = world.orders.filter((o) => o.id !== order.id);
  world.selectedOrderId = world.orders[0] ? world.orders[0].id : null;
  world.plate = {};
  world.floats.push({ x: 810, y: 300, text: `+${points}`, t: 0, color: '#3f9e4d' });
  if (world.combo >= 3) world.floats.push({ x: 810, y: 340, text: `COMBO x${world.combo}!`, t: 0, color: '#e14b32' });
  for (let i = 0; i < 18; i += 1) {
    world.particles.push({
      x: 810 + (world.random() - 0.5) * 160, y: 330 + (world.random() - 0.5) * 80,
      vx: (world.random() - 0.5) * 160, vy: -60 - world.random() * 120,
      t: 0, life: 0.7 + world.random() * 0.5, color: ['#f2b705', '#ff8fa3', '#57b25e', '#fff3d6'][i % 4], size: 3 + world.random() * 4,
    });
  }
  const info = levelFor(world.served);
  const levelled = info.level > world.level;
  world.level = info.level;
  world.message = `Served! ${recipe.name} +${points} (${recipe.base} dish + ${timeBonus} speed${comboBonus ? ` + ${comboBonus} combo` : ''})`;
  world.messageT = 3;
  world.messageKind = 'good';
  return { ok: true, sound: levelled ? 'levelup' : 'serve', levelled };
}

function expireOrder(world, order) {
  world.orders = world.orders.filter((o) => o.id !== order.id);
  world.missed += 1;
  world.hearts -= 1;
  world.combo = 0;
  if (world.selectedOrderId === order.id) world.selectedOrderId = world.orders[0] ? world.orders[0].id : null;
  world.floats.push({ x: 640, y: 150, text: `${order.customer.name} walked out!`, t: 0, color: '#e14b32' });
  world.message = `${order.customer.name} left hungry — an order expired.`;
  world.messageT = 3;
  world.messageKind = 'bad';
  return { sound: 'expire' };
}

// Advance the simulation by dt seconds. Returns sound names to play.
export function tick(world, dt) {
  const sounds = [];
  if (world.screen !== 'play') return sounds;
  world.time += dt;
  world.shiftLeft -= dt;
  if (world.messageT > 0) world.messageT -= dt;
  if (world.shake > 0) world.shake -= dt;

  for (const item of world.prep) {
    if (item && !item.ready) {
      item.t += dt;
      if (item.t >= item.dur) {
        item.ready = true;
        sounds.push('ready');
      }
    }
  }
  for (const order of world.orders.slice()) {
    order.timeLeft -= dt;
    if (order.timeLeft <= 0) sounds.push(expireOrder(world, order).sound);
  }
  if (world.hearts <= 0) {
    endShift(world, false);
    sounds.push('lose');
    return sounds;
  }
  if (world.shiftLeft <= 0) {
    endShift(world, true);
    sounds.push(world.score >= 600 ? 'win' : 'lose');
    return sounds;
  }
  world.spawnT -= dt;
  if (world.spawnT <= 0 && world.orders.length < MAX_ORDERS) {
    spawnOrder(world);
    world.spawnT = levelFor(world.served).spawnGap;
  }
  for (const p of world.particles) {
    p.t += dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 220 * dt;
  }
  world.particles = world.particles.filter((p) => p.t < p.life);
  for (const f of world.floats) f.t += dt;
  world.floats = world.floats.filter((f) => f.t < 1.4);
  return sounds;
}

function endShift(world, finishedShift) {
  world.screen = 'over';
  world.won = finishedShift && world.score >= 600;
  world.best = Math.max(world.best, world.score);
  world.message = '';
  world.messageT = 0;
}

export function togglePause(world) {
  if (world.screen === 'play') { world.screen = 'pause'; return true; }
  if (world.screen === 'pause') { world.screen = 'play'; return true; }
  return false;
}

export { INGREDIENTS, RECIPES };
