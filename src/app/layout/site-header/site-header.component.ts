/**
 * ==============================================================================
 * HEADER / NAVBAR DO SITE COM BUSCA INTELIGENTE E MENU MOBILE (site-header.component.ts)
 * ==============================================================================
 * O que é:
 *   Barra superior fixa com atalho global de busca Ctrl + K, suporte total
 *   a telas pequenas (smartphones e tablets) através de gaveta móvel (drawer),
 *   sem remover nenhuma opção ou funcionalidade.
 *
 * O que faz:
 *   - Menu Hamburguer responsivo em dispositivos móveis (< 768px):
 *     * Alterna drawer deslizante suave com todos os links da navegação.
 *     * Mantém links para Início, Recursos, Como Funciona, Arquitetura, Instalação, FAQ e GitHub.
 *     * Botão direto "Baixar para Windows" no menu móvel.
 *   - Modal de busca inteligente rápida (Ctrl+K ou toque):
 *     * Totalmente responsivo para teclados virtuais em smartphones (área com scroll, tamanho dinâmico).
 *     * Pesquisa por erros (0x8A150056), problemas cotidianos e capítulos técnicos.
 *   - Fecha automaticamente o menu ao navegar ou teclar ESC.
 */

import { Component, HostListener, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  LucideAngularModule,
  Search,
  AlertCircle,
  BookOpen,
  Layers,
  Compass,
  ArrowRight,
  CornerDownLeft,
  Menu,
  X,
  Download
} from 'lucide-angular';
import { SITE, NAV, NavItem } from '../../core/constants/site';
import { SEARCH_INDEX, SearchResultItem } from '../../core/constants/search-index';
import { GithubIconComponent } from '../../shared/components/button/github-icon.component';

