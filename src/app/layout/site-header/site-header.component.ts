/**
 * ==============================================================================
 * HEADER / NAVBAR DO SITE (site-header.component.ts)
 * ==============================================================================
 * O que é:
 *   Barra de navegação superior fixa com efeito translúcido (backdrop-blur)
 *   e borda sutil, contendo logotipo, links, atalho de busca e botão de download.
 *
 * O que faz:
 *   - Fixa o menu no topo (`sticky top-0 z-40`).
 *   - Exibe links do menu importados de `NAV`.
 *   - Suporta busca rápida:
 *     * Atalho global `Ctrl + K` (ou `Cmd + K` no Mac) abre o modal de pesquisa.
 *     * Tecla `ESC` ou clique fecha o modal.
 *   - Link para o repositório GitHub oficial.
 *   - Botão pílula "Baixar" com âncora direta para a seção de instalação.
 *
 * Como alterar caso queira:
 *   - Alterar altura do header: Mude `h-16` na linha 40 para `h-14` ou `h-20`.
 *   - Alterar transparência do fundo: Ajuste `bg-background/80` (ex: `bg-background/95`).
 *   - Alterar links do menu: Edite o arquivo `src/app/core/constants/site.ts`.
 *   - Adicionar novos atalhos no modal de busca: Adicione opções dentro do bloco `@if (openSearch())`.
 */

import { Component, HostListener, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, Search } from 'lucide-angular';
import { SITE, NAV, NavItem } from '../../core/constants/site';
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
          <img src="wingeteasy-logo.png" alt="WingetEasy" width="38" height="28" class="h-[28px] w-auto" />
          <span class="text-[15px] font-semibold tracking-tight">{{ site.name }}</span>
        </a>

        <!-- Links de Navegação (Desktop) -->
        <nav class="hidden items-center gap-6 text-[15px] text-subtle md:flex">
          @for (item of nav; track item.label) {
            @if (isHashItem(item)) {
              <!-- Links para seções na página inicial via âncora (#) -->
              <a
                [routerLink]="['/']"
                [fragment]="item.hash"
                class="transition-colors hover:text-foreground"
              >
                {{ item.label }}
              </a>
            } @else {
              <!-- Links para páginas dedicadas (/arquitetura, /documentacao) -->
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
            (click)="openSearch.set(true)"
            class="hidden h-9 w-52 items-center gap-2 rounded-full border border-border bg-surface px-3 text-sm text-muted-foreground transition-colors hover:border-input hover:text-subtle xl:flex cursor-pointer"
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
            (click)="openSearch.set(true)"
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

    <!-- Modal Dialog de Busca Global (aberto via clique ou atalho Ctrl+K) -->
    @if (openSearch()) {
      <div class="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/60 backdrop-blur-sm p-4">
        <div class="relative w-full max-w-lg rounded-xl border border-border bg-surface shadow-2xl overflow-hidden">
          <div class="flex items-center gap-2 border-b border-border px-3 py-2.5">
            <lucide-icon [img]="SearchIcon" class="size-4 text-muted-foreground"></lucide-icon>
            <input
              type="text"
              placeholder="Digite um comando ou seção..."
              class="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              autofocus
            />
            <button
              (click)="openSearch.set(false)"
              class="rounded px-1.5 py-0.5 text-xs text-subtle hover:bg-surface-raised cursor-pointer"
            >
              ESC
            </button>
          </div>
          <div class="p-2 text-xs text-subtle">
            <p class="px-2 py-1.5 text-muted-foreground font-mono">Navegação rápida</p>
            @for (item of nav; track item.label) {
              <button
                type="button"
                (click)="navigate(item)"
                class="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-foreground hover:bg-surface-raised transition-colors cursor-pointer"
              >
                <span>{{ item.label }}</span>
                <span class="ml-auto font-mono text-[11px] text-muted-foreground">
                  {{ isHashItem(item) ? '#' + item.hash : item.to }}
                </span>
              </button>
            }
          </div>
        </div>
      </div>
    }
  `
})
export class SiteHeaderComponent {
  readonly site = SITE;
  readonly nav = NAV;
  readonly SearchIcon = Search;

  // Estado que controla se a caixa de diálogo de busca está visível
  openSearch = signal<boolean>(false);
  private router = inject(Router);

  // Helper TypeScript de verificação de tipo para itens com âncora hash (#)
  isHashItem(item: NavItem): item is { label: string; to: '/'; hash: string } {
    return 'hash' in item;
  }

  /**
   * Listener global de teclado para detectar o atalho Ctrl+K (ou Cmd+K) e ESC
   */
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      this.openSearch.update(v => !v);
    }
    if (e.key === 'Escape' && this.openSearch()) {
      this.openSearch.set(false);
    }
  }

  /**
   * Realiza a navegação após o usuário clicar em um item dentro da busca
   */
  navigate(item: NavItem) {
    this.openSearch.set(false);
    if (this.isHashItem(item)) {
      this.router.navigate(['/'], { fragment: item.hash });
    } else {
      this.router.navigate([item.to]);
    }
  }
}
