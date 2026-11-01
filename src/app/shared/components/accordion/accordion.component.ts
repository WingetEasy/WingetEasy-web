/**
 * ==============================================================================
 * ACCORDION NATIVO COM SIGNALS (accordion.component.ts)
 * ==============================================================================
 * O que é:
 *   Componente de Accordion (Sanfona) nativo, leve e sem dependências pesadas,
 *   construído com os Signals do Angular.
 *
 * O que faz:
 *   - Recebe itens com pergunta (`q`) e resposta (`a`).
 *   - Permite abrir/fechar uma pergunta por vez de maneira suave.
 */

import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronDown } from 'lucide-angular';

export type FaqItem = {
  q: string;
  a: string;
};

@Component({
  selector: 'app-accordion',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="border-t border-border">
      @for (item of items(); track item.q; let i = $index) {
        <div class="border-b border-border">
          <button
            type="button"
            (click)="toggle(i)"
            class="flex w-full items-center justify-between py-5 text-left text-base font-medium transition-colors hover:text-foreground cursor-pointer"
            [class.text-foreground]="openIndex() === i"
            [class.text-subtle]="openIndex() !== i"
          >
            <span>{{ item.q }}</span>
            <lucide-icon
              [img]="ChevronDownIcon"
              class="size-4 shrink-0 text-muted-foreground transition-transform duration-300"
              [class.rotate-180]="openIndex() === i"
            ></lucide-icon>
          </button>

          <div
            class="grid transition-[grid-template-rows,opacity] duration-300"
            [class.grid-rows-[1fr]]="openIndex() === i"
            [class.opacity-100]="openIndex() === i"
            [class.grid-rows-[0fr]]="openIndex() !== i"
            [class.opacity-0]="openIndex() !== i"
          >
            <div class="overflow-hidden">
              <p class="pb-5 text-base leading-relaxed text-subtle">
                {{ item.a }}
              </p>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class AccordionComponent {
  items = input.required<FaqItem[]>();
  openIndex = signal<number | null>(null);

  readonly ChevronDownIcon = ChevronDown;

  toggle(index: number) {
    this.openIndex.update(curr => (curr === index ? null : index));
  }
}

