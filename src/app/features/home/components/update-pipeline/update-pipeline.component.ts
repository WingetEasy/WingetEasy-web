/**
 * ==============================================================================
 * PIPELINE DE ATUALIZAÇÃO RESPONSIVO (update-pipeline.component.ts)
 * ==============================================================================
 * O que é:
 *   Componente interativo que demonstra o ciclo de vida completo de 6 etapas
 *   executado pelo WingetEasy ao acionar "Atualizar Selecionados".
 *
 * Melhorias de Responsividade:
 *   - Em smartphones e tablets:
 *     * A régua de etapas se ajusta harmoniosamente em 1 coluna (mobile estreito), 2 ou 3 colunas (tablet).
 *     * Mantém os números circulares perfeitamente alinhados com o texto.
 *     * O terminal/trace de saída suporta rolagem horizontal limpa sem estourar o layout da tela.
 *     * Padding e tipografia otimizados para toque (touch-friendly).
 */

import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export const STEPS = [
  { title: 'Verificar', call: 'WingetService', body: 'Roda winget upgrade e faz parsing posicional da saída, linha a linha.' },
  { title: 'Filtrar', call: 'UpdateLoopDetector', body: 'Descarta falsos positivos (Unknown, < 1.0) e pacotes adiados por você.' },
  { title: 'Pré-voo', call: 'RunningProcessService', body: 'Detecta apps abertos e pergunta: fechar e atualizar, ou pular.' },
  { title: 'Atualizar', call: 'UpdateService', body: 'Lote sem admin, com fases Baixando → Verificando → Instalando.' },
  { title: 'Elevar', call: 'AdminElevationHelper', body: 'O que pede admin vai junto, num único consentimento do UAC.' },
  { title: 'Registrar', call: 'UpdateHistoryRepository', body: 'Grava versão anterior → nova e mostra o resumo do lote.' },
] as const;

export type Line = { step: number; kind: 'cmd' | 'ok' | 'warn' | 'err' | 'out'; text: string };

export const LOG: Line[] = [
  { step: 0, kind: 'cmd', text: 'winget upgrade --accept-source-agreements' },
  { step: 0, kind: 'out', text: '5 pacotes encontrados em 3,2 s · 3 apps · 1 runtime · 1 segurança' },
  { step: 1, kind: 'warn', text: 'Discord.Discord   Unknown → 1.0.9170   já atualizado há < 24 h → adiados' },
  { step: 1, kind: 'out', text: '4 pacotes elegíveis' },
  { step: 2, kind: 'warn', text: 'chrome.exe em execução → usuário escolheu “Fechar e atualizar”' },
  { step: 2, kind: 'out', text: 'CloseMainWindow() · encerrado em 1,4 s' },
  { step: 3, kind: 'cmd', text: 'winget upgrade --id Google.Chrome --silent' },
  { step: 3, kind: 'ok', text: 'Baixando… Verificando integridade… Instalando…   exit 0' },
  { step: 3, kind: 'cmd', text: 'winget upgrade --id Microsoft.PowerToys --silent' },
  { step: 3, kind: 'ok', text: '0x8A15004E   reinício pendente (tratado como sucesso)' },
  { step: 3, kind: 'cmd', text: 'winget upgrade --id Zoom.Zoom --silent' },
  { step: 3, kind: 'err', text: '0x8A150014   requer administrador → elevatedQueue' },
  { step: 4, kind: 'cmd', text: 'WingetEasy.App.exe --elevated-update %TEMP%\\WingetEasy\\job_7f3a.json' },
  { step: 4, kind: 'ok', text: 'UAC: 1 consentimento · 1 pacote · result_7f3a.json lido e apagado' },
  { step: 5, kind: 'out', text: 'UpdateHistories += 4 registros (FromVersion → ToVersion)' },
  { step: 5, kind: 'ok', text: 'Resumo: 4 sucesso · 0 falha · 1 reinício pendente' },
];

