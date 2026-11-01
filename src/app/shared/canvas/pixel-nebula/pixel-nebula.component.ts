/**
 * ==============================================================================
 * EFEITO DE NEBULOSA EM PIXELS DITHERED (pixel-nebula.component.ts)
 * ==============================================================================
 * O que é:
 *   Canvas interativo de arte gerativa em matriz de pixels com algoritmo de ruído
 *   Fractal Brownian Motion (FBM) e matriz de dithering Bayer 4x4.
 *
 * O que faz:
 *   - Cria a nuvem de pixels com as cores OKLCH da identidade visual (ciano, azul, violeta).
 *   - Gera partículas e centelhas cintilantes sutis (`sparks`).
 *   - Compatível com SSR: só inicia o Canvas após renderizar no cliente (`afterNextRender`).
 *   - Performance otimizada:
 *     * Pausa a animação quando fora da tela usando `IntersectionObserver`.
 *     * Respeita a preferência do usuário do Windows por menos movimento (`prefers-reduced-motion`).
 *
 * Como alterar caso queira:
 *   - Alterar o tamanho dos blocos de pixel: Mude a constante `CELL = 4` (ex: `CELL = 6` para pixels maiores).
 *   - Mudar a semente da nuvem: Altere a propriedade `seed = input<number>(7)` no componente pai.
 *   - Mudar a ancoragem do efeito: Altere `anchor = input<NebulaAnchor>('top-right')` para `'left'`, `'right'`, etc.
 */

import { Component, ElementRef, viewChild, afterNextRender, input, OnDestroy } from '@angular/core';
import { BAYER, clamp01, fbm, hash, readPixelTokens, smooth, watchVisibility } from '../pixel-noise';

export type NebulaAnchor = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'left' | 'right';

const ANCHOR_POINT: Record<Exclude<NebulaAnchor, 'top-right'>, [number, number]> = {
  'top-left': [0.08, 0.02],
  'bottom-right': [0.92, 1],
  'bottom-left': [0.06, 1],
  left: [0, 0.5],
  right: [1, 0.5],
};

type Spark = { x: number; y: number; phase: number; speed: number };

@Component({
  selector: 'app-pixel-nebula',
  standalone: true,
  template: `<canvas #canvas aria-hidden="true" [class]="class()"></canvas>`,
})
export class PixelNebulaComponent implements OnDestroy {
  // Referência ao elemento <canvas> nativo no template
  canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  // Classes CSS para posicionamento e dimensões
  class = input<string>('block w-full h-full pointer-events-none');

  // Ponto de concentração da nebulosa
  anchor = input<NebulaAnchor>('top-right');

  // Semente de número aleatório (alterar varia a forma da nuvem)
  seed = input<number>(7);

  private cleanup?: () => void;

  constructor() {
    // Executa apenas no navegador do cliente (evita erros no SSR/Node.js)
    afterNextRender(() => {
      this.initCanvas();
    });
  }

  ngOnDestroy() {
    // Limpa event listeners, observers e o loop do requestAnimationFrame
    if (this.cleanup) {
      this.cleanup();
    }
  }

