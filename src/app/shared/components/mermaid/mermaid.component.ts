/**
 * ==============================================================================
 * RENDERIZADOR MERMAID (mermaid.component.ts)
 * ==============================================================================
 * O que é:
 *   Componente que renderiza diagramas técnicos Mermaid.js diretamente em SVG,
 *   com tema escuro customizado usando as cores OKLCH/Hex da marca WingetEasy.
 *
 * O que faz:
 *   - Carrega a biblioteca `mermaid` dinamicamente apenas no browser (SSR-safe).
 *   - Converte os tokens CSS de cor para hex.
 *   - Oferece alternância entre a visão do "Diagrama" SVG e o "Código" fonte com botão de copiar.
 */

import { Component, ElementRef, input, viewChild, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Network, Code2 } from 'lucide-angular';
import { CopyButtonComponent } from '../copy-button/copy-button.component';

let mermaidPromise: Promise<any> | null = null;

function tokenHex(name: string): string {
  if (typeof document === 'undefined') return '#888888';
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext('2d');
  if (!ctx || !value) return '#888888';
  ctx.fillStyle = value;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return `#${[r, g, b].map((n) => (n ?? 0).toString(16).padStart(2, '0')).join('')}`;
}

function loadMermaid(): Promise<any> {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid').then(({ default: mermaid }) => {
      const t = (n: string) => tokenHex(n);
      const font = typeof document !== 'undefined' ? getComputedStyle(document.body).fontFamily : 'sans-serif';
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: 'base',
        darkMode: true,
        fontFamily: font,
        flowchart: { useMaxWidth: false, curve: 'basis', padding: 14 },
        sequence: { useMaxWidth: false, mirrorActors: false, showSequenceNumbers: true },
        state: { useMaxWidth: false },
        er: { useMaxWidth: false },
        themeVariables: {
          fontFamily: font,
          fontSize: '14px',
          background: t('--surface'),
          mainBkg: t('--surface-raised'),
          primaryColor: t('--surface-raised'),
          primaryTextColor: t('--foreground'),
          primaryBorderColor: t('--input'),
          secondaryColor: t('--surface'),
          secondaryTextColor: t('--foreground'),
          secondaryBorderColor: t('--border'),
          tertiaryColor: t('--background'),
          tertiaryTextColor: t('--foreground'),
          tertiaryBorderColor: t('--border'),
          textColor: t('--foreground'),
          titleColor: t('--foreground'),
          lineColor: t('--muted-foreground'),
          nodeBorder: t('--input'),
          clusterBkg: t('--background'),
          clusterBorder: t('--border'),
          edgeLabelBackground: t('--surface'),
          actorBkg: t('--surface-raised'),
          actorBorder: t('--brand-blue'),
          actorTextColor: t('--foreground'),
          actorLineColor: t('--border'),
          signalColor: t('--subtle'),
          signalTextColor: t('--foreground'),
          labelBoxBkgColor: t('--surface-raised'),
          labelBoxBorderColor: t('--brand-violet'),
          labelTextColor: t('--foreground'),
          loopTextColor: t('--subtle'),
          noteBkgColor: t('--nebula-1'),
          noteTextColor: t('--foreground'),
          noteBorderColor: t('--brand-violet'),
          activationBkgColor: t('--nebula-2'),
          activationBorderColor: t('--brand-violet'),
          sequenceNumberColor: t('--primary-foreground'),
          altBackground: t('--surface'),
          compositeBackground: t('--background'),
          compositeTitleBackground: t('--surface-raised'),
          stateLabelColor: t('--foreground'),
          transitionColor: t('--muted-foreground'),
          transitionLabelColor: t('--subtle'),
          attributeBackgroundColorOdd: t('--surface'),
          attributeBackgroundColorEven: t('--surface-raised'),
        },
      });
      return mermaid;
    });
  }
  return mermaidPromise;
}

@Component({
  selector: 'app-mermaid',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, CopyButtonComponent],
  template: `
    <figure class="overflow-hidden rounded-2xl border border-border bg-surface shadow-card my-6">
      <!-- Barra superior de ferramentas -->
      <div class="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <div class="flex min-w-0 items-center gap-2 font-mono text-[12px] text-subtle">
          <lucide-icon [img]="NetworkIcon" class="size-4 shrink-0 text-brand-cyan"></lucide-icon>
          <span class="truncate">{{ title() }}</span>
          <span class="hidden text-muted-foreground sm:inline">· {{ diagramKind() }}</span>
        </div>
        <div class="flex items-center gap-1">
          <button
            type="button"
            (click)="showCode.update(v => !v)"
            class="inline-flex h-8 items-center gap-1.5 rounded-md px-2 font-mono text-[12px] text-subtle transition-colors hover:bg-surface-raised hover:text-foreground cursor-pointer"
            [attr.aria-pressed]="showCode()"
          >
            <lucide-icon [img]="CodeIcon" class="size-4"></lucide-icon>
            {{ showCode() ? 'Diagrama' : 'Código' }}
          </button>
          <app-copy-button
            variant="ghost"
            [value]="code()"
          ></app-copy-button>
        </div>
      </div>

      <!-- Renderização visual do SVG Mermaid -->
      @if (!showCode()) {
        <div class="bg-dot-grid">
          <div class="overflow-x-auto p-5 md:p-8">
            @if (state() === 'loading') {
              <div class="flex h-48 items-center justify-center font-mono text-[12px] text-muted-foreground">
                renderizando diagrama…
              </div>
            }
            @if (state() === 'error') {
              <pre class="whitespace-pre-wrap font-mono text-[12px] text-subtle">{{ code() }}</pre>
            }
            <div #container class="mermaid-svg mx-auto w-max min-w-full [&>svg]:mx-auto"></div>
          </div>
        </div>
      }

      <!-- Visualização do código fonte puro -->
      @if (showCode()) {
        <pre class="max-h-[520px] overflow-auto bg-background px-5 py-5 font-mono text-[12.5px] leading-6 text-subtle"><code>{{ code() }}</code></pre>
      }

      @if (caption()) {
        <figcaption class="border-t border-border px-4 py-3 text-sm text-muted-foreground">
          {{ caption() }}
        </figcaption>
      }
    </figure>
  `
})
export class MermaidComponent {
  code = input.required<string>();
  title = input.required<string>();
  caption = input<string>('');

  containerRef = viewChild<ElementRef<HTMLDivElement>>('container');

  state = signal<'loading' | 'ready' | 'error'>('loading');
  showCode = signal<boolean>(false);

  readonly NetworkIcon = Network;
  readonly CodeIcon = Code2;

  diagramKind = () => this.code().trim().split(/\s/)[0] || 'diagram';

  constructor() {
    afterNextRender(async () => {
      try {
        const mermaid = await loadMermaid();
        const id = 'mmd-' + Math.random().toString(36).substring(2, 9);
        const { svg } = await mermaid.render(id, this.code());
        const el = this.containerRef()?.nativeElement;
        if (el) {
          el.innerHTML = svg;
          this.state.set('ready');
        }
      } catch (err) {
        console.error('Mermaid render error:', err);
        this.state.set('error');
      }
    });
  }
}

