/**
 * ==============================================================================
 * BOTÃO COM FEEDBACK DE CÓPIA (copy-button.component.ts)
 * ==============================================================================
 * O que é:
 *   Componente de botão reutilizável que copia um texto específico para a área
 *   de transferência e exibe um feedback visual temporário (ícone de Check + "Copiado!").
 *
 * O que faz:
 *   - Executa a cópia via `ClipboardService`.
 *   - Ativa o estado reativo `copied = true` por 1.8 segundos e depois restaura o estado inicial.
 *   - Suporta múltiplos estilos (`pill`, `pillOutline`, `default`, `ghost`) e tamanhos (`default`, `sm`, `lg`, `xl`).
 *
 * Como alterar caso queira:
 *   - Mudar tempo de feedback: Modifique o valor de `1800` no `setTimeout(...)`.
 *   - Alterar texto padrão de feedback: Mude o valor default de `copiedLabel = input<string>('Copiado!')`.
 *   - Alterar cores de foco/hover: Ajuste as strings CSS retornadas pelo método `buttonClasses()`.
 */

import { Component, input, signal, inject } from '@angular/core';
import { LucideAngularModule, Copy, Check } from 'lucide-angular';
import { ClipboardService } from '../../../core/services/clipboard.service';

@Component({
  selector: 'app-copy-button',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <button
      type="button"
      (click)="onCopy()"
      [class]="buttonClasses()"
      [attr.aria-label]="label() ? undefined : 'Copiar'"
    >
      @if (copied()) {
        <!-- Ícone de sucesso (Check verde) -->
        <lucide-icon [img]="CheckIcon" class="size-4 shrink-0 text-success"></lucide-icon>
        @if (label()) {
          <span>{{ copiedLabel() }}</span>
        }
      } @else {
        <!-- Ícone padrão de cópia -->
        <lucide-icon [img]="CopyIcon" class="size-4 shrink-0"></lucide-icon>
        @if (label()) {
          <span>{{ label() }}</span>
        }
      }
    </button>
  `
})
export class CopyButtonComponent {
  // Texto que será efetivamente copiado para o clipboard
  value = input.required<string>();

  // Rótulo textual visível no botão (opcional)
  label = input<string>('');

  // Rótulo exibido após a cópia com sucesso
  copiedLabel = input<string>('Copiado!');

  // Variação visual do botão
  variant = input<'pill' | 'pillOutline' | 'default' | 'ghost'>('pillOutline');

  // Tamanho do botão
  size = input<'default' | 'sm' | 'lg' | 'xl'>('default');

  // Sinal reativo que indica se o conteúdo acabou de ser copiado
  copied = signal<boolean>(false);

  private clipboardService = inject(ClipboardService);

  readonly CopyIcon = Copy;
  readonly CheckIcon = Check;

  async onCopy() {
    const success = await this.clipboardService.copy(this.value());
    if (success) {
      this.copied.set(true);
      // Mantém o estado "Copiado!" por 1.8s antes de restaurar
      setTimeout(() => this.copied.set(false), 1800);
    }
  }

  /**
   * Constrói as classes Tailwind dinamicamente com base nas variantes e tamanhos selecionados.
   */
  buttonClasses(): string {
    const base = 'inline-flex items-center justify-center gap-2 font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring select-none';
    
    // Variantes visuais
    let variantCls = 'rounded-full border border-input bg-surface/60 text-foreground backdrop-blur hover:bg-surface-raised';
    if (this.variant() === 'pill') {
      variantCls = 'rounded-full bg-primary text-primary-foreground hover:bg-primary/85';
    } else if (this.variant() === 'ghost') {
      variantCls = 'hover:bg-accent hover:text-accent-foreground text-subtle';
    } else if (this.variant() === 'default') {
      variantCls = 'rounded-md bg-primary text-primary-foreground shadow hover:bg-primary/90';
    }

    // Tamanhos
    let sizeCls = 'h-9 px-4 text-sm';
    if (this.size() === 'sm') sizeCls = 'h-8 px-3 text-xs';
    if (this.size() === 'lg') sizeCls = 'h-10 px-8 text-sm';
    if (this.size() === 'xl') sizeCls = 'h-12 px-5 text-base';

    return `${base} ${variantCls} ${sizeCls}`;
  }
}