@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, GithubIconComponent],
  template: `
    <header class="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div class="mx-auto flex h-16 max-w-[1440px] items-center gap-8 px-4 sm:px-6">
        <!-- Logotipo e Nome do Projeto -->
        <a routerLink="/" (click)="closeMobileMenu()" class="flex shrink-0 items-center gap-2.5">
          <img src="wingeteasy-logo.png" alt="WingetEasy" width="28" height="18" class="h-[22px] w-auto" />
          <span class="text-[15px] font-semibold tracking-tight">{{ site.name }}</span>
        </a>

        <!-- Links de Navegação (Telas Médias e Grandes: Tablet horizontal e Desktop) -->
        <nav class="hidden items-center gap-6 text-[15px] text-subtle md:flex">
          @for (item of nav; track item.label) {
            @if (isHashItem(item)) {
              <a
                [routerLink]="['/']"
                [fragment]="item.hash"
                class="transition-colors hover:text-foreground"
              >
                {{ item.label }}
              </a>
            } @else {
              <a
                [routerLink]="[item.to]"
                routerLinkActive="text-foreground"
                class="transition-colors hover:text-foreground"
              >
                {{ item.label }}
              </a>
            }
          }
        </nav>

        <!-- Ações do lado direito (Busca, GitHub, Baixar e Botão Mobile) -->
        <div class="ml-auto flex items-center gap-1.5 sm:gap-2 md:gap-3">
          <!-- Botão de busca estilo comando rápido (Desktop grande) -->
          <button
            type="button"
            (click)="openSearchModal()"
            class="hidden h-9 w-52 items-center gap-2 rounded-full border border-border bg-surface px-3 text-sm text-muted-foreground transition-colors hover:border-input hover:text-subtle xl:flex cursor-pointer"
          >
            <lucide-icon [img]="SearchIcon" class="size-4"></lucide-icon>
            <span>Buscar</span>
            <kbd class="ml-auto rounded-md border border-border bg-surface-raised px-1.5 py-0.5 font-sans text-[11px] text-subtle">
              Ctrl K
            </kbd>
          </button>

          <!-- Ícone de busca compacto (Mobile e Tablets) -->
          <button
            type="button"
            (click)="openSearchModal()"
            class="flex xl:hidden h-9 w-9 items-center justify-center rounded-full text-subtle hover:bg-surface-raised hover:text-foreground cursor-pointer transition-colors"
            aria-label="Buscar"
          >
            <lucide-icon [img]="SearchIcon" class="size-4"></lucide-icon>
          </button>

          <!-- Link do GitHub (sempre visível) -->
          <a
            [href]="site.githubUrl"
            target="_blank"
            rel="noreferrer"
            aria-label="Repositório no GitHub"
            class="flex h-9 w-9 items-center justify-center rounded-full text-subtle hover:bg-surface-raised hover:text-foreground transition-colors"
          >
            <app-github-icon class="size-5"></app-github-icon>
          </a>

          <!-- Botão de destaque "Baixar" (Desktop e Tablets) -->
          <a
            routerLink="/"
            fragment="instalar"
            class="hidden sm:inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/85 transition-colors cursor-pointer"
          >
            Baixar
          </a>

          <!-- Botão Hamburger para Mobile (< 768px) -->
          <button
            type="button"
            (click)="toggleMobileMenu()"
            class="flex md:hidden h-9 w-9 items-center justify-center rounded-full text-subtle hover:bg-surface-raised hover:text-foreground transition-colors cursor-pointer"
            [attr.aria-expanded]="mobileMenuOpen()"
            aria-label="Alternar menu de navegação"
          >
            <lucide-icon [img]="mobileMenuOpen() ? CloseIcon : MenuIcon" class="size-5"></lucide-icon>
          </button>
        </div>
      </div>

      <!-- Drawer / Menu Móvel Retrátil (Mobile e smartphones) -->
      @if (mobileMenuOpen()) {
        <div class="fixed inset-x-0 top-16 z-30 border-b border-border bg-background/95 backdrop-blur-xl md:hidden animate-fade shadow-2xl">
          <nav class="flex flex-col p-5 space-y-3 font-medium">
            <p class="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground px-2">Navegação</p>
            @for (item of nav; track item.label) {
              @if (isHashItem(item)) {
                <a
                  [routerLink]="['/']"
                  [fragment]="item.hash"
                  (click)="closeMobileMenu()"
                  class="flex items-center justify-between rounded-xl px-3 py-2.5 text-base text-subtle hover:bg-surface hover:text-foreground transition-colors"
                >
                  <span>{{ item.label }}</span>
                  <lucide-icon [img]="ArrowRightIcon" class="size-4 text-muted-foreground"></lucide-icon>
                </a>
              } @else {
                <a
                  [routerLink]="[item.to]"
                  routerLinkActive="bg-surface text-foreground"
                  (click)="closeMobileMenu()"
                  class="flex items-center justify-between rounded-xl px-3 py-2.5 text-base text-subtle hover:bg-surface hover:text-foreground transition-colors"
                >
                  <span>{{ item.label }}</span>
                  <lucide-icon [img]="ArrowRightIcon" class="size-4 text-muted-foreground"></lucide-icon>
                </a>
              }
            }

            <div class="pt-4 border-t border-border flex flex-col gap-2.5">
              <a
                routerLink="/"
                fragment="instalar"
                (click)="closeMobileMenu()"
                class="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/85 transition-colors"
              >
                <lucide-icon [img]="DownloadIcon" class="size-4"></lucide-icon>
                Baixar para Windows
              </a>

              <a
                [href]="site.githubUrl"
                target="_blank"
                rel="noreferrer"
                class="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-border bg-surface px-4 text-sm font-medium text-subtle hover:text-foreground hover:bg-surface-raised transition-colors"
              >
                <app-github-icon class="size-4"></app-github-icon>
                Ver código no GitHub
              </a>
            </div>
          </nav>
        </div>
      }
    </header>

    <!-- Modal Dialog de Busca Global Inteligente (aberto via Ctrl+K ou clique) -->
    @if (openSearch()) {
      <div
        class="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-20 bg-black/75 backdrop-blur-sm p-3 sm:p-4 animate-fade"
        (click)="closeOnBackdrop($event)"
      >
        <div
          class="relative w-full max-w-2xl rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden flex flex-col max-h-[88vh] sm:max-h-[80vh]"
          (click)="$event.stopPropagation()"
        >
          <!-- Campo de Busca -->
          <div class="flex items-center gap-2.5 sm:gap-3 border-b border-border px-3.5 sm:px-4 py-3 bg-background/50">
            <lucide-icon [img]="SearchIcon" class="size-5 text-brand-cyan shrink-0"></lucide-icon>
            <input
              #searchInput
              type="text"
              [value]="searchQuery()"
              (input)="searchQuery.set($any($event.target).value)"
              placeholder="Digite um erro (0x8A150056, app aberto...) ou assunto..."
              class="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              autofocus
            />
            <button
              (click)="openSearch.set(false)"
              class="rounded-md border border-border bg-surface-raised px-2 py-1 text-xs font-mono text-subtle hover:text-foreground cursor-pointer"
            >
              ESC
            </button>
          </div>

          <!-- Sugestões Rápidas de Pesquisa quando o campo está vazio -->
          @if (!searchQuery().trim()) {
            <div class="p-3 border-b border-border/60 bg-surface/40 flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
              <span class="text-muted-foreground font-mono text-[11px] sm:text-xs">Frequentes:</span>
              <button
                type="button"
                (click)="searchQuery.set('0x8A150056')"
                class="rounded-full border border-border bg-surface px-2.5 py-0.5 text-subtle hover:border-brand-cyan hover:text-brand-cyan transition-colors cursor-pointer text-xs"
              >
                0x8A150056
              </button>
              <button
                type="button"
                (click)="searchQuery.set('UAC admin')"
                class="rounded-full border border-border bg-surface px-2.5 py-0.5 text-subtle hover:border-brand-cyan hover:text-brand-cyan transition-colors cursor-pointer text-xs"
              >
                Pede Admin (UAC)
              </button>
              <button
                type="button"
                (click)="searchQuery.set('loop')"
                class="rounded-full border border-border bg-surface px-2.5 py-0.5 text-subtle hover:border-brand-cyan hover:text-brand-cyan transition-colors cursor-pointer text-xs"
              >
                Loop / Versão Unknown
              </button>
              <button
                type="button"
                (click)="searchQuery.set('fontes')"
                class="rounded-full border border-border bg-surface px-2.5 py-0.5 text-subtle hover:border-brand-cyan hover:text-brand-cyan transition-colors cursor-pointer text-xs"
              >
                Auto-cura de fontes
              </button>
            </div>
          }

          <!-- Lista de Resultados Filtrados -->
          <div class="overflow-y-auto p-2 divide-y divide-border/40 divide-dashed">
            @if (filteredResults().length === 0) {
              <div class="py-12 text-center text-sm text-muted-foreground">
                <p>Nenhum resultado encontrado para "{{ searchQuery() }}"</p>
                <p class="mt-1 text-xs text-subtle">Tente pesquisar por código de erro (0x8A150056), "memória", "snapshot", "WinUI" ou "UAC".</p>
              </div>
            } @else {
              @for (item of filteredResults(); track item.id) {
                <div
                  (click)="selectResult(item)"
                  class="group flex flex-col gap-1 rounded-xl p-3 hover:bg-surface-raised cursor-pointer transition-colors"
                >
                  <!-- Cabeçalho do Resultado: Ícone, Título e Categoria -->
                  <div class="flex items-center gap-2 sm:gap-2.5">
                    @if (item.category === 'problemas') {
                      <lucide-icon [img]="AlertIcon" class="size-4 text-spark shrink-0"></lucide-icon>
                    } @else if (item.category === 'documentacao') {
                      <lucide-icon [img]="BookIcon" class="size-4 text-brand-cyan shrink-0"></lucide-icon>
                    } @else if (item.category === 'arquitetura') {
                      <lucide-icon [img]="LayersIcon" class="size-4 text-brand-violet shrink-0"></lucide-icon>
                    } @else {
                      <lucide-icon [img]="CompassIcon" class="size-4 text-subtle shrink-0"></lucide-icon>
                    }

                    <span class="text-sm font-medium text-foreground group-hover:text-brand-cyan transition-colors truncate">
                      {{ item.title }}
                    </span>

                    <span class="ml-auto shrink-0 font-mono text-[10.5px] rounded px-1.5 py-0.5 border border-border bg-surface text-muted-foreground">
                      {{ item.categoryLabel }}
                    </span>
                  </div>

                  <!-- Prévia da Solução / Descrição -->
                  <p class="text-xs text-subtle pl-6 leading-relaxed line-clamp-2">
                    {{ item.preview }}
                  </p>
                </div>
              }
            }
          </div>

          <!-- Rodapé do Modal -->
          <div class="px-4 py-2.5 border-t border-border bg-background/50 flex items-center justify-between text-xs text-muted-foreground font-mono">
            <span>{{ filteredResults().length }} resultado(s) disponível(is)</span>
            <span class="hidden sm:inline">Pressione Enter ou toque para abrir</span>
          </div>
        </div>
      </div>
    }
  `
})
export class SiteHeaderComponent {
  readonly site = SITE;
  readonly nav = NAV;
  readonly searchIndex = SEARCH_INDEX;

