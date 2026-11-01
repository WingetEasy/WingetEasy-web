/**
 * ==============================================================================
 * CABEÇALHO DE SEÇÃO REUTILIZÁVEL (section-header.component.ts)
 * ==============================================================================
 * O que é:
 *   Componente padrão para os títulos de cada seção da Landing Page.
 *
 * O que faz:
 *   Exibe o `eyebrow` (chapéu em fonte mono ciano com tracking expandido),
 *   o `title` (título principal em tracking display) e opcionalmente o `body` (descrição).
 */

import { Component, input } from '@angular/core';

@Component({
  selector: 'app-section-header',
  standalone: true,
  template: `
    <div class="max-w-2xl">
      <p class="font-mono text-[12px] uppercase tracking-[0.18em] text-brand-cyan">{{ eyebrow() }}</p>
      <h2 class="mt-4 text-4xl font-semibold leading-[1.05] tracking-display md:text-5xl">{{ title() }}</h2>
      @if (body()) {
        <p class="mt-5 text-lg leading-relaxed text-subtle">{{ body() }}</p>
      }
    </div>
  `
})
export class SectionHeaderComponent {
  eyebrow = input.required<string>();
  title = input.required<string>();
  body = input<string>('');
}