  private initCanvas() {
    const canvas = this.canvasRef().nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Lê as cores dinâmicas definidas nas variáveis CSS (src/styles.css)
    const { levels, dot: dotColor, spark: sparkColor } = readPixelTokens();
    const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Tamanho do pixel individual na grade (em px)
    const CELL = 4;
    const base = document.createElement('canvas');
    let sparks: Spark[] = [];
    let raf = 0;
    let last = 0;
    let visible = true;
    const anchor = this.anchor();
    const seed = this.seed();

    /**
     * Calcula o gradiente de intensidade da nuvem para cada coordenada normalizada (0 a 1)
     */
    const maskAt = (nx: number, ny: number, warp: number): [number, number] => {
      if (anchor === 'top-right') {
        const sx = clamp01((nx - 0.32) / 0.4);
        const sy = clamp01((ny - 0.2) / 0.65);
        const halo = clamp01((nx - 0.2) / 0.3) * (1 - smooth(Math.min(1, ny / 0.95)));
        return [smooth(sx) * (1 - smooth(sy)), halo];
      }
      const [ax, ay] = ANCHOR_POINT[anchor as Exclude<NebulaAnchor, 'top-right'>] ?? [1, 0.5];
      const dx = (nx - ax) / 0.62;
      const dy = (ny - ay) / 0.95;
      const d = Math.sqrt(dx * dx + dy * dy) + (warp - 0.5) * 0.35;
      const fade = (v: number, span: number) => smooth(clamp01(v / span));
      const edge =
        (ay <= 0 ? 1 : fade(ny, 0.28)) *
        (ay >= 1 ? 1 : fade(1 - ny, 0.32)) *
        (ax <= 0 ? 1 : fade(nx, 0.2)) *
        (ax >= 1 ? 1 : fade(1 - nx, 0.2));
      return [(1 - smooth(clamp01(d / 0.85))) * edge, (1 - smooth(clamp01(d / 1.25))) * edge];
    };

    /**
     * Renderiza o fundo estático dithered no canvas auxiliar (em memória)
     */
    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      canvas.width = base.width = w * dpr;
      canvas.height = base.height = h * dpr;
      const bctx = base.getContext('2d');
      if (!bctx) return;
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bctx.clearRect(0, 0, w, h);

      const cols = Math.ceil(w / CELL);
      const rows = Math.ceil(h / CELL);
      sparks = [];

      for (let gy = 0; gy < rows; gy++) {
        for (let gx = 0; gx < cols; gx++) {
          const nx = gx / cols;
          const ny = gy / rows;
          const n = fbm(gx * 0.03, gy * 0.045, seed);
          const ridge = fbm(gx * 0.011 + 40, gy * 0.018, seed - 4);
          const [mask, halo] = maskAt(nx, ny, ridge);
          const cloud = clamp01((n - 0.36) / 0.3) * mask * (0.55 + ridge * 0.9);
          const t = BAYER[gy % 4]?.[gx % 4] ?? 0.5;

          const px = gx * CELL;
          const py = gy * CELL;

          if (cloud > 0.08 + t * 0.22) {
            const lvl = Math.min(levels.length - 1, Math.floor(cloud * 4.6 + (t - 0.5) * 1.2));
            bctx.fillStyle = levels[Math.max(0, lvl)] ?? dotColor;
            bctx.globalAlpha = Math.min(1, 0.45 + cloud * 0.8);
            bctx.fillRect(px, py, CELL - 1, CELL - 1);
            if (cloud > 0.45 && hash(gx, gy, 92 + seed) > 0.988) {
              sparks.push({
                x: px,
                y: py,
                phase: hash(gx, gy, 5) * Math.PI * 2,
                speed: 0.6 + hash(gx, gy, 11) * 1.4,
              });
            }
          } else {
            const band = anchor === 'top-right' && ny < 0.2 && nx > 0.03 && nx < 0.3 ? 0.6 : 0;
            const dotChance = Math.max(halo * 1.1, band) * (0.5 + n);
            if (dotChance > t + 0.15) {
              bctx.fillStyle = dotColor;
              bctx.globalAlpha = 0.55 + 0.35 * n;
              bctx.fillRect(px + 1, py + 1, 1.6, 1.6);
            }
          }
        }
      }
      bctx.globalAlpha = 1;
      draw(0);
    };

    /**
     * Desenha o frame atual (copia o fundo e desenha as centelhas animadas)
     */
    const draw = (time: number) => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(base, 0, 0);
      const dpr = canvas.width / Math.max(1, canvas.getBoundingClientRect().width);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = sparkColor;
      for (const s of sparks) {
        const a = reduceMotion ? 0.9 : 0.35 + 0.65 * Math.max(0, Math.sin((time / 1000) * s.speed + s.phase));
        ctx.globalAlpha = a;
        ctx.fillRect(s.x, s.y, CELL - 1, CELL - 1);
        if (a > 0.85) ctx.fillRect(s.x, s.y + CELL, CELL - 1, CELL - 1);
      }
      ctx.globalAlpha = 1;
    };

    /**
     * Loop de animação via requestAnimationFrame
     */
    const loop = (time: number) => {
      if (time - last > 90) {
        draw(time);
        last = time;
      }
      raf = requestAnimationFrame(loop);
    };

    render();

    // Interrompe o render quando o usuário scrolla e o canvas sai da tela
    const stopWatching = watchVisibility(canvas, (v) => {
      visible = v;
      cancelAnimationFrame(raf);
      if (visible && !reduceMotion) raf = requestAnimationFrame(loop);
    });

    // Re-calcula proporções caso o usuário redimensione a janela
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(render, 120);
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
