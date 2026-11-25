// Screenshot scenes: each one stages the real game state deterministically
// (fixed seed, fixed orders, plate and prep), so a screenshot is a frame of
// the game itself, not a mock-up. Names: title, play, serve, rush.
import { CUSTOMERS, RECIPES } from './config.js';
import { createWorld, startShift } from './world.js';

function makeOrder(world, recipeId, timeLeft, total, customerIndex) {
  const recipe = RECIPES.find((r) => r.id === recipeId);
  return {
    id: 100 + customerIndex,
    recipeId: recipe.id,
    timeLeft,
    total,
    customer: CUSTOMERS[customerIndex % CUSTOMERS.length],
    born: 0,
  };
}

function basePlay(world, score, served, combo, level, shiftLeft) {
  startShift(world);
  world.score = score;
  world.served = served;
  world.combo = combo;
  world.bestCombo = combo;
  world.level = level;
  world.shiftLeft = shiftLeft;
  world.message = '';
  world.messageT = 0;
  world.particles = [];
  world.floats = [];
}

// Stage `world` into the named scene and return the screen to show.
export function stageShot(name, world) {
  if (name === 'title') {
    basePlay(world, 0, 0, 0, 1, 150);
    world.orders = [
      makeOrder(world, 'sunny-burger', 48, 55, 0),
      makeOrder(world, 'garden-salad', 38, 55, 1),
    ];
    world.selectedOrderId = world.orders[0].id;
    world.screen = 'title';
    return world;
  }
  if (name === 'serve') {
    basePlay(world, 560, 5, 5, 2, 96);
    world.orders = [makeOrder(world, 'sunny-burger', 41, 46, 2)];
    world.selectedOrderId = world.orders[0].id;
    world.plate = { bun: 1, patty: 1, cheese: 1, lettuce: 1, tomato: 1 };
    world.prep = [null, null, null];
    world.floats = [{ x: 810, y: 300, text: 'READY TO SERVE!', t: 0.2, color: '#3f9e4d' }];
    world.screen = 'play';
    return world;
  }
  if (name === 'rush') {
    basePlay(world, 890, 11, 7, 3, 42);
    world.orders = [
      makeOrder(world, 'double-stack', 8, 40, 3),
      makeOrder(world, 'cheesy-omelette', 22, 40, 4),
      makeOrder(world, 'garden-salad', 31, 40, 5),
    ];
    world.selectedOrderId = world.orders[0].id;
    world.plate = { bun: 1, patty: 2, cheese: 1 };
    world.prep = [
      { ingredientId: 'tomato', t: 0.9, dur: 1.2, ready: false, prep: 'chop' },
      { ingredientId: 'egg', t: 2.2, dur: 2.2, ready: true, prep: 'grill' },
      null,
    ];
    world.screen = 'play';
    return world;
  }
  // Default: play — one dish mid-assembly.
  basePlay(world, 340, 3, 3, 2, 118);
  world.orders = [
    makeOrder(world, 'sunny-burger', 32, 46, 0),
    makeOrder(world, 'sunny-bunwich', 44, 46, 1),
  ];
  world.selectedOrderId = world.orders[0].id;
  world.plate = { bun: 1, cheese: 1 };
  world.prep = [
    { ingredientId: 'lettuce', t: 1.0, dur: 1.0, ready: true, prep: 'chop' },
    { ingredientId: 'patty', t: 1.8, dur: 3.0, ready: false, prep: 'grill' },
    null,
  ];
  world.screen = 'play';
  return world;
}

export function createShotWorld(name, seed) {
  const world = createWorld(seed || 7);
  return stageShot(name, world);
}
