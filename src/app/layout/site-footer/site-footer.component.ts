/**
 * ==============================================================================
 * RODAPÉ DO SITE (site-footer.component.ts)
 * ==============================================================================
 * O que é:
 *   Rodapé global com o logotipo, texto descritivo, links de navegação
 *   (incluindo o link para o GitHub) e o disclaimer legal.
 *
 * O que faz:
 *   - Exibe a marca com link para a home.
 *   - Renderiza a lista de links do NAV mais o link externo do GitHub.
 *   - Exibe o aviso legal de projeto independente e marcas registradas da Microsoft.
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SITE, NAV, NavItem } from '../../core/constants/site';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="border-t border-border">
      <div class="mx-auto flex max-w-[1200px] flex-col gap-6 px-5 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
        <!-- Logo e Descrição -->
        <div class="flex items-center gap-2.5">
          <img src="wingeteasy-logo.png" alt="" width={24} height={16} class="h-4 w-auto" />
          <span class="font-semibold text-foreground">{{ site.name }}</span>
          <span>· Gerenciador de atualizações nativo para Windows</span>
        </div>

        <!-- Links de Navegação do Rodapé -->
        <nav class="flex flex-wrap gap-5">
          @for (n of nav; track n.label) {
            @if (isHashItem(n)) {
              <a
                [routerLink]="['/']"
                [fragment]="n.hash"
                class="hover:text-foreground transition-colors"
              >
                {{ n.label }}
              </a>
            } @else {
              <a
                [routerLink]="[n.to]"
                class="hover:text-foreground transition-colors"
              >
                {{ n.label }}
              </a>
            }
          }
          <!-- Link do GitHub -->
          <a
            [href]="site.githubUrl"
            target="_blank"
            rel="noreferrer"
            class="hover:text-foreground transition-colors"
          >
            GitHub
          </a>
        </nav>
      </div>

      <!-- Disclaimer legal de marcas e independência do projeto -->
      <p class="mx-auto max-w-[1200px] px-5 pb-10 text-xs text-muted-foreground md:px-8">
        WingetEasy é um projeto independente e não é afiliado à Microsoft. Windows, WinUI e WinGet são
        marcas da Microsoft Corporation.
      </p>
    </footer>
  `
})
export class SiteFooterComponent {
  readonly site = SITE;
  readonly nav = NAV;

  isHashItem(item: NavItem): item is { label: string; to: '/'; hash: string } {
    return 'hash' in item;
  }
}
