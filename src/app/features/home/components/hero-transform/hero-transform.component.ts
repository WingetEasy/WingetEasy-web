/**
 * ==============================================================================
 * ANIMAÇÃO HERO TRANSFORM (hero-transform.component.ts)
 * ==============================================================================
 * O que é:
 *   Ilustração técnica interativa do Hero que demonstra o propósito do WingetEasy:
 *   transformar o processo manual de linha de comando no terminal em um fluxo automatizado
 *   e amigável de um clique ("Tudo atualizado").
 *
 * Ajustes de Responsividade:
 *   - Em smartphones e telas estreitas:
 *     * Ambos os cards (PowerShell e Status) usam max-w-full com box-sizing restrito para nunca transbordar.
 *     * Textos e saídas utilizam quebra e truncamento inteligente (`truncate` e fonte compacta).
 *     * O container da grade de botões finais adota flex-wrap suave em larguras menores que 380px.
 */

import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Check } from 'lucide-angular';

// Linhas que são digitadas/exibidas na janela simulada do PowerShell
const TERMINAL = [
  { prompt: true, text: 'winget upgrade' },
  { prompt: false, text: 'Nome                Id                       Versão    Disponível' },
  { prompt: false, text: 'Google Chrome       Google.Chrome            129.0     130.0' },
  { prompt: false, text: 'Visual Studio Code  Microsoft.VisualStudio…  1.94.2    1.95.0' },
] as const;

// Siglas dos programas que aparecem no card final
const APPS = ['Ch', 'VS', '.N', 'PT'] as const;

// Constantes de temporização para controle da máquina de estados visual
const T_TYPE = TERMINAL.length;       // Linhas do terminal surgindo
const T_FLOW = T_TYPE + 2;            // Pulso atravessando o conector central
const T_DONE = T_FLOW + APPS.length;  // Atualização individual de cada app
const TOTAL = T_DONE + 5;             // Pausa no estado final antes de reiniciar

