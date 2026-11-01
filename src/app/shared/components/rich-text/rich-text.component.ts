/**
 * ==============================================================================
 * RENDERIZADOR DE TEXTO COM NEGRITO (rich-text.component.ts)
 * ==============================================================================
 * O que é:
 *   Componente utilitário que transforma textos contendo sintaxe markdown **negrito**
 *   em elementos <strong> estilizados com cor de destaque do tema.
 *
 * O que faz:
 *   Divide a string pela regex `(\*\*[^*]+\*\*)` e renderiza trechos normais e
 *   trechos em negrito com `text-foreground font-semibold`.
 */

import { Component, input } from '@angular/core';

@Component({
  selector: 'app-rich-text',
  standalone: true,
  template: `
    @for (part of parts(); track $index) {
      @if (part.bold) {
        <strong class="font-semibold text-foreground">{{ part.text }}</strong>
      } @else {
        <span>{{ part.text }}</span>
      }
    }
  `
})
export class RichTextComponent {
  text = input.required<string>();

  parts = () => {
    const raw = this.text();
    if (!raw) return [];
    return raw.split(/(\*\*[^*]+\*\*)/g).map(part => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return { text: part.slice(2, -2), bold: true };
      }
      return { text: part, bold: false };
    });
  };
}

