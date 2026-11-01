/**
 * ==============================================================================
 * PÁGINA INICIAL / HERO SECTION (home.component.ts)
 * ==============================================================================
 * O que é:
 *   Componente da Landing Page principal (`/`), contendo o banner Hero do WingetEasy,
 *   a nebulosa em pixels no fundo e a ilustração comparativa (terminal vs UI nativa).
 *
 * O que faz:
 *   - Apresenta o título principal e a proposta de valor do projeto.
 *   - Integra o fundo dinâmico gerado em canvas (`PixelNebulaComponent`).
 *   - Fornece botão de download com link para a seção `#instalar`.
 *   - Oferece botão para copiar com um clique o comando `winget install WingetEasy`.
 *   - Link externo para o repositório open source no GitHub.
 *   - Exibe a animação transformacional `HeroTransformComponent`.
 *
 * Como alterar caso queira:
 *   - Mudar os textos principais: Edite as tags `<h1>` e `<p>` no template abaixo.
 *   - Mudar a posição da nebulosa: Ajuste o valor de `top-0` na `div` que envolve o `<app-pixel-nebula>`.
 *   - Mudar a altura do Hero: Ajuste a classe `min-h-[calc(100svh-4rem)]` da seção principal.
 *   - Adicionar novas seções (Features, Pipeline, FAQ, Footer): Basta incluir novos componentes abaixo da `<section>`.
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Download, ArrowUpRight } from 'lucide-angular';
import { SITE } from '../../core/constants/site';
import { PixelNebulaComponent } from '../../shared/canvas/pixel-nebula/pixel-nebula.component';
import { CopyButtonComponent } from '../../shared/components/copy-button/copy-button.component';
import { HeroTransformComponent } from './components/hero-transform/hero-transform.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    PixelNebulaComponent,
    CopyButtonComponent,
    HeroTransformComponent
  ],
  template: `
    <!-- ========================================== -->
    <!-- HERO BANNER PRINCIPAL                       -->
    <!-- ========================================== -->
    <section class="relative flex min-h-[calc(100svh-4rem)] items-center">
      <!-- Fundo em Canvas: Nebulosa de Pixels (encostada no Navbar através do top-0) -->
      <div class="pointer-events-none absolute inset-x-0 top-0 h-[500px] opacity-50 md:h-[540px] md:opacity-100">
        <app-pixel-nebula class="animate-fade h-full w-full"></app-pixel-nebula>
      </div>

      <!-- Grade de Conteúdo do Hero -->
      <div class="relative mx-auto grid w-full max-w-[1200px] grid-cols-[minmax(0,1fr)] items-center gap-16 px-5 pb-28 pt-20 md:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12 lg:pt-24">
        
        <!-- Coluna da Esquerda: Textos de Impacto e Botões de Ação -->
        <div class="animate-rise min-w-0 max-w-[600px]">
          <!-- Título Principal -->
          <h1 class="text-5xl font-semibold leading-[1.02] tracking-display md:text-[3.6rem]">
            Atualizações do Windows, sem terminal
          </h1>

          <!-- Descrição Técnica -->
          <p class="mt-7 text-xl leading-[1.55] text-subtle">
            O WingetEasy mantém todos os seus apps em dia com o poder do winget, numa interface nativa WinUI 3
            em .NET 10 — detecta apps abertos, guarda snapshots da máquina e fica na bandeja gastando quase nada
            de memória.
          </p>

          <!-- Ações Principais (Baixar e Copiar comando) -->
          <div class="mt-9 flex flex-wrap gap-3">
            <a
              routerLink="/"
              fragment="instalar"
              class="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 text-base font-medium text-primary-foreground hover:bg-primary/85 transition-colors cursor-pointer select-none [&_svg]:size-[18px]"
            >
              <lucide-icon [img]="DownloadIcon" class="size-[18px]"></lucide-icon>
              Baixar para Windows
            </a>

            <app-copy-button
              variant="pillOutline"
              size="xl"
              [value]="site.installCommand"
              label="Copiar comando de instalação"
            >
            </app-copy-button>
          </div>

          <!-- Link Secundário para o Repositório GitHub -->
          <a
            [href]="site.githubUrl"
            target="_blank"
            rel="noreferrer"
            class="mt-7 inline-flex items-center gap-1 text-base text-muted-foreground transition-colors hover:text-foreground"
          >
            Prefere o código-fonte? Veja no GitHub
            <lucide-icon [img]="ArrowUpRightIcon" class="size-4"></lucide-icon>
          </a>
        </div>

        <!-- Coluna da Direita: Ilustração Interativa Hero Transform -->
        <div class="flex justify-center lg:justify-end">
          <app-hero-transform></app-hero-transform>
        </div>
      </div>
    </section>
  `
})
export class HomeComponent {
  readonly site = SITE;
  readonly DownloadIcon = Download;
  readonly ArrowUpRightIcon = ArrowUpRight;
}
