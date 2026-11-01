/**
 * ==============================================================================
 * LAYOUT DE DOCUMENTAÇÃO E ARQUITETURA (docs-layout.component.ts)
 * ==============================================================================
 * O que é:
 *   Shell de layout compartilhado para páginas técnicas longas (/arquitetura e /documentacao).
 *
 * O que faz:
 *   - Header e Footer integrados.
 *   - Banner com PixelNebula, eyebrow, título grande, descrição e grid de estatísticas (stats).
 *   - Fita de dados divisora (PixelBand).
 *   - Sidebar esquerda com menu de índice ("Nesta página" / TOC) com detecção de scroll no desktop.
 *   - NOVO: Menu suspenso / gaveta "Nesta página" compacta para dispositivos móveis e tablets,
 *     permitindo que o usuário no celular ou tablet selecione e pule rapidamente para qualquer seção.
 *   - Componentes utilitários exportados: DocSection, CodeBlock, DataTable, Bullets, SpecGrid e C.
 */

import { Component, input, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronDown, ListFilter } from 'lucide-angular';
import { PixelNebulaComponent } from '../../canvas/pixel-nebula/pixel-nebula.component';
import { PixelBandComponent } from '../../canvas/pixel-band/pixel-band.component';
import { SiteCtaComponent } from '../../../layout/site-cta/site-cta.component';
import { SiteFooterComponent } from '../../../layout/site-footer/site-footer.component';

export type TocItem = { id: string; label: string; group?: string };
export type StatItem = { value: string; label: string };

