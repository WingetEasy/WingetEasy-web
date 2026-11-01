/** Shared noise + dithering helpers for the pixel canvases. */

export function hash(x: number, y: number, seed: number) {
  let h = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}

export function smooth(t: number) {
  return t * t * (3 - 2 * t);
}

export function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

export function valueNoise(x: number, y: number, seed: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = smooth(x - xi);
  const yf = smooth(y - yi);
  const a = hash(xi, yi, seed);
  const b = hash(xi + 1, yi, seed);
  const c = hash(xi, yi + 1, seed);
  const d = hash(xi + 1, yi + 1, seed);
  return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
}

export function fbm(x: number, y: number, seed: number, octaves = 5) {
  let v = 0;
  let amp = 0.5;
  let f = 1;
  for (let i = 0; i < octaves; i++) {
    v += amp * valueNoise(x * f, y * f, seed + i * 17);
    f *= 2.03;
    amp *= 0.5;
  }
  return v;
}

export const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
].map((row) => row.map((v) => (v + 0.5) / 16));

export function readPixelTokens() {
  if (typeof document === 'undefined') {
    return {
      levels: ['oklch(0.27 0.07 282)', 'oklch(0.35 0.11 281)', 'oklch(0.43 0.14 280)', 'oklch(0.53 0.15 284)', 'oklch(0.66 0.13 276)'],
      dot: 'oklch(0.38 0.01 280)',
      spark: 'oklch(0.74 0.17 50)',
    };
  }
  const styles = getComputedStyle(document.documentElement);
  const token = (name: string) => styles.getPropertyValue(name).trim();
  return {
    levels: [1, 2, 3, 4, 5].map((i) => token(`--nebula-${i}`) || 'transparent'),
    dot: token('--nebula-dot') || '#5c5852',
    spark: token('--spark') || '#f59e0b',
  };
}

/** Runs `onChange(true|false)` as the element enters/leaves the viewport. */
export function watchVisibility(el: Element, onChange: (visible: boolean) => void) {
  if (typeof IntersectionObserver === 'undefined') {
    onChange(true);
    return () => {};
  }
  const io = new IntersectionObserver(([entry]) => onChange(!!entry?.isIntersecting), { rootMargin: '100px' });
  io.observe(el);
  return () => io.disconnect();
}

