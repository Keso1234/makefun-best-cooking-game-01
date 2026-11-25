// Ingredient art: every dish is drawn in code from canvas shapes — no images.
import { INGREDIENT_BY_ID } from './config.js';

function circle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

// Draw one ingredient centred at (x, y) with radius r. `wobble` animates steam/cook.
export function drawIngredient(ctx, id, x, y, r, wobble) {
  const w = wobble || 0;
  ctx.save();
  ctx.translate(x, y);
  if (id === 'bun') {
    ellipse(ctx, 0, r * 0.35, r, r * 0.42, '#c98a3a');
    ctx.fillStyle = '#eec27a';
    ctx.beginPath();
    ctx.arc(0, r * 0.1, r * 0.92, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff3d6';
    [[-0.45, -0.35], [0, -0.55], [0.45, -0.35], [-0.2, -0.15], [0.25, -0.15]].forEach(([dx, dy]) => {
      ellipse(ctx, dx * r, dy * r, r * 0.09, r * 0.06, '#fff3d6');
    });
  } else if (id === 'patty') {
    ellipse(ctx, 0, 0, r, r * 0.55, '#5e3a17');
    ellipse(ctx, 0, -r * 0.12, r * 0.92, r * 0.42, '#8a5a2b');
    ctx.strokeStyle = '#5e3a17';
    ctx.lineWidth = Math.max(2, r * 0.08);
    [-0.5, 0, 0.5].forEach((dx) => {
      ctx.beginPath();
      ctx.moveTo(dx * r, -r * 0.4);
      ctx.lineTo(dx * r, r * 0.28);
      ctx.stroke();
    });
  } else if (id === 'cheese') {
    ctx.fillStyle = '#f6c945';
    ctx.beginPath();
    ctx.moveTo(-r, r * 0.7);
    ctx.lineTo(r, r * 0.7);
    ctx.lineTo(r * 0.55, -r * 0.7);
    ctx.lineTo(-r * 0.55, -r * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e8a91c';
    circle(ctx, -r * 0.3, r * 0.25, r * 0.14, '#e8a91c');
    circle(ctx, r * 0.25, -r * 0.1, r * 0.12, '#e8a91c');
    circle(ctx, r * 0.05, r * 0.45, r * 0.1, '#e8a91c');
  } else if (id === 'tomato') {
    circle(ctx, 0, r * 0.08, r * 0.9, '#e14b32');
    circle(ctx, -r * 0.3, -r * 0.25, r * 0.35, '#ef6a4d');
    ctx.fillStyle = '#3f9e4d';
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.55);
    ctx.lineTo(-r * 0.45, -r * 0.95);
    ctx.lineTo(0, -r * 0.75);
    ctx.lineTo(r * 0.45, -r * 0.95);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#3f9e4d';
    ctx.lineWidth = Math.max(2, r * 0.09);
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.7);
    ctx.quadraticCurveTo(r * 0.15, -r * 1.1, r * 0.35, -r * 1.05);
    ctx.stroke();
  } else if (id === 'lettuce') {
    ctx.fillStyle = '#3f9e4d';
    for (let i = 0; i < 5; i += 1) {
      const a = (i / 5) * Math.PI * 2 + w * 0.1;
      circle(ctx, Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.5, r * 0.5, i % 2 ? '#57b25e' : '#7ccb6f');
    }
    circle(ctx, 0, 0, r * 0.55, '#8fd07f');
    ctx.strokeStyle = '#3f9e4d';
    ctx.lineWidth = Math.max(2, r * 0.07);
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.4);
    ctx.lineTo(0, r * 0.4);
    ctx.stroke();
  } else if (id === 'egg') {
    ctx.fillStyle = '#fff8e7';
    ctx.beginPath();
    ctx.ellipse(0, 0, r, r * 0.78, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d9c9a8';
    ctx.lineWidth = Math.max(2, r * 0.07);
    ctx.stroke();
    ctx.fillStyle = '#ffd94d';
    circle(ctx, r * 0.1, 0, r * 0.48, '#ffd94d');
    circle(ctx, -r * 0.05, -r * 0.12, r * 0.2, '#ffe98a');
  }
  ctx.restore();
}

// Small flat icon used on tickets and recipe slots.
export function drawIngredientIcon(ctx, id, x, y, size) {
  drawIngredient(ctx, id, x, y, size / 2, 0);
}

export function ingredientName(id) {
  return (INGREDIENT_BY_ID[id] || { name: id }).name;
}