  readonly SearchIcon = Search;
  readonly AlertIcon = AlertCircle;
  readonly BookIcon = BookOpen;
  readonly LayersIcon = Layers;
  readonly CompassIcon = Compass;
  readonly ArrowRightIcon = ArrowRight;
  readonly EnterIcon = CornerDownLeft;
  readonly MenuIcon = Menu;
  readonly CloseIcon = X;
  readonly DownloadIcon = Download;

  openSearch = signal<boolean>(false);
  mobileMenuOpen = signal<boolean>(false);
  searchQuery = signal<string>('');

  private router = inject(Router);

  isHashItem(item: NavItem): item is { label: string; to: '/'; hash: string } {
    return 'hash' in item;
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.update(v => !v);
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }

  openSearchModal() {
    this.closeMobileMenu();
    this.openSearch.set(true);
    this.searchQuery.set('');
  }

  closeOnBackdrop(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      this.openSearch.set(false);
    }
  }

  filteredResults = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) {
      return this.searchIndex.slice(0, 8);
    }

    return this.searchIndex.filter(item => {
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchPreview = item.preview.toLowerCase().includes(q);
      const matchKeywords = item.keywords.some(k => k.toLowerCase().includes(q));
      return matchTitle || matchPreview || matchKeywords;
    });
  });

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      this.openSearchModal();
    }
    if (e.key === 'Escape') {
      if (this.openSearch()) {
        this.openSearch.set(false);
      }
      if (this.mobileMenuOpen()) {
        this.mobileMenuOpen.set(false);
      }
    }
  }

  selectResult(item: SearchResultItem) {
    this.openSearch.set(false);
    this.closeMobileMenu();
    if (item.hash) {
      this.router.navigate([item.url], { fragment: item.hash });
    } else {
      this.router.navigate([item.url]);
    }
  }
}
