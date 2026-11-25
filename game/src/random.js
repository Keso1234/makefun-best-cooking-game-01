// Seeded random numbers, so screenshot scenes are the same every run.
export function mulberry32(seed) {
  let value = seed >>> 0;
  return function nextRandom() {
    value = (value + 0x6d2b79f5) >>> 0;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickRandom(random, list) {
  return list[Math.floor(random() * list.length)];
}

export function shuffleCopy(random, list) {
  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
