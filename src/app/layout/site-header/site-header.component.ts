/**
 * ==============================================================================
 * HEADER / NAVBAR DO SITE COM BUSCA INTELIGENTE (site-header.component.ts)
 * ==============================================================================
 * O que é:
 *   Barra superior fixa com atalho global de busca Ctrl + K.
 *
 * O que faz:
 *   - Abre o modal de busca ao teclar Ctrl+K ou clicar no campo de busca.
 *   - Pesquisa em tempo real por:
 *     * Códigos de erro ("0x8A150056", "0x8A150014")
 *     * Problemas do dia a dia ("Chrome aberto", "pede admin", "loop", "fontes corrompidas")
 *     * Capítulos técnicos de Arquitetura e Documentação
 *     * Seções da Página Inicial
 *   - Exibe a categoria do resultado, título, badge e uma prévia explicativa da solução.
 *   - Navega diretamente para a seção correspondente ao clicar ou teclar Enter.
 */

import { Component, HostListener, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, Search, AlertCircle, BookOpen, Layers, Compass, ArrowRight, CornerDownLeft } from 'lucide-angular';
import { SITE, NAV, NavItem } from '../../core/constants/site';
import { SEARCH_INDEX, SearchResultItem } from '../../core/constants/search-index';
import { GithubIconComponent } from '../../shared/components/button/github-icon.component';

