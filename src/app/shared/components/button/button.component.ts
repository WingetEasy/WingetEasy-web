/**
 * ==============================================================================
 * BOTÃO BASE REUTILIZÁVEL (button.component.ts)
 * ==============================================================================
 * O que é:
 *   Componente base de botão com design system alinhado ao padrão do site.
 *
 * O que faz:
 *   Centraliza estilos, variantes (`pill`, `pillOutline`, `ghost`, etc.) e tamanhos
 *   para garantir consistência em botões secundários ou formulários futuros.
 *
 * Como alterar caso queira:
 *   - Adicionar uma nova variante: Inclua a chave no tipo do `variant` e defina
 *     suas classes Tailwind dentro de `computedClasses()`.
 *   - Alterar arredondamento do formato pílula: Modifique `rounded-full` para `rounded-xl`, etc.
 */

import { Component, input } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button
      [type]="type()"
      [disabled]="disabled()"
      [class]="computedClasses()"
      (click)="onClick($event)"
    >
      <ng-content></ng-content>
    </button>
  `
})
export class ButtonComponent {
  type = input<'button' | 'submit' | 'reset'>('button');
  variant = input<'default' | 'pill' | 'pillOutline' | 'ghost' | 'secondary' | 'outline'>('default');
  size = input<'default' | 'sm' | 'lg' | 'xl' | 'icon'>('default');
  disabled = input<boolean>(false);
  class = input<string>('');

  onClick(event: MouseEvent) {
    // Evento de clique para o botão
  }

  computedClasses(): string {
    const base = 'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed select-none';

    let variantCls = 'bg-primary text-primary-foreground shadow hover:bg-primary/90';
    if (this.variant() === 'pill') {
      variantCls = 'rounded-full bg-primary text-primary-foreground hover:bg-primary/85';
    } else if (this.variant() === 'pillOutline') {
      variantCls = 'rounded-full border border-input bg-surface/60 text-foreground backdrop-blur hover:bg-surface-raised';
    } else if (this.variant() === 'ghost') {
      variantCls = 'hover:bg-accent hover:text-accent-foreground text-subtle';
    } else if (this.variant() === 'secondary') {
      variantCls = 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80';
    } else if (this.variant() === 'outline') {
      variantCls = 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground';
    }

    let sizeCls = 'h-9 px-4 py-2 rounded-md';
    if (this.size() === 'sm') sizeCls = 'h-8 px-3 text-xs rounded-md';
    if (this.size() === 'lg') sizeCls = 'h-10 px-8 rounded-md';
    if (this.size() === 'xl') sizeCls = 'h-12 px-5 text-base rounded-full [&_svg]:size-[18px]';
    if (this.size() === 'icon') sizeCls = 'h-9 w-9 rounded-full';

    return `${base} ${variantCls} ${sizeCls} ${this.class()}`;
  }
}
