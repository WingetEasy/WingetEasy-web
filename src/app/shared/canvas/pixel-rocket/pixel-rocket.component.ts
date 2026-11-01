/**
 * ==============================================================================
 * FOGUETE EM PIXELS DITHERED (pixel-rocket.component.ts)
 * ==============================================================================
 * O que é:
 *   Efeito de canvas interativo para a tela 404 (Not Found): um foguete pixelado
 *   flutuando pelo espaço sideral com rastro de partículas incandescentes,
 *   estrelas com paralaxe e um planeta com anéis ao fundo.
 *
 * O que faz:
 *   - Desenha estrelas com profundidade e movimento oposto ao foguete.
 *   - Renderiza um planeta anelado com dithering Bayer 4x4.
 *   - Anima o foguete pixel-art rotacionando suavemente com física de partículas no motor.
 *   - Totalmente compatível com SSR (executado via `afterNextRender`).
 */

import { Component, ElementRef, viewChild, afterNextRender, input, OnDestroy } from '@angular/core';
import { BAYER, clamp01, fbm, hash, readPixelTokens, watchVisibility } from '../pixel-noise';

const SPRITE = [
  '.....1.....',
  '....121....',
  '...12221...',
  '...12221...',
  '..1233321..',
  '..1234321..',
  '..1233321..',
  '..1222221..',
  '..1222221..',
  '.112222211.',
  '11122222111',
  '11.12221.11',
  '1...111...1',
];

type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number };

@Component({
  selector: 'app-pixel-rocket',
  standalone: true,
  template: `<canvas #canvas aria-hidden="true" [class]="class()"></canvas>`,
})
export class PixelRocketComponent implements OnDestroy {
  canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  class = input<string>('block w-full h-full pointer-events-none');

  private cleanup?: () => void;

  constructor() {
    afterNextRender(() => {
      this.initCanvas();
    });
  }

  ngOnDestroy() {
    if (this.cleanup) {
      this.cleanup();
    }
  }