@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, GithubIconComponent],
  template: `
    <header class="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div class="mx-auto flex h-16 max-w-[1440px] items-center gap-8 px-5 md:px-6">
        <!-- Logotipo e Nome do Projeto -->
        <a routerLink="/" class="flex shrink-0 items-center gap-2.5">
          <img src="wingeteasy-logo.png" alt="WingetEasy" width="28" height="18" class="h-[22px] w-auto" />
          <span class="text-[15px] font-semibold tracking-tight">{{ site.name }}</span>
        </a>

        <!-- Links de Navegação (Desktop) -->
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

        <!-- Ações do lado direito (Busca, GitHub, Baixar) -->
        <div class="ml-auto flex items-center gap-2 md:gap-3">
          <!-- Botão de busca estilo comando rápido (Desktop) -->
          <button
            type="button"
            (click)="openSearchModal()"
            class="hidden h-9 w-60 items-center gap-2 rounded-full border border-border bg-surface px-3 text-sm text-muted-foreground transition-colors hover:border-input hover:text-subtle xl:flex cursor-pointer"
          >
            <lucide-icon [img]="SearchIcon" class="size-4"></lucide-icon>
            <span>Buscar</span>
            <kbd class="ml-auto rounded-md border border-border bg-surface-raised px-1.5 py-0.5 font-sans text-[11px] text-subtle">
              Ctrl K
            </kbd>
          </button>

          <!-- Ícone de busca compacto (Mobile) -->
          <button
            type="button"
            (click)="openSearchModal()"
            class="flex xl:hidden h-9 w-9 items-center justify-center rounded-full text-subtle hover:bg-accent hover:text-accent-foreground cursor-pointer"
            aria-label="Buscar"
          >
            <lucide-icon [img]="SearchIcon" class="size-4"></lucide-icon>
          </button>

          <!-- Link do GitHub -->
          <a
            [href]="site.githubUrl"
            target="_blank"
            rel="noreferrer"
            aria-label="Repositório no GitHub"
            class="flex h-9 w-9 items-center justify-center rounded-full text-subtle hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <app-github-icon class="size-5"></app-github-icon>
          </a>

          <!-- Botão de destaque "Baixar" -->
          <a
            routerLink="/"
            fragment="instalar"
            class="inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/85 transition-colors cursor-pointer"
          >
            Baixar
          </a>
        </div>
      </div>
    </header>

    <!-- Modal Dialog de Busca Global Inteligente (aberto via Ctrl+K ou clique) -->
    @if (openSearch()) {
      <div
        class="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 bg-black/70 backdrop-blur-sm p-4 animate-fade"
        (click)="closeOnBackdrop($event)"
      >
        <div
          class="relative w-full max-w-2xl rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
          (click)="$event.stopPropagation()"
        >
          <!-- Campo de Busca -->
          <div class="flex items-center gap-3 border-b border-border px-4 py-3.5 bg-background/50">
            <lucide-icon [img]="SearchIcon" class="size-5 text-brand-cyan shrink-0"></lucide-icon>
            <input
              #searchInput
              type="text"
              [value]="searchQuery()"
              (input)="searchQuery.set($any($event.target).value)"
              placeholder="Digite um erro (ex: 0x8A150056, app aberto, admin, loop, fontes) ou assunto..."
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
            <div class="p-3 border-b border-border/60 bg-surface/40 flex flex-wrap items-center gap-2 text-xs">
              <span class="text-muted-foreground font-mono">Pesquisas frequentes:</span>
              <button
                type="button"
                (click)="searchQuery.set('0x8A150056')"
                class="rounded-full border border-border bg-surface px-2.5 py-1 text-subtle hover:border-brand-cyan hover:text-brand-cyan transition-colors cursor-pointer"
              >
                0x8A150056 (App aberto)
              </button>
              <button
                type="button"
                (click)="searchQuery.set('UAC admin')"
                class="rounded-full border border-border bg-surface px-2.5 py-1 text-subtle hover:border-brand-cyan hover:text-brand-cyan transition-colors cursor-pointer"
              >
                Pede Admin (UAC)
              </button>
              <button
                type="button"
                (click)="searchQuery.set('loop')"
                class="rounded-full border border-border bg-surface px-2.5 py-1 text-subtle hover:border-brand-cyan hover:text-brand-cyan transition-colors cursor-pointer"
              >
                Versão em Loop
              </button>
              <button
                type="button"
                (click)="searchQuery.set('fontes')"
                class="rounded-full border border-border bg-surface px-2.5 py-1 text-subtle hover:border-brand-cyan hover:text-brand-cyan transition-colors cursor-pointer"
              >
                Fontes Corrompidas
              </button>
            </div>
          }

          <!-- Lista de Resultados da Busca -->
          <div class="overflow-y-auto p-2 divide-y divide-border/40 flex-1">
            @if (filteredResults().length === 0) {
              <div class="py-12 text-center text-muted-foreground">
                <p class="text-sm">Nenhum resultado encontrado para "{{ searchQuery() }}".</p>
                <p class="text-xs mt-1 text-subtle">Dica: Tente pesquisar por código hexadecimal ("0x..."), "admin", "memoria" ou "backup".</p>
              </div>
            } @else {
              @for (item of filteredResults(); track item.id; let i = $index) {
                <div
                  (click)="selectResult(item)"
                  class="group flex flex-col gap-1 p-3 rounded-xl hover:bg-surface-raised transition-colors cursor-pointer text-left"
                >
                  <div class="flex items-center gap-2">
                    <!-- Ícone por categoria -->
                    @if (item.category === 'problemas') {
                      <lucide-icon [img]="AlertIcon" class="size-4 text-spark shrink-0"></lucide-icon>
                    } @else if (item.category === 'documentacao') {
                      <lucide-icon [img]="BookIcon" class="size-4 text-brand-cyan shrink-0"></lucide-icon>
                    } @else if (item.category === 'arquitetura') {
                      <lucide-icon [img]="LayersIcon" class="size-4 text-brand-violet shrink-0"></lucide-icon>
                    } @else {
                      <lucide-icon [img]="CompassIcon" class="size-4 text-subtle shrink-0"></lucide-icon>
                    }

                    <span class="text-sm font-medium text-foreground group-hover:text-brand-cyan transition-colors">
                      {{ item.title }}
                    </span>

                    <span class="ml-auto font-mono text-[11px] rounded px-1.5 py-0.5 border border-border bg-surface text-muted-foreground">
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
            <span class="hidden sm:inline">Pressione Enter ou clique para abrir</span>
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

  openSearch = signal<boolean>(false);
  searchQuery = signal<string>('');

  private router = inject(Router);

  isHashItem(item: NavItem): item is { label: string; to: '/'; hash: string } {
    return 'hash' in item;
  }

  openSearchModal() {
    this.searchQuery.set('');
    this.openSearch.set(true);
  }

  closeOnBackdrop(e: MouseEvent) {
    this.openSearch.set(false);
  }

  // Filtro reativo computed que pesquisa no título, preview e lista de palavras-chave
  filteredResults = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) {
      // Exibe os problemas em destaque e as seções principais inicialmente
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
    if (e.key === 'Escape' && this.openSearch()) {
      this.openSearch.set(false);
    }
  }

  selectResult(item: SearchResultItem) {
    this.openSearch.set(false);
    if (item.hash) {
      this.router.navigate([item.url], { fragment: item.hash });
    } else {
      this.router.navigate([item.url]);
    }
  }
}
