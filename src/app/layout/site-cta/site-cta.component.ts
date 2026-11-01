/**
 * ==============================================================================
 * BANNER DE FECHAMENTO CTA RESPONSIVO (site-cta.component.ts)
 * ==============================================================================
 * O que é:
 *   Bloco final de chamada de ação do WingetEasy com o efeito do PixelPlanet
 *   e PixelStars no fundo.
 *
 * Melhorias de Responsividade:
 *   - Em smartphones e tablets:
 *     * Ajusta padding vertical de 144px (`py-36 md:py-44`) para `py-20 sm:py-28 md:py-44`.
 *     * Tipografia fluida no título (`text-2xl sm:text-4xl md:text-5xl`).
 *     * Botões empilháveis em telas estreitas para evitar overflow horizontal (`flex-col sm:flex-row`).
 *     * Tamanho do logo proporcional em telas menores.
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Download } from 'lucide-angular';
import { SITE } from '../../core/constants/site';
import { CopyButtonComponent } from '../../shared/components/copy-button/copy-button.component';
import { PixelPlanetComponent } from '../../shared/canvas/pixel-planet/pixel-planet.component';
import { PixelStarsComponent } from '../../shared/canvas/pixel-stars/pixel-stars.component';

@Component({
  selector: 'app-site-cta',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    CopyButtonComponent,
    PixelPlanetComponent,
    PixelStarsComponent
  ],
  template: `
    <section class="relative overflow-hidden border-t border-border">
      <!-- Fundo de estrelas dithered com estrelas cadentes desativadas para contraste limpo -->
      <app-pixel-stars [seed]="19" [shooting]="false" class="pointer-events-none absolute inset-0 h-full w-full"></app-pixel-stars>

      <!-- Fundo do Planeta Esférico em Pixels -->
      <app-pixel-planet class="pointer-events-none absolute inset-0 h-full w-full opacity-50 sm:opacity-60 md:opacity-90"></app-pixel-planet>

      <div class="relative mx-auto flex max-w-[1200px] flex-col items-start gap-6 sm:gap-8 px-4 sm:px-6 md:px-8 py-20 sm:py-28 md:py-40">
        <!-- Logo WingetEasy -->
        <img src="wingeteasy-logo.png" alt="Logo WingetEasy" width="88" height="57" class="h-14 sm:h-18 w-auto object-contain" />

        <!-- Título de impacto -->
        <h2 class="max-w-2xl text-2xl sm:text-4xl md:text-5xl font-semibold leading-[1.08] tracking-display">
          Deixe o winget trabalhar. Você só escolhe os apps.
        </h2>

        <!-- Ações -->
        <div class="flex flex-col sm:flex-row flex-wrap gap-3 w-full sm:w-auto">
          <a
            routerLink="/"
            fragment="instalar"
            class="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm sm:text-base font-medium text-primary-foreground hover:bg-primary/85 transition-colors cursor-pointer select-none [&_svg]:size-[18px] w-full sm:w-auto"
          >
            <lucide-icon [img]="DownloadIcon" class="size-[18px]"></lucide-icon>
            Baixar para Windows
          </a>

          <app-copy-button
            variant="pillOutline"
            size="xl"
            [value]="site.installCommand"
            label="Copiar comando de instalação"
            class="w-full sm:w-auto"
          >
          </app-copy-button>
        </div>
      </div>
    </section>
  `
})
export class SiteCtaComponent {
  readonly site = SITE;
  readonly DownloadIcon = Download;
}