@Component({
  selector: 'app-hero-transform',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div
      class="animate-rise relative w-full max-w-[500px] overflow-hidden"
      style="animation-delay: 120ms"
      role="img"
      aria-label="Ilustração: a saída do winget no terminal vira um único botão e termina em 'Tudo atualizado'."
    >
      <!-- ========================================== -->
      <!-- 1. TERMINAL: O ESTADO ANTERIOR ("BEFORE")  -->
      <!-- ========================================== -->
      <div class="w-full sm:mr-auto sm:w-[88%] overflow-hidden rounded-xl border border-border bg-surface/80 shadow-card backdrop-blur">
        <!-- Barra de título do PowerShell com botões de janela simulados -->
        <div class="flex items-center gap-2 border-b border-border px-3.5 sm:px-4 py-2 sm:py-2.5">
          <span class="flex gap-1.5">
            <span class="size-2 rounded-full bg-border"></span>
            <span class="size-2 rounded-full bg-border"></span>
            <span class="size-2 rounded-full bg-border"></span>
          </span>
          <span class="font-mono text-[10.5px] sm:text-[11px] text-muted-foreground">PowerShell</span>
        </div>
        <!-- Conteúdo do comando e saída do terminal (sem overflow horizontal e sem estourar laterais) -->
        <pre class="overflow-hidden px-3 sm:px-4 py-3 sm:py-3.5 font-mono text-[8px] xs:text-[9.5px] sm:text-[10.5px] leading-[1.75] sm:leading-[1.85] text-muted-foreground">@for (l of terminal; track $index) {<div class="truncate transition-opacity duration-300" [class.opacity-100]="tick() > $index || finished()" [class.opacity-0]="tick() <= $index && !finished()">@if (l.prompt) {<span>PS&gt; </span><span class="text-foreground">{{ l.text }}</span>} @else {{{ l.text }}}</div>}</pre>
      </div>

      <!-- ========================================== -->
      <!-- 2. CONECTOR COM O NÓ CENTRAL (WINGETEASY)  -->
      <!-- ========================================== -->
      <div class="relative mx-auto flex h-24 sm:h-36 w-full items-center justify-center">
        <!-- Linha vertical pontilhada -->
        <div class="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 border-l border-dashed border-input"></div>

        <!-- Partícula de pulso em trânsito -->
        @if (flowing()) {
          <span
            class="animate-travel absolute left-1/2 top-0 size-1.5 -translate-x-1/2 rounded-full bg-spark shadow-[0_0_12px_var(--spark)]"
          ></span>
        }

        <!-- Ícone central com borda brilhante animada -->
        <div
          class="relative flex size-13 sm:size-16 items-center justify-center rounded-2xl border bg-background transition-all duration-500"
          [class.border-brand-cyan/70]="flowing() || updating()"
          [class.shadow-[0_0_0_8px_color-mix(in_oklab,var(--brand-cyan)_12%,transparent),0_0_40px_color-mix(in_oklab,var(--brand-blue)_35%,transparent)]]="flowing() || updating()"
          [class.border-input]="!flowing() && !updating()"
        >
          <img src="wingeteasy-logo.png" alt="WingetEasy Logo" width="36" height="36" class="size-7 sm:size-9 object-contain" />
        </div>
        <span class="absolute left-[calc(50%+2.2rem)] sm:left-[calc(50%+3rem)] font-mono text-[10px] sm:text-[11px] text-muted-foreground whitespace-nowrap">sem terminal</span>
      </div>

      <!-- ========================================== -->
      <!-- 3. RESULTADO: A INTERFACE NATIVA ("AFTER") -->
      <!-- ========================================== -->
      <div class="w-full sm:ml-auto sm:w-[88%] rounded-xl border border-input bg-surface p-3.5 sm:p-5 shadow-card">
        <div class="flex items-center gap-3 sm:gap-4">
          <!-- Círculo indicador de status (contador, spinner ou check de conclusão) -->
          <span
            class="flex size-9 sm:size-11 shrink-0 items-center justify-center rounded-full border transition-colors duration-500"
            [class.border-success/60]="finished()"
            [class.bg-success/15]="finished()"
            [class.text-success]="finished()"
            [class.border-border]="!finished()"
            [class.text-muted-foreground]="!finished()"
          >
            @if (finished()) {
              <lucide-icon [img]="CheckIcon" class="size-4 sm:size-5" [strokeWidth]="2.5"></lucide-icon>
            } @else if (updating()) {
              <span class="size-3.5 sm:size-4 animate-spin rounded-full border-2 border-brand-cyan/25 border-t-brand-cyan"></span>
            } @else {
              <span class="font-mono text-[13px] sm:text-[15px] font-semibold text-foreground">{{ apps.length }}</span>
            }
          </span>
          <div class="min-w-0">
            <p class="text-[15px] sm:text-[19px] font-semibold tracking-tight truncate">
              @if (finished()) {
                Tudo atualizado
              } @else if (updating()) {
                Atualizando {{ doneCount() + 1 }} de {{ apps.length }}
              } @else {
                {{ apps.length }} atualizações
              }
            </p>
            <p class="mt-0.5 text-[11px] sm:text-[13px] text-muted-foreground truncate">
              @if (finished()) {
                Nenhum comando digitado.
              } @else {
                Um clique em Atualizar Tudo.
              }
            </p>
          </div>
        </div>

        <!-- Grade de ícones dos programas com badges de conclusão e botão de ação -->
        <div class="mt-3.5 sm:mt-5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2">
          <div class="flex items-center gap-1.5 sm:gap-2">
            @for (a of apps; track a; let i = $index) {
              <span
                class="relative flex size-7 sm:size-10 items-center justify-center rounded-lg border font-mono text-[10px] sm:text-[11.5px] transition-colors duration-500"
                [class.border-success/40]="i < doneCount()"
                [class.bg-success/10]="i < doneCount()"
                [class.text-foreground]="i < doneCount()"
                [class.border-border]="i >= doneCount()"
                [class.bg-surface-raised]="i >= doneCount()"
                [class.text-muted-foreground]="i >= doneCount()"
              >
                {{ a }}
                @if (i < doneCount()) {
                  <span class="absolute -bottom-1 -right-1 flex size-3 sm:size-4 items-center justify-center rounded-full bg-success text-success-foreground">
                    <lucide-icon [img]="CheckIcon" class="size-2 sm:size-2.5" [strokeWidth]="3"></lucide-icon>
                  </span>
                }
              </span>
            }
          </div>

          <!-- Botão de ação "Atualizar Tudo" / "Concluído" -->
          <span
            class="shrink-0 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-[13px] font-medium transition-all duration-300"
            [class.border]="finished()"
            [class.border-border]="finished()"
            [class.text-muted-foreground]="finished()"
            [class.bg-primary]="!finished()"
            [class.text-primary-foreground]="!finished()"
            [class.ring-4]="flowing()"
            [class.ring-primary/20]="flowing()"
          >
            {{ finished() ? 'Concluído' : 'Atualizar Tudo' }}
          </span>
        </div>
      </div>
    </div>
  `
})
export class HeroTransformComponent implements OnInit, OnDestroy {
  readonly terminal = TERMINAL;
  readonly apps = APPS;
  readonly CheckIcon = Check;

  // Contador de passos da animação
  tick = signal<number>(T_DONE + 1);
  private timer: any;

  // Funções auxiliares de estado
  flowing = () => this.tick() >= T_TYPE && this.tick() < T_FLOW;
  updating = () => this.tick() >= T_FLOW && this.tick() < T_DONE;
  finished = () => this.tick() >= T_DONE;
  doneCount = () => {
    if (this.finished()) return APPS.length;
    if (this.updating()) return this.tick() - T_FLOW;
    return 0;
  };

  ngOnInit() {
    // Inicia a animação periódica somente no browser do cliente
    if (typeof window !== 'undefined') {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      this.tick.set(0);
      this.timer = setInterval(() => {
        this.tick.update(v => (v + 1) % TOTAL);
      }, 750);
    }
  }

  ngOnDestroy() {
    // Evita vazamento de memória cancelando o intervalo ao sair do componente
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
