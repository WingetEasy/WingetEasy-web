/**
 * ==============================================================================
 * CAMPO DE ESTRELAS EM PIXELS (pixel-stars.component.ts)
 * ==============================================================================
 * O que é:
 *   Canvas de arte gerativa que renderiza um céu estrelado em matriz de pixels dithered
 *   cintilantes, com estrelas cadentes periódicas na cor âmbar (--spark).
 *
 * O que faz:
 *   - Cria pontos esparsos de estrelas que pulsam suavemente.
 *   - Dispara uma estrela cadente a cada 7 segundos (`PERIOD = 7`).
 *   - Compatível com SSR (executa no cliente via `afterNextRender`).
 *   - Desativa automaticamente o movimento se o usuário preferir menos movimento.
 *
 * Como alterar caso queira:
 *   - Aumentar/diminuir densidade de estrelas: Mude o `density` (padrão `0.008`).
 *   - Desativar estrelas cadentes: Defina `shooting = false`.
 */

import { Component, ElementRef, viewChild, afterNextRender, input, OnDestroy } from '@angular/core';
import { hash, readPixelTokens, watchVisibility } from '../pixel-noise';

@Component({
  selector: 'app-pixel-stars',
  standalone: true,
  template: `<canvas #canvas aria-hidden="true" [class]="class()"></canvas>`,
})
export class PixelStarsComponent implements OnDestroy {
  canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  class = input<string>('block w-full h-full pointer-events-none');
  seed = input<number>(7);
  density = input<number>(0.008);
  shooting = input<boolean>(true);

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
    const PERIOD = 7;
    const seed = this.seed();
    const density = this.density();
    const shooting = this.shooting();

    let w = 1;
    let h = 1;
    let raf = 0;
    let last = 0;
    let stars: { x: number; y: number; phase: number; speed: number; bright: number }[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cols = Math.ceil(w / CELL);
      const rows = Math.ceil(h / CELL);
      stars = [];
      for (let gx = 0; gx < cols; gx++) {
        for (let gy = 0; gy < rows; gy++) {
          if (hash(gx, gy, seed) < density) {
            stars.push({
              x: gx * CELL,
              y: gy * CELL,
              phase: hash(gy, gx, seed + 3) * Math.PI * 2,
              speed: 0.6 + hash(gx, gy, seed + 9) * 1.6,
              bright: hash(gx, gy, seed + 11),
            });
          }
        }
      }
      draw(reduceMotion ? 0 : (typeof performance !== 'undefined' ? performance.now() : 0));
    };

    const draw = (time: number) => {
      const s = time / 1000;
      ctx.clearRect(0, 0, w, h);

      for (const st of stars) {
        const tw = 0.5 + 0.5 * Math.sin(s * st.speed + st.phase);
        if (st.bright > 0.965) {
          ctx.fillStyle = levels[4] ?? dot;
          ctx.globalAlpha = 0.35 + tw * 0.65;
          ctx.fillRect(st.x, st.y, CELL - 1, CELL - 1);
          ctx.globalAlpha *= 0.4;
          ctx.fillRect(st.x - CELL, st.y, CELL - 1, CELL - 1);
          ctx.fillRect(st.x + CELL, st.y, CELL - 1, CELL - 1);
          ctx.fillRect(st.x, st.y - CELL, CELL - 1, CELL - 1);
          ctx.fillRect(st.x, st.y + CELL, CELL - 1, CELL - 1);
        } else {
          ctx.fillStyle = st.bright > 0.6 ? (levels[3] ?? dot) : dot;
          ctx.globalAlpha = 0.15 + tw * 0.6;
          ctx.fillRect(st.x + 1, st.y + 1, 2, 2);
        }
      }

      if (shooting && !reduceMotion) {
        const cycle = Math.floor(s / PERIOD);
        const t = (s % PERIOD) / 1.4;
        if (t < 1) {
          const sx = (0.15 + hash(cycle, 1, seed) * 0.6) * w;
          const sy = hash(cycle, 2, seed) * h * 0.4;
          const len = Math.min(w, h) * 0.9;
          const hx = sx + t * len;
          const hy = sy + t * len * 0.45;
          const fade = Math.sin(t * Math.PI);
          ctx.fillStyle = spark;
          for (let k = 0; k < 14; k++) {
            const px = Math.round((hx - k * CELL) / CELL) * CELL;
            const py = Math.round((hy - k * CELL * 0.45) / CELL) * CELL;
            ctx.globalAlpha = fade * (1 - k / 14);
            ctx.fillRect(px, py, CELL - 1, CELL - 1);
          }
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = (time: number) => {
      if (time - last > 50) {
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

