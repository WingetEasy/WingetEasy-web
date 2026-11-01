/**
 * ==============================================================================
 * PÁGINA INICIAL / LANDING PAGE COMPLETA RESPONSIVA (home.component.ts)
 * ==============================================================================
 * O que é:
 *   Landing Page oficial do WingetEasy com todas as seções integradas:
 *   1. Hero Banner: Título, CTA, Pixel Nebula e animação HeroTransform
 *   2. Recursos (#recursos): Showcase com os 6 módulos do app
 *   3. Como funciona (#como-funciona): Divisor PixelBand, régua de etapas e console trace
 *   4. Arquitetura (#arquitetura): Pixel Nebula, comparativo de memória RAM e Blueprint
 *   5. Instalação (#instalacao / #instalar): Comandos winget, releases Velopack, build git e requisitos
 *   6. FAQ (#faq): Perguntas frequentes com sanfona/accordion nativo
 *   7. Site CTA: Planeta esférico (PixelPlanet) e fechamento
 *   8. Site Footer: Rodapé oficial
 *
 * Melhorias de Responsividade para Celulares e Tablets:
 *   - Espaçamento vertical equilibrado (`py-20 sm:py-28 md:py-44` em vez de valores excessivos).
 *   - Tipografia fluida em títulos (`text-3xl sm:text-5xl md:text-[3.6rem]`).
 *   - Botões com adaptação para toque em telas móveis.
 *   - Grids e blocos de código com rolagem horizontal controlada e sem quebras de layout.
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Download, ArrowUpRight } from 'lucide-angular';
import { SITE } from '../../core/constants/site';
import { PixelNebulaComponent } from '../../shared/canvas/pixel-nebula/pixel-nebula.component';
import { PixelBandComponent } from '../../shared/canvas/pixel-band/pixel-band.component';
import { PixelStarsComponent } from '../../shared/canvas/pixel-stars/pixel-stars.component';
import { CopyButtonComponent } from '../../shared/components/copy-button/copy-button.component';
import { SectionHeaderComponent } from '../../shared/components/section-header/section-header.component';
import { AccordionComponent, FaqItem } from '../../shared/components/accordion/accordion.component';
import { GithubIconComponent } from '../../shared/components/button/github-icon.component';
import { HeroTransformComponent } from './components/hero-transform/hero-transform.component';
import { FeatureShowcaseComponent } from './components/feature-showcase/feature-showcase.component';
import { UpdatePipelineComponent } from './components/update-pipeline/update-pipeline.component';
import { ArchitectureTeaserComponent } from './components/architecture-teaser/architecture-teaser.component';
import { SiteCtaComponent } from '../../layout/site-cta/site-cta.component';
import { SiteFooterComponent } from '../../layout/site-footer/site-footer.component';

export const REQUIREMENTS = [
  ['Sistema operacional', 'Windows 10 build 19041 ou superior, Windows 11'],
  ['Runtime', '.NET 10 e Windows App SDK (WinUI 3)'],
  ['Gerenciador', 'WinGet via App Installer, atualizado pela Microsoft Store'],
  ['Dados locais', 'SQLite (EF Core) em modo WAL, no perfil do usuário'],
  ['Memória em segundo plano', 'Cerca de 7 a 15 MB com o app na bandeja'],
];

export const FAQ: FaqItem[] = [
  {
    q: 'O WingetEasy substitui o winget?',
    a: 'Não. Ele é uma interface gráfica nativa sobre o winget: as atualizações continuam sendo feitas pelo gerenciador oficial da Microsoft, usando os mesmos manifestos e fontes.',
  },
  {
    q: 'Por que .NET 10 e WinUI 3?',
    a: 'WinUI 3 é o framework de interface mais recente da Microsoft para apps desktop, com controles Fluent, Mica e integração com o sistema. O .NET 10 com C# 14 traz desempenho e suporte de longo prazo.',
  },
  {
    q: 'Preciso de privilégios de administrador?',
    a: 'Não para usar o app. Quando algum pacote exige administrador, o WingetEasy junta todos esses pacotes e pede um único consentimento do UAC, num processo separado — o aplicativo principal nunca roda elevado.',
  },
  {
    q: 'Consigo migrar meus apps para outro computador?',
    a: 'Sim. Crie um snapshot na máquina de origem e restaure na de destino escolhendo os programas, exporte um script PowerShell (.ps1) ou transforme o snapshot num perfil reutilizável.',
  },
  {
    q: 'O projeto é open source?',
    a: 'O código-fonte está disponível no repositório do GitHub, onde você também pode acompanhar issues, releases e contribuir.',
  },
];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    PixelNebulaComponent,
    PixelBandComponent,
    PixelStarsComponent,
    CopyButtonComponent,
    SectionHeaderComponent,
    AccordionComponent,
    GithubIconComponent,
    HeroTransformComponent,
    FeatureShowcaseComponent,
    UpdatePipelineComponent,
    ArchitectureTeaserComponent,
    SiteCtaComponent,
    SiteFooterComponent
  ],
  template: `
    <!-- ========================================== -->
    <!-- 1. HERO BANNER PRINCIPAL                   -->
    <!-- ========================================== -->
    <section class="relative flex min-h-[calc(100svh-4rem)] items-center">
      <!-- Fundo em Canvas: Nebulosa de Pixels -->
      <div class="pointer-events-none absolute inset-x-0 top-0 h-[420px] sm:h-[500px] opacity-40 md:h-[540px] md:opacity-100">
        <app-pixel-nebula class="animate-fade h-full w-full"></app-pixel-nebula>
      </div>

      <!-- Grade de Conteúdo do Hero -->
      <div class="relative mx-auto grid w-full max-w-[1200px] grid-cols-[minmax(0,1fr)] items-center gap-10 sm:gap-16 px-4 sm:px-6 md:px-8 pb-16 sm:pb-24 pt-10 sm:pt-16 md:pt-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12 lg:pt-24">
        
        <!-- Coluna da Esquerda: Textos de Impacto e Botões de Ação -->
        <div class="animate-rise min-w-0 max-w-[600px]">
          <!-- Título Principal -->
          <h1 class="text-3xl sm:text-5xl md:text-[3.6rem] font-semibold leading-[1.05] tracking-display">
            Atualizações do Windows, sem terminal
          </h1>

          <!-- Descrição Técnica -->
          <p class="mt-4 sm:mt-7 text-base sm:text-xl leading-[1.55] text-subtle">
            O WingetEasy mantém todos os seus apps em dia com o poder do winget, numa interface nativa WinUI 3
            em .NET 10 — detecta apps abertos, guarda snapshots da máquina e fica na bandeja gastando quase nada
            de memória.
          </p>

          <!-- Ações Principais (Baixar e Copiar comando) -->
          <div class="mt-7 sm:mt-9 flex flex-col sm:flex-row flex-wrap gap-3">
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

          <!-- Link Secundário para o Repositório GitHub -->
          <a
            [href]="site.githubUrl"
            target="_blank"
            rel="noreferrer"
            class="mt-6 sm:mt-7 inline-flex items-center gap-1.5 text-sm sm:text-base text-muted-foreground transition-colors hover:text-foreground"
          >
            Prefere o código-fonte? Veja no GitHub
            <lucide-icon [img]="ArrowUpRightIcon" class="size-4"></lucide-icon>
          </a>
        </div>

        <!-- Coluna da Direita: Ilustração Interativa Hero Transform -->
        <div class="flex justify-center lg:justify-end w-full">
          <app-hero-transform></app-hero-transform>
        </div>
      </div>
    </section>

    <!-- ========================================== -->
    <!-- 2. SEÇÃO RECURSOS (#recursos)              -->
    <!-- ========================================== -->
    <section id="recursos" class="relative scroll-mt-20">
      <!-- Fundo de poeira de pixels ancorado à direita -->
      <app-pixel-nebula
        anchor="right"
        [seed]="13"
        class="pointer-events-none absolute inset-x-0 top-0 h-[720px] w-full opacity-60 md:opacity-100"
      ></app-pixel-nebula>

      <div class="relative mx-auto max-w-[1200px] px-4 sm:px-6 md:px-8 py-20 sm:py-28 md:py-40">
        <app-section-header
          eyebrow="Recursos"
          title="Pronto para o seu dia a dia"
          body="Seis módulos que cobrem o que o winget sozinho não cobre."
        ></app-section-header>

        <div class="mt-12 sm:mt-16 md:mt-20">
          <app-feature-showcase></app-feature-showcase>
        </div>
      </div>
    </section>

    <!-- ========================================== -->
    <!-- 3. SEÇÃO COMO FUNCIONA (#como-funciona)    -->
    <!-- ========================================== -->
    <section id="como-funciona" class="relative scroll-mt-20 border-t border-border">
      <!-- Fita ondulada de pixels dithered atuando como divisor animado -->
      <app-pixel-band [seed]="3" class="pointer-events-none absolute inset-x-0 top-0 h-16 sm:h-20 w-full"></app-pixel-band>

      <div class="relative mx-auto max-w-[1200px] px-4 sm:px-6 md:px-8 py-20 sm:py-28 md:py-40">
        <app-section-header
          eyebrow="Como funciona"
          title="Do clique ao histórico, em seis etapas"
          body="O que acontece quando você aperta “Atualizar Selecionados”. Passe o mouse para pausar ou clique numa etapa."
        ></app-section-header>

        <div class="mt-12 sm:mt-16">
          <app-update-pipeline></app-update-pipeline>
        </div>
      </div>
    </section>

    <!-- ========================================== -->
    <!-- 4. SEÇÃO ARQUITETURA (#arquitetura)        -->
    <!-- ========================================== -->
    <section id="arquitetura" class="relative scroll-mt-20 border-t border-border">
      <!-- Pixel Nebula ancorada no canto inferior direito -->
      <app-pixel-nebula
        anchor="bottom-right"
        [seed]="21"
        class="pointer-events-none absolute inset-0 h-full w-full opacity-40 md:opacity-85"
      ></app-pixel-nebula>

      <div class="relative mx-auto max-w-[1200px] px-4 sm:px-6 md:px-8 py-20 sm:py-28 md:py-40">
        <app-section-header
          eyebrow="Arquitetura"
          title="Leve por projeto, não por acaso"
          body="Três camadas, MVVM, SQLite em modo WAL e um cuidado obsessivo com memória. Um único executável que vira app, ícone de bandeja, ferramenta de linha de comando ou worker elevado."
        ></app-section-header>

        <div class="mt-12 sm:mt-16 md:mt-20">
          <app-architecture-teaser></app-architecture-teaser>
        </div>
      </div>
    </section>

    <!-- ========================================== -->
    <!-- 5. SEÇÃO INSTALAÇÃO (#instalacao / #instalar) -->
    <!-- ========================================== -->
    <section id="instalacao" class="relative scroll-mt-20 border-t border-border">
      <!-- Campo de estrelas com estrelas cadentes periódicas -->
      <app-pixel-stars class="pointer-events-none absolute inset-0 h-full w-full"></app-pixel-stars>

      <div class="relative mx-auto max-w-[1200px] px-4 sm:px-6 md:px-8 py-20 sm:py-28 md:py-40">
        <app-section-header
          eyebrow="Instalação"
          title="Instale e comece em minutos"
          body="Baixe pela página de releases ou, assim que o pacote estiver no repositório oficial, direto pelo winget."
        ></app-section-header>

        <div id="instalar" class="mt-10 sm:mt-14 grid scroll-mt-24 gap-5 lg:grid-cols-2">
          <!-- Terminal com comando Winget -->
          <div class="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
            <div class="flex items-center justify-between border-b border-border px-4 sm:px-5 py-2.5 sm:py-3">
              <span class="font-mono text-[11px] sm:text-[12px] text-subtle">PowerShell</span>
              <app-copy-button
                variant="ghost"
                [value]="site.installCommand"
              ></app-copy-button>
            </div>
            <pre class="overflow-x-auto px-4 sm:px-5 py-4 sm:py-5 font-mono text-[12px] sm:text-[13.5px] leading-6 sm:leading-7"><code><span class="text-muted-foreground">PS&gt; </span><span class="text-foreground">winget install</span> <span class="text-code-string">WingetEasy</span>
<span class="text-muted-foreground"># verificar sem abrir a janela</span>
<span class="text-muted-foreground">PS&gt; </span><span class="text-foreground">WingetEasy.App.exe</span> <span class="text-code-flag">--check</span></code></pre>
          </div>

          <!-- Card de Releases Velopack -->
          <div class="flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-card">
            <div>
              <p class="font-mono text-[11px] sm:text-[12px] text-subtle">Instalador</p>
              <p class="mt-2.5 sm:mt-3 text-xl sm:text-2xl font-semibold tracking-tight">GitHub Releases com Velopack</p>
              <p class="mt-2 text-sm sm:text-base leading-relaxed text-subtle">
                Baixe a versão mais recente com notas de versão. Depois de instalado, o WingetEasy se atualiza
                sozinho em segundo plano com pacotes delta.
              </p>
            </div>
            <div class="mt-5 sm:mt-6 flex flex-col sm:flex-row flex-wrap gap-3">
              <a
                [href]="site.releasesUrl"
                target="_blank"
                rel="noreferrer"
                class="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm sm:text-base font-medium text-primary-foreground hover:bg-primary/85 transition-colors cursor-pointer select-none [&_svg]:size-[18px] w-full sm:w-auto"
              >
                <lucide-icon [img]="DownloadIcon" class="size-[18px]"></lucide-icon>
                Ver releases
              </a>
              <a
                [href]="site.githubUrl"
                target="_blank"
                rel="noreferrer"
                class="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-input bg-surface/60 px-5 text-sm sm:text-base font-medium text-foreground backdrop-blur hover:bg-surface-raised transition-colors cursor-pointer select-none [&_svg]:size-[18px] w-full sm:w-auto"
              >
                <app-github-icon class="size-[18px]"></app-github-icon>
                Compilar do código
              </a>
            </div>
          </div>
        </div>

        <!-- Bloco de compilação a partir do código-fonte -->
        <div class="mt-5 overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
          <div class="border-b border-border px-4 sm:px-5 py-2.5 sm:py-3 font-mono text-[11px] sm:text-[12px] text-subtle">
            Compilar a partir do código-fonte
          </div>
          <pre class="overflow-x-auto px-4 sm:px-5 py-4 sm:py-5 font-mono text-[12px] sm:text-[13.5px] leading-6 sm:leading-7"><code><span class="text-foreground">git clone</span> <span class="text-code-string">https://github.com/vivad/WingetEasy.git</span>
<span class="text-foreground">cd</span> <span class="text-code-string">WingetEasy</span>
<span class="text-foreground">dotnet build</span> <span class="text-code-flag">src/WingetEasy.App -c Release</span></code></pre>
        </div>

        <!-- Tabela de Requisitos de Sistema -->
        <div id="requisitos" class="mt-12 sm:mt-16 scroll-mt-24">
          <h3 class="text-xl sm:text-2xl font-semibold tracking-tight">Requisitos de sistema</h3>
          <dl class="mt-4 sm:mt-6 divide-y divide-border overflow-hidden rounded-2xl border border-border">
            @for (r of requirements; track r[0]) {
              <div class="grid gap-1 bg-background px-4 sm:px-5 py-3.5 sm:py-4 sm:grid-cols-[220px_1fr] sm:gap-6">
                <dt class="font-mono text-xs sm:text-[13px] text-muted-foreground">{{ r[0] }}</dt>
                <dd class="text-xs sm:text-sm text-subtle leading-relaxed">{{ r[1] }}</dd>
              </div>
            }
          </dl>
        </div>
      </div>
    </section>

    <!-- ========================================== -->
    <!-- 6. SEÇÃO FAQ (#faq)                        -->
    <!-- ========================================== -->
    <section id="faq" class="relative scroll-mt-20 border-t border-border">
      <!-- Pixel Nebula ancorada no canto inferior esquerdo -->
      <app-pixel-nebula
        anchor="bottom-left"
        [seed]="31"
        class="pointer-events-none absolute inset-0 h-full w-full opacity-35 md:opacity-70"
      ></app-pixel-nebula>

      <div class="relative mx-auto grid max-w-[1200px] gap-8 sm:gap-12 px-4 sm:px-6 md:px-8 py-20 sm:py-28 md:py-40 lg:grid-cols-[0.8fr_1.2fr]">
        <app-section-header eyebrow="FAQ" title="Perguntas frequentes"></app-section-header>
        <app-accordion [items]="faq"></app-accordion>
      </div>
    </section>

    <!-- ========================================== -->
    <!-- 7. SITE CTA COM PLANETA ESFÉRICO EM PIXELS -->
    <!-- ========================================== -->
    <app-site-cta></app-site-cta>

    <!-- ========================================== -->
    <!-- 8. RODAPÉ OFICIAL                          -->
    <!-- ========================================== -->
    <app-site-footer></app-site-footer>
  `
})
export class HomeComponent {
  readonly site = SITE;
  readonly DownloadIcon = Download;
  readonly ArrowUpRightIcon = ArrowUpRight;
  readonly requirements = REQUIREMENTS;
  readonly faq = FAQ;
}
