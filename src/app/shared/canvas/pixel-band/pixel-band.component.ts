/**
 * ==============================================================================
 * FITA DE DADOS EM PIXELS (pixel-band.component.ts)
 * ==============================================================================
 * O que é:
 *   Canvas interativo de efeito visual que desenha uma fita/ribbon dithered
 *   ondulando lateralmente com centelhas viajando em sua crista.
 *
 * O que faz:
 *   - Atua como um divisor de seções elegante entre "Recursos" e "Como funciona".
 *   - Utiliza as cores OKLCH dinâmicas do tema (--nebula-*, --spark).
 *   - Compatível com SSR (executado via `afterNextRender`).
 *   - Otimizado com `IntersectionObserver` e `prefers-reduced-motion`.
 *
 * Como alterar caso queira:
 *   - Alterar a semente de ondulação: Modifique a propriedade `seed` (padrão `3`).
 *   - Ajustar altura do componente: Altere a classe no componente pai (ex: `h-20`).
 */

import { Component, ElementRef, viewChild, afterNextRender, input, OnDestroy } from '@angular/core';
import { BAYER, clamp01, fbm, hash, readPixelTokens, smooth, watchVisibility } from '../pixel-noise';

@Component({
  selector: 'app-pixel-band',
  standalone: true,
  template: `<canvas #canvas aria-hidden="true" [class]="class()"></canvas>`,
})
export class PixelBandComponent implements OnDestroy {
  canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  class = input<string>('block w-full h-full pointer-events-none');
  seed = input<number>(3);

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

    const { levels, dot: dotColor, spark: sparkColor } = readPixelTokens();
    const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const CELL = 4;
    const seed = this.seed();
    const SPARKS = [0, 1, 2].map((i) => ({
      offset: hash(i, seed, 21),
      speed: 0.035 + hash(i, seed, 33) * 0.04,
      lane: (hash(i, seed, 47) - 0.5) * 0.5,
    }));

    let w = 1;
    let h = 1;
    let raf = 0;
    let last = 0;

    const crest = (gx: number, cols: number, rows: number, s: number) => {
      const nx = gx / cols;
      return rows * (0.5 + 0.22 * Math.sin(nx * 7 + s * 0.4 + seed) + 0.12 * Math.sin(nx * 17 - s * 0.7));
    };

    const draw = (time: number) => {
      const s = time / 1000;
      ctx.clearRect(0, 0, w, h);
      const cols = Math.ceil(w / CELL);
      const rows = Math.ceil(h / CELL);
      const drift = s * 1.6;

      for (let gx = 0; gx < cols; gx++) {
        const nx = gx / cols;
        const envelope = smooth(clamp01(nx / 0.25)) * smooth(clamp01((1 - nx) / 0.18)) * (0.6 + 0.4 * nx);
        const c = crest(gx, cols, rows, s);
        const thick = rows * (0.22 + 0.18 * fbm(gx * 0.02 - drift * 0.3, 0, seed + 5, 2));

        for (let gy = 0; gy < rows; gy++) {
          const dist = Math.abs(gy - c) / Math.max(1, thick);
          const n = fbm(gx * 0.05 - drift, gy * 0.12, seed, 3);
          const v = clamp01(1 - dist) * envelope * clamp01((n - 0.28) / 0.35);
          const t = BAYER[gy % 4]?.[gx % 4] ?? 0.5;
          const px = gx * CELL;
          const py = gy * CELL;

          if (v > 0.1 + t * 0.25) {
            const lvl = Math.min(levels.length - 1, Math.floor(v * 5 + (t - 0.5)));
            ctx.fillStyle = levels[Math.max(0, lvl)] ?? dotColor;
            ctx.globalAlpha = Math.min(1, 0.4 + v * 0.8);
            ctx.fillRect(px, py, CELL - 1, CELL - 1);
          } else if (envelope * clamp01(1 - dist * 0.45) * (0.4 + n) > t + 0.3) {
            ctx.fillStyle = dotColor;
            ctx.globalAlpha = 0.5;
            ctx.fillRect(px + 1, py + 1, 1.6, 1.6);
          }
        }
      }

      // Desenha as centelhas viajando na crista da fita
      ctx.fillStyle = sparkColor;
      for (const sp of SPARKS) {
        const head = ((sp.offset + s * sp.speed) % 1) * cols;
        for (let k = 0; k < 6; k++) {
          const gx = Math.floor(head) - k;
          if (gx < 0) continue;
          const nx = gx / cols;
          const envelope = smooth(clamp01(nx / 0.2)) * smooth(clamp01((1 - nx) / 0.15));
          const gy = Math.round(crest(gx, cols, rows, s) + sp.lane * rows * 0.4);
          ctx.globalAlpha = envelope * (1 - k / 6) * 0.95;
          ctx.fillRect(gx * CELL, gy * CELL, CELL - 1, CELL - 1);
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
      draw(reduceMotion ? 4000 : (typeof performance !== 'undefined' ? performance.now() : 0));
    };

    const loop = (time: number) => {
      if (time - last > 80) {
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

