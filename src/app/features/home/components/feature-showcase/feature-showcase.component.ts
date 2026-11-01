/**
 * ==============================================================================
 * SHOWCASE DE RECURSOS RESPONSIVO (feature-showcase.component.ts)
 * ==============================================================================
 * O que é:
 *   Componente interativo de exibição dos 6 recursos centrais do WingetEasy.
 *
 * Melhorias de Responsividade:
 *   - Em smartphones e tablets:
 *     * Mantém o tablist acessível e com scroll/toque agradável.
 *     * Ajusta paddings do painel de preview da janela (`p-4 sm:p-6 md:p-12`).
 *     * Ajusta tamanho dos textos e ícones em telas estreitas para não estourar o card.
 *     * Garante que o link "Saiba mais" para a documentação funcione com toque em qualquer tela.
 */

import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, ArrowRight } from 'lucide-angular';
import { FEATURES, Feature, FeatureRow } from '../../../../core/constants/features';
import { RichTextComponent } from '../../../../shared/components/rich-text/rich-text.component';

@Component({
  selector: 'app-feature-showcase',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, RichTextComponent],
  template: `
    <div class="grid items-start gap-8 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-16">
      <!-- ========================================== -->
      <!-- 1. LISTA LATERAL DE ABAS VERTICAIS         -->
      <!-- ========================================== -->
      <div role="tablist" aria-label="Recursos do WingetEasy" aria-orientation="vertical" class="flex flex-col">
        @for (f of features; track f.key; let i = $index) {
          <div class="relative border-l border-border">
            <!-- Barra animada vertical de tempo / seleção ativa -->
            <span
              class="absolute -left-px top-0 h-full w-px origin-top bg-brand-cyan transition-opacity"
              [class.opacity-100]="i === active()"
              [class.opacity-0]="i !== active()"
              [style.animation]="i === active() && auto() ? 'grow-y ' + autoMs + 'ms linear both' : 'none'"
            ></span>

            <!-- Botão da aba -->
            <button
              role="tab"
              type="button"
              [attr.aria-selected]="i === active()"
              aria-controls="feature-panel"
              (click)="select(i)"
              class="group flex w-full items-center gap-3 sm:gap-4 py-3 sm:py-4 pl-4 sm:pl-6 text-left cursor-pointer"
            >
              <lucide-icon
                [img]="f.icon"
                class="size-4 sm:size-5 shrink-0 transition-colors"
                [class.text-brand-cyan]="i === active()"
                [class.text-muted-foreground]="i !== active()"
                [class.group-hover:text-subtle]="i !== active()"
              ></lucide-icon>

              <span
                class="text-base sm:text-lg font-medium tracking-tight transition-colors"
                [class.text-foreground]="i === active()"
                [class.text-muted-foreground]="i !== active()"
                [class.group-hover:text-subtle]="i !== active()"
              >
                {{ f.name }}
              </span>
            </button>

            <!-- Detalhes sanfona expandidos da aba selecionada -->
            <div
              class="grid pl-11 sm:pl-[3.75rem] pr-2 transition-[grid-template-rows,opacity] duration-500"
              [class.grid-rows-[1fr]]="i === active()"
              [class.opacity-100]="i === active()"
              [class.grid-rows-[0fr]]="i !== active()"
              [class.opacity-0]="i !== active()"
            >
              <div class="overflow-hidden">
                <p class="pb-2 text-sm sm:text-[15.5px] leading-relaxed text-subtle">{{ f.headline }}</p>
                <a
                  [routerLink]="['/documentacao']"
                  [fragment]="f.docsHash"
                  [tabindex]="i === active() ? 0 : -1"
                  class="mb-4 sm:mb-5 inline-flex items-center gap-1 text-xs sm:text-sm text-brand-cyan transition-colors hover:text-foreground cursor-pointer"
                >
                  Saiba mais
                  <lucide-icon [img]="ArrowRightIcon" class="size-3.5"></lucide-icon>
                </a>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- ========================================== -->
      <!-- 2. PAINEL DE PREVIEW DA JANELA DO APP      -->
      <!-- ========================================== -->
      <div
        id="feature-panel"
        role="tabpanel"
        class="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-surface/60 p-4 sm:p-8 md:p-12 shadow-card"
      >
        <!-- Grid sutil de pontos dithered ao fundo -->
        <div class="bg-dot-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"></div>

        <div class="animate-rise relative">
          @if (currentFeature().image) {
            <!-- Imagem real opcional -->
            <img
              [src]="currentFeature().image!.url"
              [alt]="currentFeature().image!.alt"
              class="block w-full rounded-xl border border-input shadow-card"
              loading="lazy"
            />
          } @else {
            <!-- Janela desktop ilustrativa do WingetEasy -->
            <div class="overflow-hidden rounded-xl border border-input bg-background shadow-card">
              <!-- Barra de título interna -->
              <div class="flex items-center gap-2.5 sm:gap-3 border-b border-border px-3 sm:px-4 py-2.5 sm:py-3">
                <img src="wingeteasy-logo.png" alt="" width="20" height="14" class="h-3.5 w-auto shrink-0" />
                <p class="min-w-0 flex-1 truncate text-xs sm:text-[14px] font-medium">{{ currentFeature().preview.title }}</p>
                <span class="rounded-full border border-border px-2 py-0.5 font-mono text-[10.5px] sm:text-[11.5px] text-subtle shrink-0">
                  {{ currentFeature().preview.badge }}
                </span>
              </div>

              <!-- Lista de linhas de status / preview da ação -->
              <ul class="space-y-1 p-2 sm:p-3">
                @for (row of currentFeature().preview.rows.slice(0, 4); track $index; let idx = $index) {
                  <li
                    class="animate-rise flex items-start sm:items-center gap-2.5 sm:gap-3 rounded-lg px-2.5 sm:px-3 py-2 sm:py-3 text-xs sm:text-[14px] leading-snug odd:bg-surface/60"
                    [style.animation-delay]="(120 + idx * 90) + 'ms'"
                  >
                    <lucide-icon
                      [img]="row.icon"
                      [class]="'size-3.5 sm:size-4 shrink-0 mt-0.5 sm:mt-0 ' + toneClass(row.tone)"
                    ></lucide-icon>
                    <span class="text-subtle break-words min-w-0">
                      <app-rich-text [text]="row.text"></app-rich-text>
                    </span>
                  </li>
                }
              </ul>
            </div>
          }

          <!-- Ritmo de execução / Cadence na base do card -->
          <p class="mt-4 sm:mt-5 text-center font-mono text-[11px] sm:text-[12px] text-muted-foreground">{{ currentFeature().cadence }}</p>
        </div>
      </div>
    </div>
  `
})
export class FeatureShowcaseComponent implements OnInit, OnDestroy {
  readonly features = FEATURES;
  readonly ArrowRightIcon = ArrowRight;
  readonly autoMs = 8000;

  active = signal<number>(0);
  auto = signal<boolean>(true);
  private timer: any;

  currentFeature = () => this.features[this.active()] ?? this.features[0];

  ngOnInit() {
    this.startAutoRotation();
  }

  ngOnDestroy() {
    this.stopAutoRotation();
  }

  select(index: number) {
    this.auto.set(false);
    this.stopAutoRotation();
    this.active.set(index);
  }

  private startAutoRotation() {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this.timer = setInterval(() => {
      if (this.auto()) {
        this.active.update(v => (v + 1) % this.features.length);
      }
    }, this.autoMs);
  }

  private stopAutoRotation() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  toneClass(tone?: FeatureRow['tone']): string {
    switch (tone) {
      case 'ok':
        return 'text-success';
      case 'warn':
        return 'text-spark';
      case 'err':
        return 'text-destructive';
      case 'muted':
        return 'text-muted-foreground';
      default:
        return 'text-subtle';
    }
  }
}