@Component({
  selector: 'app-docs-layout',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    PixelNebulaComponent,
    PixelBandComponent,
    SiteCtaComponent,
    SiteFooterComponent
  ],
  template: `
    <div class="min-h-screen overflow-x-clip bg-background text-foreground">
      <main>
        <!-- Banner Superior com Estatísticas e Nebulosa -->
        <section class="relative">
          <div class="pointer-events-none absolute inset-x-0 top-0 h-full opacity-40 md:opacity-80">
            <app-pixel-nebula class="animate-fade h-full w-full"></app-pixel-nebula>
          </div>

          <div class="relative mx-auto max-w-[1200px] px-5 pb-12 pt-12 sm:pb-16 sm:pt-20 md:px-8 md:pb-20 md:pt-28">
            <p class="animate-rise font-mono text-[12px] uppercase tracking-[0.18em] text-brand-cyan">
              {{ eyebrow() }}
            </p>
            <h1 class="animate-rise mt-4 max-w-3xl text-3xl font-semibold leading-[1.08] tracking-display sm:text-5xl md:text-[3.6rem]">
              {{ title() }}
            </h1>
            <p class="animate-rise mt-4 sm:mt-6 max-w-2xl text-base sm:text-xl leading-[1.55] text-subtle">
              {{ description() }}
            </p>

            @if (stats() && stats()!.length > 0) {
              <dl class="animate-rise mt-8 sm:mt-12 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-4">
                @for (s of stats()!; track s.label) {
                  <div class="bg-background/90 p-4 sm:px-5 sm:py-4 backdrop-blur">
                    <dt class="text-xs sm:text-sm text-muted-foreground">{{ s.label }}</dt>
                    <dd class="mt-1 text-xl sm:text-2xl font-semibold tracking-tight">{{ s.value }}</dd>
                  </div>
                }
              </dl>
            }
          </div>
        </section>

        <!-- Divisor animado PixelBand -->
        <div aria-hidden="true" class="border-y border-border">
          <app-pixel-band [seed]="5" class="block h-12 sm:h-16 w-full"></app-pixel-band>
        </div>

        <!-- Menu Flutuante / Compacto "Nesta Página" para Telas Menores (Smartphones & Tablets < lg) -->
        <div class="sticky top-16 z-30 border-b border-border bg-background/95 px-5 py-3 backdrop-blur-md lg:hidden">
          <div class="mx-auto flex max-w-[1200px] items-center justify-between">
            <button
              type="button"
              (click)="mobileTocOpen.update(v => !v)"
              class="flex w-full items-center justify-between rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-mono uppercase tracking-[0.12em] text-subtle hover:text-foreground hover:border-input transition-colors cursor-pointer"
            >
              <span class="flex items-center gap-2 truncate">
                <lucide-icon [img]="ListIcon" class="size-3.5 text-brand-cyan"></lucide-icon>
                <span class="text-muted-foreground">Índice:</span>
                <span class="text-foreground font-semibold truncate">{{ currentActiveLabel() }}</span>
              </span>
              <lucide-icon
                [img]="ChevronIcon"
                class="size-4 shrink-0 transition-transform duration-200"
                [class.rotate-180]="mobileTocOpen()"
              ></lucide-icon>
            </button>
          </div>

          <!-- Drawer suspenso com todos os tópicos no Mobile -->
          @if (mobileTocOpen()) {
            <div class="mt-2 max-h-[60vh] overflow-y-auto rounded-xl border border-border bg-surface p-3 shadow-2xl animate-fade">
              <ul class="space-y-1">
                @for (t of toc(); track t.id) {
                  <li>
                    <a
                      [href]="'#' + t.id"
                      (click)="mobileTocOpen.set(false)"
                      class="block rounded-lg px-3 py-2 text-sm transition-colors"
                      [class.bg-surface-raised]="activeId() === t.id"
                      [class.text-brand-cyan]="activeId() === t.id"
                      [class.font-semibold]="activeId() === t.id"
                      [class.text-subtle]="activeId() !== t.id"
                    >
                      <span class="mr-2 text-xs font-mono text-muted-foreground">{{ t.group }} ›</span>
                      {{ t.label }}
                    </a>
                  </li>
                }
              </ul>
            </div>
          }
        </div>

        <!-- Conteúdo Principal: Sidebar de Navegação TOC Desktop + Artigos -->
        <div class="mx-auto grid max-w-[1200px] gap-8 px-5 py-10 sm:py-16 md:px-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16 lg:py-20">
          <!-- Sidebar Desktop TOC -->
          <aside class="hidden lg:block">
            <nav class="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pb-8 text-sm" aria-label="Nesta página">
              <p class="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Nesta página</p>
              <ul class="space-y-0.5 border-l border-border">
                @for (t of toc(); track t.id; let i = $index) {
                  <li>
                    @if (showGroupHeader(i)) {
                      <p class="mb-1 mt-4 pl-4 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground first:mt-0">
                        {{ t.group }}
                      </p>
                    }
                    <a
                      [href]="'#' + t.id"
                      class="-ml-px block border-l py-1.5 pl-4 transition-colors"
                      [class.border-brand-cyan]="activeId() === t.id"
                      [class.text-foreground]="activeId() === t.id"
                      [class.border-transparent]="activeId() !== t.id"
                      [class.text-muted-foreground]="activeId() !== t.id"
                      [class.hover:text-subtle]="activeId() !== t.id"
                    >
                      {{ t.label }}
                    </a>
                  </li>
                }
              </ul>
            </nav>
          </aside>

          <!-- Corpo do Artigo -->
          <article class="min-w-0 space-y-16 sm:space-y-24">
            <ng-content></ng-content>
          </article>
        </div>
      </main>

      <app-site-cta></app-site-cta>
      <app-site-footer></app-site-footer>
    </div>
  `
})
export class DocsLayoutComponent implements OnInit, OnDestroy {
  eyebrow = input.required<string>();
  title = input.required<string>();
  description = input.required<string>();
  stats = input<StatItem[]>([]);
  toc = input.required<TocItem[]>();

  activeId = signal<string>('');
  mobileTocOpen = signal<boolean>(false);

  readonly ListIcon = ListFilter;
  readonly ChevronIcon = ChevronDown;

  private observer?: IntersectionObserver;

  currentActiveLabel = () => {
    const item = this.toc().find(t => t.id === this.activeId());
    return item ? item.label : 'Selecione uma seção';
  };

