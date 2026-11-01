/**
 * ==============================================================================
 * PLANETA EM PIXELS DITHERED (pixel-planet.component.ts)
 * ==============================================================================
 * O que é:
 *   Canvas interativo de arte gerativa que renderiza um planeta esférico dithered
 *   com faixas de superfície em rotação suave, atmosfera iluminada e luzes urbanas.
 *
 * O que faz:
 *   - Utiliza iluminação Lambertiana, dithering Bayer 4x4 e ruído FBM.
 *   - Utiliza as cores dinâmicas OKLCH do tema (--nebula-*, --spark).
 *   - Compatível com SSR (executado via `afterNextRender`).
 *
 * Como alterar caso queira:
 *   - Alterar semente: Modifique o `seed` (padrão `41`).
 *   - Ajustar altura ou opacidade: Modifique a classe do elemento no componente pai.
 */

import { Component, ElementRef, viewChild, afterNextRender, input, OnDestroy } from '@angular/core';
import { BAYER, clamp01, fbm, readPixelTokens, smooth, watchVisibility } from '../pixel-noise';

@Component({
  selector: 'app-pixel-planet',
  standalone: true,
  template: `<canvas #canvas aria-hidden="true" [class]="class()"></canvas>`,
})
export class PixelPlanetComponent implements OnDestroy {
  canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  class = input<string>('block w-full h-full pointer-events-none');
  seed = input<number>(41);

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
    const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const CELL = 4;
    const seed = this.seed();

    let w = 1;
    let h = 1;
    let raf = 0;
    let last = 0;

    const draw = (time: number) => {
      const s = time / 1000;
      ctx.clearRect(0, 0, w, h);
      const cols = Math.ceil(w / CELL);
      const rows = Math.ceil(h / CELL);

      const wide = w > 768;
      const r = (wide ? Math.max(h * 0.85, w * 0.32) : w * 0.75) / CELL;
      const cx = (wide ? 0.74 : 0.6) * cols;
      const cy = rows + r * 0.42;
      const atmo = r * 0.09;
      const spin = s * 0.035;

      const lx = -0.6;
      const ly = -0.75;

      for (let gy = 0; gy < rows; gy++) {
        const dy = (gy - cy) / r;
        if (dy < -1 - atmo / r) continue;
        for (let gx = 0; gx < cols; gx++) {
          const dx = (gx - cx) / r;
          const d2 = dx * dx + dy * dy;
          const t = BAYER[gy % 4]?.[gx % 4] ?? 0.5;
          const px = gx * CELL;
          const py = gy * CELL;

          if (d2 <= 1) {
            const z = Math.sqrt(1 - d2);
            const lambert = clamp01((dx * lx + dy * ly) * 0.9 + z * 0.35);
            const u = Math.atan2(dx, z) + spin;
            const bands = fbm(u * 3, dy * 6, seed, 4);
            const v = clamp01(lambert * (0.55 + bands * 0.7));
            if (v > 0.06 + t * 0.2) {
              const lvl = Math.min(levels.length - 1, Math.floor(v * 5 + (t - 0.5)));
              ctx.fillStyle = levels[Math.max(0, lvl)] ?? dot;
              ctx.globalAlpha = 0.5 + v * 0.5;
              ctx.fillRect(px, py, CELL - 1, CELL - 1);
            } else if (lambert < 0.12 && bands > 0.62 && t < 0.08) {
              ctx.fillStyle = spark;
              ctx.globalAlpha = 0.55 + 0.45 * Math.sin(s * 2 + gx);
              ctx.fillRect(px, py, CELL - 1, CELL - 1);
            } else {
              ctx.fillStyle = dot;
              ctx.globalAlpha = 0.25;
              ctx.fillRect(px + 1, py + 1, 1.6, 1.6);
            }
          } else {
            const dist = (Math.sqrt(d2) - 1) * r;
            if (dist > atmo) continue;
            const lit = clamp01(dx * lx + dy * ly + 0.3);
            const a = smooth(1 - dist / atmo) * lit;
            if (a > t * 0.9) {
              ctx.fillStyle = levels[a > 0.6 ? 4 : 2] ?? dot;
              ctx.globalAlpha = 0.25 + a * 0.6;
              ctx.fillRect(px + 1, py + 1, 2, 2);
            }
          }
        }
      }
      ctx.globalAlpha = 1;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(reduceMotion ? 0 : (typeof performance !== 'undefined' ? performance.now() : 0));
    };

    const loop = (time: number) => {
      if (time - last > 120) {
        draw(time);
        last = time;
      }
      raf = requestAnimationFrame(loop);
    };

    resize();

    const stopWatching = watchVisibility(canvas, (visible) => {
      cancelAnimationFrame(raf);
      if (visible && !reduceMotion) raf = requestAnimationFrame(loop);
    });

    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 120);
    });
    ro.observe(canvas);

    this.cleanup = () => {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      ro.disconnect();
      stopWatching();
    };
  }
}