  private initCanvas() {
    const canvas = this.canvasRef().nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { levels, dot, spark } = readPixelTokens();
    const fg = (typeof document !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim() : '') || dot;
    const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const C = 4;
    const planet = document.createElement('canvas');

    let w = 1;
    let h = 1;
    let raf = 0;
    let last = 0;
    let particles: Particle[] = [];
    let stars: { x: number; y: number; depth: number; ph: number }[] = [];

    const snap = (v: number) => Math.round(v / C) * C;

    const buildPlanet = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      planet.width = w * dpr;
      planet.height = h * dpr;
      const p = planet.getContext('2d');
      if (!p) return;
      p.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cols = Math.ceil(w / C);
      const rows = Math.ceil(h / C);
      const r = Math.min(cols, rows) * (w < 640 ? 0.28 : 0.2);
      const cx = cols * (w < 640 ? 0.2 : 0.14);
      const cy = rows * 0.86;
      const tilt = -0.32;
      for (let gy = 0; gy < rows; gy++) {
        for (let gx = 0; gx < cols; gx++) {
          const dx = (gx - cx) / r;
          const dy = (gy - cy) / r;
          const t = BAYER[gy % 4]?.[gx % 4] ?? 0.5;
          const rx = dx * Math.cos(tilt) - dy * Math.sin(tilt);
          const ry = (dx * Math.sin(tilt) + dy * Math.cos(tilt)) / 0.22;
          const rd = Math.sqrt(rx * rx + ry * ry);
          const onRing = rd > 1.35 && rd < 2.05;
          const d2 = dx * dx + dy * dy;
          const ringFront = onRing && ry > 0;
          if (d2 <= 1 && !ringFront) {
            const z = Math.sqrt(1 - d2);
            const light = clamp01(dx * 0.55 - dy * 0.65 + z * 0.4);
            const bands = fbm(dy * 5 + 3, dx * 1.2, 23, 3);
            const v = light * (0.5 + bands * 0.8);
            if (v > 0.08 + t * 0.25) {
              p.fillStyle = levels[Math.min(4, Math.floor(v * 4.5))] ?? dot;
              p.globalAlpha = 0.35 + v * 0.45;
              p.fillRect(gx * C, gy * C, C - 1, C - 1);
            }
          } else if (onRing) {
            const band = 0.5 + 0.5 * Math.sin(rd * 14);
            const v = band * (ry > 0 ? 0.8 : 0.45);
            if (v > t * 0.9) {
              p.fillStyle = levels[ry > 0 ? 3 : 2] ?? dot;
              p.globalAlpha = 0.25 + v * 0.4;
              p.fillRect(gx * C, gy * C, C - 1, C - 1);
            }
          }
        }
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.floor((w * h) / 5200);
      stars = Array.from({ length: n }, (_, i) => ({
        x: hash(i, 1, 13) * w,
        y: hash(i, 2, 13) * h,
        depth: 0.15 + hash(i, 3, 13) * 0.85,
        ph: hash(i, 4, 13) * Math.PI * 2,
      }));
      particles = [];
      buildPlanet();
      draw(reduceMotion ? 0 : performance.now(), 0);
    };

    const rocketState = (s: number) => {
      const small = w < 640;
      return {
        x: w * (small ? 0.7 : 0.74) + Math.sin(s * 0.31) * w * 0.05,
        y: h * (small ? 0.24 : 0.4) + Math.sin(s * 0.47) * h * 0.06,
        ang: 0.7 + Math.sin(s * 0.23) * 0.5 + s * 0.04,
        size: small ? 1 : 2,
      };
    };

    const draw = (time: number, dt: number) => {
      const s = time / 1000;
      ctx.clearRect(0, 0, w, h);

      for (const st of stars) {
        const x = (((st.x - s * 26 * st.depth) % w) + w) % w;
        const y = (((st.y + s * 12 * st.depth) % h) + h) % h;
        const tw = 0.5 + 0.5 * Math.sin(s * (1 + st.depth * 2) + st.ph);
        ctx.globalAlpha = (0.15 + st.depth * 0.6) * (0.4 + tw * 0.6);
        ctx.fillStyle = st.depth > 0.85 ? (levels[4] ?? dot) : st.depth > 0.55 ? (levels[2] ?? dot) : dot;
        const sz = st.depth > 0.85 ? C - 1 : 2;
        ctx.fillRect(snap(x), snap(y), sz, sz);
      }

      ctx.globalAlpha = 1;
      ctx.drawImage(planet, 0, 0, w, h);

      const r = rocketState(s);
      const cell = C * r.size;
      const sw = SPRITE[0]!.length;
      const sh = SPRITE.length;
      const cos = Math.cos(r.ang);
      const sin = Math.sin(r.ang);
      const back = (sh / 2 + 0.5) * cell;
      const nx = r.x - sin * back;
      const ny = r.y + cos * back;

      if (!reduceMotion && dt > 0) {
        for (let i = 0; i < 3; i++) {
          const spread = (Math.random() - 0.5) * 0.7;
          const sp = 40 + Math.random() * 50;
          particles.push({
            x: nx,
            y: ny,
            vx: -Math.sin(r.ang + spread) * sp - 26,
            vy: Math.cos(r.ang + spread) * sp + 12,
            life: 0,
            max: 0.9 + Math.random() * 1.3,
          });
        }
      }
      particles = particles.filter((p) => (p.life += dt) < p.max);
      for (const p of particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.985;
        p.vy *= 0.985;
        const k = p.life / p.max;
        ctx.fillStyle = k < 0.18 ? fg : k < 0.4 ? spark : (levels[k < 0.7 ? 2 : 1] ?? dot);
        ctx.globalAlpha = (1 - k) * 0.9;
        const sz = k < 0.4 ? cell * 0.75 : C;
        ctx.fillRect(snap(p.x), snap(p.y), Math.max(C - 1, sz - 1), Math.max(C - 1, sz - 1));
      }

      const reach = Math.ceil((Math.hypot(sw, sh) / 2) * r.size) + 1;
      const gx0 = Math.round(r.x / C);
      const gy0 = Math.round(r.y / C);
      const windowOn = Math.sin(s * 3) > -0.6;
      ctx.globalAlpha = 1;
      for (let gy = -reach; gy <= reach; gy++) {
        for (let gx = -reach; gx <= reach; gx++) {
          const wx = (gx0 + gx) * C - r.x;
          const wy = (gy0 + gy) * C - r.y;
          const lx = (wx * cos + wy * sin) / cell + sw / 2;
          const ly = (-wx * sin + wy * cos) / cell + sh / 2;
          const c = SPRITE[Math.floor(ly)]?.[Math.floor(lx)];
          if (!c || c === '.') continue;
          ctx.fillStyle =
            c === '1' ? (levels[2] ?? dot) : c === '2' ? fg : c === '3' ? (levels[4] ?? dot) : windowOn ? spark : (levels[3] ?? dot);
          ctx.fillRect((gx0 + gx) * C, (gy0 + gy) * C, C - 1, C - 1);
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = (time: number) => {
      const dt = last ? Math.min(0.1, (time - last) / 1000) : 0;
      if (time - last > 33) {
        draw(time, dt);
        last = time;
      }
      raf = requestAnimationFrame(loop);
    };

    resize();
    const stop = watchVisibility(canvas, (v) => {
      cancelAnimationFrame(raf);
      last = 0;
      if (v && !reduceMotion) raf = requestAnimationFrame(loop);
    });
    let timer: ReturnType<typeof setTimeout> | undefined;
    const ro = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(resize, 120);
    });
    ro.observe(canvas);

    this.cleanup = () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      ro.disconnect();
      stop();
    };
  }
}