  ngOnInit() {
    if (this.toc().length > 0) {
      this.activeId.set(this.toc()[0].id);
    }

    if (typeof window !== 'undefined') {
      setTimeout(() => {
        const ids = this.toc().map(t => t.id);
        const els = ids.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[];

        this.observer = new IntersectionObserver(
          (entries) => {
            const visible = entries
              .filter(e => e.isIntersecting)
              .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
            if (visible[0]) {
              this.activeId.set(visible[0].target.id);
            }
          },
          { rootMargin: '-90px 0px -65% 0px' }
        );

        els.forEach(el => this.observer?.observe(el));
      }, 200);
    }
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  showGroupHeader(index: number): boolean {
    const list = this.toc();
    const current = list[index];
    if (!current?.group) return false;
    if (index === 0) return true;
    const prev = list[index - 1];
    return prev?.group !== current.group;
  }
}

/** Componente de Seção de Documentação */
@Component({
  selector: 'app-doc-section',
  standalone: true,
  template: `
    <section [id]="id()" class="scroll-mt-28">
      <p class="font-mono text-[12px] text-muted-foreground">{{ index() }}</p>
      <h2 class="mt-2 text-2xl font-semibold leading-tight tracking-display sm:text-3xl md:text-4xl">{{ title() }}</h2>
      @if (lead()) {
        <p class="mt-3 sm:mt-4 max-w-3xl text-base sm:text-lg leading-relaxed text-subtle">{{ lead() }}</p>
      }
      <div class="mt-6 sm:mt-8 space-y-6">
        <ng-content></ng-content>
      </div>
    </section>
  `
})
export class DocSectionComponent {
  id = input.required<string>();
  index = input.required<string>();
  title = input.required<string>();
  lead = input<string>('');
}

/** Componente de Tag de Código Inline <C> */
@Component({
  selector: 'app-c',
  standalone: true,
  template: `
    <code class="rounded-md border border-border bg-surface-raised px-1.5 py-0.5 font-mono text-[0.85em] text-foreground"><ng-content></ng-content></code>
  `
})
export class CComponent {}

/** Componente de Bloco de Código */
@Component({
  selector: 'app-code-block',
  standalone: true,
  template: `
    <div class="overflow-hidden rounded-2xl border border-border bg-surface shadow-card my-6">
      <div class="border-b border-border px-4 py-2.5 font-mono text-[12px] text-subtle">{{ label() }}</div>
      <pre class="overflow-x-auto px-4 py-3.5 sm:px-5 sm:py-4 font-mono text-[12px] sm:text-[13px] leading-6 text-subtle"><code>{{ code() }}</code></pre>
    </div>
  `
})
export class CodeBlockComponent {
  label = input.required<string>();
  code = input.required<string>();
}

/** Componente de Tabela de Dados */
@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overflow-x-auto rounded-2xl border border-border my-6">
      <table class="w-full min-w-[500px] text-left text-[14px] sm:text-[14.5px]">
        <thead class="bg-surface">
          <tr>
            @for (h of head(); track h) {
              <th class="border-b border-border px-3.5 py-3 font-mono text-[11px] sm:text-[11.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                {{ h }}
              </th>
            }
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          @for (row of rows(); track $index) {
            <tr class="align-top transition-colors hover:bg-surface/60">
              @for (cell of row; track $index; let colIdx = $index) {
                <td
                  class="px-3.5 py-3 leading-relaxed"
                  [class.font-mono]="isMono(colIdx)"
                  [class.text-[12.5px]]="isMono(colIdx)"
                  [class.sm:text-[13px]]="isMono(colIdx)"
                  [class.text-foreground]="isMono(colIdx)"
                  [class.text-subtle]="!isMono(colIdx)"
                >
                  {{ cell }}
                </td>
              }
            </tr>
          }
        </tbody>
      </table>
    </div>
  `
})
export class DataTableComponent {
  head = input.required<string[]>();
  rows = input.required<string[][]>();
  mono = input<number[]>([0]);

  isMono(idx: number): boolean {
    return this.mono().includes(idx);
  }
}

/** Componente de Grid de Especificações */
@Component({
  selector: 'app-spec-grid',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2 my-6">
      @for (it of items(); track it.title) {
        <div class="bg-background p-5 sm:p-6">
          <div class="flex items-baseline justify-between gap-3">
            <h3 class="text-base sm:text-lg font-semibold tracking-tight">{{ it.title }}</h3>
            @if (it.tag) {
              <span class="font-mono text-[11px] sm:text-[11.5px] text-muted-foreground">{{ it.tag }}</span>
            }
          </div>
          <div class="mt-2 text-sm sm:text-base leading-relaxed text-subtle">{{ it.body }}</div>
        </div>
      }
    </div>
  `
})
export class SpecGridComponent {
  items = input.required<{ title: string; tag?: string; body: string }[]>();
}