@Component({
  selector: 'app-update-pipeline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div (mouseenter)="setPaused(true)" (mouseleave)="setPaused(false)">
      <!-- ========================================== -->
      <!-- 1. RÉGUA / TRACK DE ETAPAS DO PIPELINE     -->
      <!-- ========================================== -->
      <ol class="relative grid gap-3 sm:gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 lg:gap-0">
        <!-- Linha de fundo cinza de conexão entre as etapas (Desktop) -->
        <div class="pointer-events-none absolute left-[18px] right-[18px] top-[18px] hidden h-px bg-border lg:block"></div>

        <!-- Linha animada de progresso em cor ciano preenchendo até a etapa ativa -->
        <div
          class="pointer-events-none absolute left-[18px] top-[18px] hidden h-px bg-brand-cyan transition-[width] duration-700 lg:block"
          [style.width]="'calc((100% - 36px) * ' + (active() / (steps.length - 1)) + ')'"
        ></div>

        @for (s of steps; track s.title; let i = $index) {
          <li class="relative">
            <button
              type="button"
              (click)="setActive(i)"
              class="group flex w-full gap-3.5 sm:gap-4 rounded-xl p-2.5 sm:p-3 text-left transition-colors hover:bg-surface/50 lg:p-0 lg:hover:bg-transparent lg:block lg:pr-5 cursor-pointer"
              [attr.aria-current]="i === active() ? 'step' : undefined"
            >
              <!-- Círculo com o número da etapa -->
              <span
                class="relative z-10 flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-full border font-mono text-[11.5px] sm:text-[12px] transition-colors"
                [class.border-brand-cyan]="i === active()"
                [class.bg-background]="true"
                [class.text-brand-cyan]="i === active()"
                [class.shadow-[0_0_0_6px_color-mix(in_oklab,var(--brand-cyan)_14%,transparent)]]="i === active()"
                [class.border-brand-cyan/50]="i < active()"
                [class.text-subtle]="i < active()"
                [class.border-border]="i > active()"
                [class.text-muted-foreground]="i > active()"
                [class.group-hover:border-input]="i > active()"
              >
                {{ formatIndex(i) }}
              </span>

              <!-- Descrição da etapa -->
              <span class="block min-w-0 lg:mt-5">
                <span
                  class="block text-base sm:text-lg font-semibold tracking-tight transition-colors"
                  [class.text-foreground]="i === active()"
                  [class.text-subtle]="i !== active()"
                >
                  {{ s.title }}
                </span>
                <span
                  class="mt-0.5 sm:mt-1 block font-mono text-[11px] sm:text-[11.5px] transition-colors truncate"
                  [class.text-brand-cyan]="i === active()"
                  [class.text-muted-foreground]="i !== active()"
                >
                  {{ s.call }}
                </span>
                <span class="mt-1 sm:mt-2 block text-xs sm:text-[14px] leading-relaxed text-muted-foreground">{{ s.body }}</span>
              </span>
            </button>
          </li>
        }
      </ol>

      <!-- ========================================== -->
      <!-- 2. LIVE TRACE / CONSOLE DE LOG DA OPERAÇÃO -->
      <!-- ========================================== -->
      <div class="mt-8 sm:mt-12 overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        <!-- Barra de título do trace -->
        <div class="flex items-center gap-2 sm:gap-3 border-b border-border px-3.5 sm:px-5 py-2.5 sm:py-3 font-mono text-[11px] sm:text-[12px] text-subtle">
          <span class="flex gap-1.5 shrink-0">
            <span class="size-2 sm:size-2.5 rounded-full bg-border"></span>
            <span class="size-2 sm:size-2.5 rounded-full bg-border"></span>
            <span class="size-2 sm:size-2.5 rounded-full bg-border"></span>
          </span>
          <span class="truncate">trace · Atualizar Selecionados</span>
          <span class="ml-auto text-muted-foreground text-[10.5px] sm:text-[12px] shrink-0">
            etapa {{ active() + 1 }}/{{ steps.length }} · {{ steps[active()]?.title?.toLowerCase() }}
          </span>
        </div>

        <!-- Terminal de saída em tempo real com rolagem suave -->
        <pre class="overflow-x-auto px-4 py-4 sm:px-5 sm:py-5 font-mono text-[11px] sm:text-[12.5px] leading-[1.8] sm:leading-[1.9]"><code>@for (l of log; track $index) {<div
  class="-mx-4 sm:-mx-5 border-l-2 px-4 sm:px-5 transition-all duration-500"
  [class.border-brand-cyan]="l.step === active()"
  [class.bg-surface-raised/60]="l.step === active()"
  [class.opacity-100]="l.step === active()"
  [class.border-transparent]="l.step !== active()"
  [class.opacity-60]="l.step < active()"
  [class.opacity-20]="l.step > active()"
><span class="mr-2 sm:mr-3 inline-block w-[5.5rem] sm:w-[6.5rem] text-muted-foreground">[{{ steps[l.step]?.title?.toLowerCase() }}]</span>@if (l.kind === 'cmd') {<span class="text-muted-foreground">› </span>}<span [class]="getKindClass(l.kind)">{{ l.text }}</span></div>}</code></pre>
      </div>
    </div>
  `
})
export class UpdatePipelineComponent implements OnInit, OnDestroy {
  readonly steps = STEPS;
  readonly log = LOG;

  active = signal<number>(0);
  paused = signal<boolean>(false);
  private timer: any;

  ngOnInit() {
    this.startCycle();
  }

  ngOnDestroy() {
    this.stopCycle();
  }

  setActive(i: number) {
    this.active.set(i);
  }

  setPaused(state: boolean) {
    this.paused.set(state);
    if (state) {
      this.stopCycle();
    } else {
      this.startCycle();
    }
  }

  formatIndex(i: number): string {
    return String(i + 1).padStart(2, '0');
  }

  private startCycle() {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this.timer = setInterval(() => {
      if (!this.paused()) {
        this.active.update(v => (v + 1) % this.steps.length);
      }
    }, 2800);
  }

  private stopCycle() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  getKindClass(kind: Line['kind']): string {
    switch (kind) {
      case 'cmd':
        return 'text-foreground';
      case 'out':
        return 'text-subtle';
      case 'ok':
        return 'text-success';
      case 'warn':
        return 'text-spark';
      case 'err':
        return 'text-destructive';
    }
  }
}
