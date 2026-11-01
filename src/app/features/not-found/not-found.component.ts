/**
 * ==============================================================================
 * PÁGINA NÃO ENCONTRADA (not-found.component.ts)
 * ==============================================================================
 * O que é:
 *   Página de erro 404 da aplicação com o canvas animado do foguete (PixelRocket),
 *   identidade visual com Geist Mono, Mona Sans e tokens OKLCH idênticos ao design.
 *
 * Funcionalidades:
 *   - Fundo com PixelRocketComponent (estrelas, planeta com dithering Bayer e foguete em órbita).
 *   - Tag superior em Geist Mono indicando 'Sinal perdido · erro 404'.
 *   - Número gigante 404 com tipografia densa.
 *   - Botões de navegação rápida para 'Voltar ao início' e 'Ver documentação'.
 */

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PixelRocketComponent } from '../../shared/canvas/pixel-rocket/pixel-rocket.component';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, PixelRocketComponent],
  template: `
    <div class="relative flex min-h-screen items-center overflow-hidden bg-background px-5 md:px-8">
      <!-- Fundo em Canvas: Foguete pixelado flutuando no espaço com rastros de partículas -->
      <app-pixel-rocket class="pointer-events-none absolute inset-0 h-full w-full" />

      <!-- Conteúdo central com mensagem e links de navegação -->
      <div class="relative mx-auto w-full max-w-[1200px]">
        <p class="font-mono text-[12px] uppercase tracking-[0.14em] text-spark">
          Sinal perdido · erro 404
        </p>

        <h1 class="mt-4 text-[96px] font-semibold leading-none tracking-tight text-foreground md:text-[160px]">
          404
        </h1>

        <h2 class="mt-4 max-w-lg text-2xl font-semibold text-foreground md:text-3xl">
          Este pacote saiu da órbita.
        </h2>

        <p class="mt-3 max-w-md text-muted-foreground">
          A página que você procura não existe ou foi movida. Vamos te trazer de volta à base.
        </p>

        <div class="mt-8 flex flex-wrap gap-3">
          <a
            routerLink="/"
            class="inline-flex items-center rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Voltar ao início
          </a>

          <a
            routerLink="/documentacao"
            class="inline-flex items-center rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Ver documentação
          </a>
        </div>
      </div>
    </div>
  `
})
export class NotFoundComponent {}

