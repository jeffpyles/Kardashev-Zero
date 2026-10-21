// Seeded randomness and smooth noise, so a world seed always makes the same map.

/** mulberry32: small, fast, good enough for game generation. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Value noise on a lattice, smoothed and summed over octaves. Returns 0..1. */
export function noise2d(seed: number, width: number, height: number, scale: number, octaves = 4): number[] {
  const out = new Array<number>(width * height).fill(0);
  let amplitude = 1;
  let total = 0;
  for (let o = 0; o < octaves; o++) {
    const cell = Math.max(1, scale / 2 ** o);
    const gw = Math.ceil(width / cell) + 2;
    const gh = Math.ceil(height / cell) + 2;
    const next = rng(seed + o * 1013);
    const grid = Array.from({ length: gw * gh }, () => next());
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const gx = x / cell;
        const gy = y / cell;
        const x0 = Math.floor(gx);
        const y0 = Math.floor(gy);
        const sx = smooth(gx - x0);
        const sy = smooth(gy - y0);
        const v00 = grid[y0 * gw + x0]!;
        const v10 = grid[y0 * gw + x0 + 1]!;
        const v01 = grid[(y0 + 1) * gw + x0]!;
        const v11 = grid[(y0 + 1) * gw + x0 + 1]!;
        const v = lerp(lerp(v00, v10, sx), lerp(v01, v11, sx), sy);
        out[y * width + x]! += v * amplitude;
      }
    }
    total += amplitude;
    amplitude /= 2;
  }
  return out.map((v) => v / total);
}

function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
