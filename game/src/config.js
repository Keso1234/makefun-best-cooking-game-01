// Sizzle & Serve — configuration: view, palette, ingredients, recipes and rules.
// One clear job: every number the rest of the game tunes lives here.
export const VIEW = { width: 1280, height: 720 };

export const PALETTE = {
  wallTop: '#f7c873',
  wallBottom: '#e8a94e',
  tileCream: '#fff3d6',
  tileMint: '#cfe8c0',
  woodDark: '#7a4a21',
  wood: '#a06a35',
  woodLight: '#c98f4e',
  steel: '#c9d2d8',
  steelDark: '#8fa0ab',
  counterTop: '#f2e3c2',
  ink: '#3a2412',
  inkSoft: '#6b4a2a',
  cream: '#fff8e7',
  red: '#e14b32',
  green: '#3f9e4d',
  gold: '#f2b705',
  pink: '#ff8fa3',
  blue: '#4a90d9',
};

export const SHIFT_SECONDS = 150;
export const MAX_HEARTS = 3;
export const MAX_ORDERS = 3;
export const PREP_SLOTS = 3;
export const COMBO_TIP = 8;

// Ingredients: prep is what the ingredient needs before it can go on a plate.
// chop = chopping board, grill = hot pan, wrap = ready almost at once.
export const INGREDIENTS = [
  { id: 'bun', name: 'Bun', key: '1', prep: 'wrap', prepTime: 0.5, color: '#e8b25e', blurb: 'soft + ready' },
  { id: 'patty', name: 'Patty', key: '2', prep: 'grill', prepTime: 3.0, color: '#8a5a2b', blurb: 'grill 3s' },
  { id: 'cheese', name: 'Cheese', key: '3', prep: 'wrap', prepTime: 0.5, color: '#f6c945', blurb: 'soft + ready' },
  { id: 'tomato', name: 'Tomato', key: '4', prep: 'chop', prepTime: 1.2, color: '#e14b32', blurb: 'chop 1s' },
  { id: 'lettuce', name: 'Lettuce', key: '5', prep: 'chop', prepTime: 1.0, color: '#57b25e', blurb: 'chop 1s' },
  { id: 'egg', name: 'Egg', key: '6', prep: 'grill', prepTime: 2.2, color: '#ffd94d', blurb: 'fry 2s' },
];

export const INGREDIENT_BY_ID = Object.fromEntries(INGREDIENTS.map((item) => [item.id, item]));

// Recipes: the dishes customers order. A list, so a dish can ask for two patties.
export const RECIPES = [
  { id: 'sunny-burger', name: 'Sunny Burger', needs: ['bun', 'patty', 'cheese', 'lettuce', 'tomato'], base: 120, color: '#e8a94e' },
  { id: 'garden-salad', name: 'Garden Salad', needs: ['lettuce', 'tomato', 'cheese'], base: 70, color: '#57b25e' },
  { id: 'cheesy-omelette', name: 'Cheesy Omelette', needs: ['egg', 'cheese', 'tomato'], base: 90, color: '#f6c945' },
  { id: 'sunny-bunwich', name: 'Sunny Bunwich', needs: ['bun', 'egg', 'cheese', 'lettuce'], base: 100, color: '#f2b705' },
  { id: 'double-stack', name: 'Double Stack', needs: ['bun', 'patty', 'patty', 'cheese', 'tomato'], base: 160, color: '#8a5a2b' },
  { id: 'veggie-plate', name: 'Veggie Plate', needs: ['lettuce', 'tomato', 'egg', 'cheese'], base: 95, color: '#7fb069' },
];

export const RECIPE_BY_ID = Object.fromEntries(RECIPES.map((item) => [item.id, item]));

// Customers: original faces, each with a name, a hat colour and a skin tone.
export const CUSTOMERS = [
  { name: 'Mara', hat: '#e14b32', skin: '#f2c89b', hair: '#5b3a1e' },
  { name: 'Theo', hat: '#4a90d9', skin: '#e8b88a', hair: '#2e2e2e' },
  { name: 'June', hat: '#3f9e4d', skin: '#f7d7b0', hair: '#8a5a2b' },
  { name: 'Kiko', hat: '#f2b705', skin: '#d9a06b', hair: '#1f1f1f' },
  { name: 'Ana', hat: '#ff8fa3', skin: '#f2c89b', hair: '#6b3a1e' },
  { name: 'Bram', hat: '#7a4a21', skin: '#e8b88a', hair: '#3a2a1a' },
];

// Level table: served count -> level, order time and spawn gap.
export function levelFor(served) {
  if (served >= 15) return { level: 4, orderTime: 34, spawnGap: 7 };
  if (served >= 10) return { level: 3, orderTime: 40, spawnGap: 9 };
  if (served >= 5) return { level: 2, orderTime: 46, spawnGap: 11 };
  return { level: 1, orderTime: 55, spawnGap: 14 };
}

export function formatTime(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}
