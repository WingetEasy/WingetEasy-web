/**
 * ==============================================================================
 * TEASER DE ARQUITETURA (architecture-teaser.component.ts)
 * ==============================================================================
 * O que é:
 *   Painel comparativo e técnico exibido na Landing Page com a prévia da arquitetura
 *   do WingetEasy (.NET 10, C# 14, WinUI 3, Clean Architecture e EF Core).
 *
 * O que faz:
 *   - Lado esquerdo: Demonstração da eficiência de memória com o `MemoryPixelsComponent`
 *     (alternando entre janela aberta e modo bandeja), com botões que direcionam
 *     para `/arquitetura` e `/documentacao`.
 *   - Lado direito: Diagrama de camadas (Blueprint) com as 3 camadas da solução:
 *     1. `WingetEasy.App` (WinUI 3, XAML, MVVM)
 *     2. `WingetEasy.Core` (Contratos e serviços de domínio)
 *     3. `WingetEasy.Data` (SQLite WAL, EF Core)
 *     Além dos 4 modos de execução de um único executável (Desktop, Bandeja, Headless, Worker UAC).
 *
 * Como alterar caso queira:
 *   - Atualizar camadas ou módulos: Modifique os arrays `LAYERS` ou `MODES`.
 *   - Ajustar textos ou botões: Edite os templates correspondentes.
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, ArrowRight, ArrowDown } from 'lucide-angular';
import { MemoryPixelsComponent } from '../../../../shared/canvas/memory-pixels/memory-pixels.component';

export const LAYERS = [
  {
    name: 'WingetEasy.App',
    role: 'Apresentação · WinUI 3',
    items: ['Views XAML', 'ViewModels MVVM', 'H.NotifyIcon', 'Diálogos'],
  },
  {
    name: 'WingetEasy.Core',
    role: 'Domínio · 12 contratos',
    items: ['WingetService', 'UpdateService', 'BackupService', 'AdminElevationHelper'],
  },
  {
    name: 'WingetEasy.Data',
    role: 'Persistência · EF Core',
    items: ['SQLite WAL', 'IDbContextFactory', '6 repositórios'],
  },
];

export const MODES = [
  ['Desktop', 'sem argumentos'],
  ['Bandeja', '--minimized'],
  ['Headless', '--check · --update-all · --backup · --restore'],
  ['Worker UAC', '--elevated-update'],
];

@Component({
  selector: 'app-architecture-teaser',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, MemoryPixelsComponent],
  template: `
    <div class="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
      <!-- ========================================== -->
      <!-- 1. HISTÓRIA DE CONSUMO DE MEMÓRIA         -->
      <!-- ========================================== -->
      <div class="flex flex-col">
        <div class="relative overflow-hidden rounded-2xl border border-border bg-surface p-7 shadow-card md:p-9">
          <app-memory-pixels></app-memory-pixels>
          <p class="mt-8 border-t border-border pt-6 leading-relaxed text-subtle">
            Ao fechar a janela, o WingetEasy descarta a interface, compacta a memória e continua só na bandeja.
          </p>
        </div>

        <!-- Links para as páginas completas -->
        <div class="mt-6 flex flex-wrap gap-3">
          <a
            routerLink="/arquitetura"
            class="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 text-base font-medium text-primary-foreground hover:bg-primary/85 transition-colors cursor-pointer select-none [&_svg]:size-[18px]"
          >
            Ver arquitetura completa
            <lucide-icon [img]="ArrowRightIcon" class="size-[18px]"></lucide-icon>
          </a>
          <a
            routerLink="/documentacao"
            class="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-input bg-surface/60 px-5 text-base font-medium text-foreground backdrop-blur hover:bg-surface-raised transition-colors cursor-pointer select-none"
          >
            Ler a documentação
          </a>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- 2. BLUEPRINT DE CAMADAS DO PROJETO        -->
      <!-- ========================================== -->
      <div class="relative rounded-2xl border border-dashed border-input p-5 md:p-7">
        <div class="bg-dot-grid pointer-events-none absolute inset-0 rounded-2xl opacity-60"></div>

        <!-- Cantos técnicos em ciano decorativos -->
        <span class="pointer-events-none absolute -left-px -top-px size-3 rounded-tl-2xl border-l-2 border-t-2 border-brand-cyan/60"></span>
        <span class="pointer-events-none absolute -right-px -top-px size-3 rounded-tr-2xl border-r-2 border-t-2 border-brand-cyan/60"></span>
        <span class="pointer-events-none absolute -bottom-px -left-px size-3 rounded-bl-2xl border-b-2 border-l-2 border-brand-cyan/60"></span>
        <span class="pointer-events-none absolute -bottom-px -right-px size-3 rounded-br-2xl border-b-2 border-r-2 border-brand-cyan/60"></span>

        <div class="relative">
          <p class="font-mono text-[11.5px] text-muted-foreground">WingetEasy.sln · .NET 10 · C# 14</p>

          <!-- Lista de Camadas -->
          <div class="mt-4">
            @for (l of layers; track l.name; let i = $index) {
              <div>
                <div class="rounded-xl border border-border bg-background/95 p-5 backdrop-blur">
                  <div class="flex flex-wrap items-baseline justify-between gap-2">
                    <p class="font-mono text-[15px] font-medium text-foreground">{{ l.name }}</p>
                    <p class="text-[13px] text-muted-foreground">{{ l.role }}</p>
                  </div>
                  <div class="mt-3 flex flex-wrap gap-1.5">
                    @for (it of l.items; track it) {
                      <span class="rounded-md border border-border bg-surface px-2 py-0.5 font-mono text-[11.5px] text-subtle">
                        {{ it }}
                      </span>
                    }
                  </div>
                </div>

                @if (i < layers.length - 1) {
                  <div class="flex items-center justify-center gap-2 py-2 font-mono text-[11px] text-muted-foreground">
                    <lucide-icon [img]="ArrowDownIcon" class="size-3.5 text-brand-violet"></lucide-icon>
                    {{ i === 0 ? 'depende de interfaces' : 'implementa contratos' }}
                  </div>
                }
              </div>
            }
          </div>

          <!-- Modos de execução do executável único -->
          <div class="mt-5 rounded-xl border border-border bg-background/95 p-4 backdrop-blur">
            <p class="font-mono text-[11.5px] uppercase tracking-[0.14em] text-muted-foreground">
              Um executável, quatro modos
            </p>
            <div class="mt-3 grid grid-cols-2 gap-2">
              @for (m of modes; track m[0]) {
                <div class="rounded-lg border border-border bg-surface px-3 py-2">
                  <p class="text-[13.5px] font-medium">{{ m[0] }}</p>
                  <p class="font-mono text-[11px] leading-snug text-muted-foreground">{{ m[1] }}</p>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ArchitectureTeaserComponent {
  readonly layers = LAYERS;
  readonly modes = MODES;
  readonly ArrowRightIcon = ArrowRight;
  readonly ArrowDownIcon = ArrowDown;
}

