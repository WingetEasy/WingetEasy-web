/**
 * ==============================================================================
 * PÁGINA INICIAL / LANDING PAGE (home.component.ts)
 * ==============================================================================
 * O que é:
 *   Componente da Landing Page principal (`/`), contendo o banner Hero do WingetEasy,
 *   a seção Recursos (FeatureShowcase) e a seção Como Funciona (UpdatePipeline).
 *
 * O que faz:
 *   - 1. Hero: Banner de impacto com a Pixel Nebula e a ilustração HeroTransform.
 *   - 2. Recursos (#recursos): Showcase com os 6 módulos do app e rotação automática.
 *   - 3. Como funciona (#como-funciona): Divisor com a PixelBand (fita de dados ondulante),
 *        régua temporal de 6 etapas e live trace de console simulado.
 *
 * Como alterar caso queira:
 *   - Mudar textos ou descrições: Ajuste as tags `<app-section-header>` correspondentes.
 *   - Ajustar sementes gráficas do Canvas: Mude o `seed` nos componentes `<app-pixel-nebula>` ou `<app-pixel-band>`.
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Download, ArrowUpRight } from 'lucide-angular';
import { SITE } from '../../core/constants/site';
import { PixelNebulaComponent } from '../../shared/canvas/pixel-nebula/pixel-nebula.component';
import { PixelBandComponent } from '../../shared/canvas/pixel-band/pixel-band.component';
import { CopyButtonComponent } from '../../shared/components/copy-button/copy-button.component';
import { SectionHeaderComponent } from '../../shared/components/section-header/section-header.component';
import { HeroTransformComponent } from './components/hero-transform/hero-transform.component';
import { FeatureShowcaseComponent } from './components/feature-showcase/feature-showcase.component';
import { UpdatePipelineComponent } from './components/update-pipeline/update-pipeline.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    PixelNebulaComponent,
    PixelBandComponent,
    CopyButtonComponent,
    SectionHeaderComponent,
    HeroTransformComponent,
    FeatureShowcaseComponent,
    UpdatePipelineComponent
  ],
  template: `
    <!-- ========================================== -->
    <!-- 1. HERO BANNER PRINCIPAL                   -->
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

    <!-- ========================================== -->
    <!-- 2. SEÇÃO RECURSOS (#recursos)              -->
    <!-- ========================================== -->
    <section id="recursos" class="relative scroll-mt-20">
      <!-- Fundo de poeira de pixels ancorado à direita (mais brilhante) -->
      <app-pixel-nebula
        anchor="right"
        [seed]="13"
        class="pointer-events-none absolute inset-x-0 top-0 h-[720px] w-full opacity-80 md:opacity-100"
      ></app-pixel-nebula>

      <div class="relative mx-auto max-w-[1200px] px-5 py-36 md:px-8 md:py-44">
        <app-section-header
          eyebrow="Recursos"
          title="Pronto para o seu dia a dia"
          body="Seis módulos que cobrem o que o winget sozinho não cobre."
        ></app-section-header>

        <div class="mt-20">
          <app-feature-showcase></app-feature-showcase>
        </div>
      </div>
    </section>

    <!-- ========================================== -->
    <!-- 3. SEÇÃO COMO FUNCIONA (#como-funciona)    -->
    <!-- ========================================== -->
    <section id="como-funciona" class="relative scroll-mt-20 border-t border-border">
      <!-- Fita ondulada de pixels dithered atuando como divisor animado -->
      <app-pixel-band [seed]="3" class="pointer-events-none absolute inset-x-0 top-0 h-20 w-full"></app-pixel-band>

      <div class="relative mx-auto max-w-[1200px] px-5 py-36 md:px-8 md:py-44">
        <app-section-header
          eyebrow="Como funciona"
          title="Do clique ao histórico, em seis etapas"
          body="O que acontece quando você aperta “Atualizar Selecionados”. Passe o mouse para pausar ou clique numa etapa."
        ></app-section-header>

        <div class="mt-16">
          <app-update-pipeline></app-update-pipeline>
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
