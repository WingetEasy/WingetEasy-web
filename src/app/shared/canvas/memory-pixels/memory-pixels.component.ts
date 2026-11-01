/**
 * ==============================================================================
 * GRÁFICO DE MEMÓRIA EM PIXELS (memory-pixels.component.ts)
 * ==============================================================================
 * O que é:
 *   Visualização interativa de consumo de memória em matriz de 65 pontos (1 ponto = 1 MB),
 *   demonstrando visualmente a compactação de RAM quando a janela é fechada e vai para a bandeja.
 *
 * O que faz:
 *   - Alterna a cada 3.6 segundos (`3600ms`) entre o estado "Janela aberta" (65 MB)
 *     e "Na bandeja" (apenas 11 MB).
 *   - Usa um `IntersectionObserver` para pausar a animação caso esteja fora da tela.
 *   - Anima individualmente cada ponto em efeito cascata (`transitionDelay`).
 *   - Respeita o modo de movimento reduzido (`prefers-reduced-motion`).
 *
 * Como alterar caso queira:
 *   - Alterar os valores de memória: Mude `readonly TOTAL = 65` ou `readonly TRAY = 11`.
 *   - Mudar velocidade da transição: Altere `readonly STEP_MS = 3600`.
 */

import { Component, OnInit, OnDestroy, ElementRef, viewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-memory-pixels',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div #container>
      <!-- Cabeçalho com o contador numérico de MB -->
      <div class="flex items-end justify-between gap-4">
        <div>
          <p class="font-mono text-[12px] uppercase tracking-[0.14em] text-muted-foreground">
            {{ tray() ? 'Na bandeja' : 'Janela aberta' }}
          </p>
          <p class="mt-2 text-6xl font-semibold tabular-nums tracking-display md:text-7xl">
            <span
              class="transition-colors duration-700"
              [class.text-brand-cyan]="tray()"
              [class.text-foreground]="!tray()"
            >
              {{ tray() ? TRAY : TOTAL }}
            </span>
            <span class="ml-2 text-2xl tracking-normal text-muted-foreground">MB</span>
          </p>
        </div>
        <p class="pb-2 text-right font-mono text-[12px] text-muted-foreground">1 ponto = 1 MB</p>
      </div>

      <!-- Grade 13x5 de 65 pontos com animação em cascata -->
      <div class="mt-7 grid grid-cols-13 gap-1.5" aria-hidden="true">
        @for (item of points; track $index; let i = $index) {
          <span
            class="aspect-square rounded-[3px] transition-colors duration-500"
            [class.bg-brand-cyan]="i < TRAY && tray()"
            [class.bg-subtle/70]="!tray()"
            [class.bg-surface-raised]="i >= TRAY && tray()"
            [style.transition-delay]="(tray() ? (TOTAL - i) : i) * 12 + 'ms'"
          ></span>
        }
      </div>
    </div>
  `
})
export class MemoryPixelsComponent implements OnInit, OnDestroy {
  containerRef = viewChild<ElementRef<HTMLDivElement>>('container');

  readonly TOTAL = 65;
  readonly TRAY = 11;
  readonly STEP_MS = 3600;

  // Array estático de 65 itens para desenhar a grade
  readonly points = Array.from({ length: 65 }, (_, i) => i);

  tray = signal<boolean>(false);
  visible = signal<boolean>(false);

  private timer: any;
  private observer?: IntersectionObserver;

  ngOnInit() {
    if (typeof window === 'undefined') return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.tray.set(true);
      return;
    }

    // Aguarda o próximo tick para o containerRef estar disponível
    setTimeout(() => {
      const el = this.containerRef()?.nativeElement;
      if (!el) return;

      this.observer = new IntersectionObserver(
        ([entry]) => {
          this.visible.set(!!entry?.isIntersecting);
          if (this.visible()) {
            this.startCycle();
          } else {
            this.stopCycle();
          }
        },
        { threshold: 0.3 }
      );
      this.observer.observe(el);
    }, 50);
  }

  ngOnDestroy() {
    this.stopCycle();
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private startCycle() {
    this.stopCycle();
    this.timer = setInterval(() => {
      if (this.visible()) {
        this.tray.update(v => !v);
      }
    }, this.STEP_MS);
  }

  private stopCycle() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}

