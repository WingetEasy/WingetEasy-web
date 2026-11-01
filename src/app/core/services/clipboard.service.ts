/**
 * ==============================================================================
 * SERVIÇO DE ÁREA DE TRANSFERÊNCIA (clipboard.service.ts)
 * ==============================================================================
 * O que é:
 *   Serviço utilitário Angular injetável (Singleton) para copiar textos para o clipboard.
 *
 * O que faz:
 *   Usa a API nativa do navegador `navigator.clipboard.writeText()` de forma segura,
 *   garantindo compatibilidade com SSR (não falha quando executado no Node.js/servidor).
 *
 * Como alterar caso queira:
 *   - Se desejar integrar uma biblioteca de Toast/Notificação sonora ao copiar,
 *     você pode injetar o serviço de Toast aqui e disparar a notificação dentro do `copy()`.
 */

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ClipboardService {
  /**
   * Copia o texto informado para a área de transferência do usuário.
   * @param text Texto que será copiado.
   * @returns Promise<boolean> informando se a cópia foi bem sucedida.
   */
  async copy(text: string): Promise<boolean> {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}
