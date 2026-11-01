/**
 * ==============================================================================
 * ROTEAMENTO PRINCIPAL DA APLICAÇÃO (app.routes.ts)
 * ==============================================================================
 * O que é:
 *   Configuração de rotas do Angular com carregamento preguiçoso (Lazy Loading).
 *
 * O que faz:
 *   - Mapeia a rota raiz `''` para o componente `HomeComponent`.
 *   - Redireciona qualquer rota não encontrada para a raiz `''`.
 *
 * Como alterar caso queira:
 *   - Adicionar a rota de Arquitetura:
 *     `{ path: 'arquitetura', loadComponent: () => import('./features/architecture/architecture.component').then(m => m.ArchitectureComponent) }`
 *   - Adicionar a rota de Documentação:
 *     `{ path: 'documentacao', loadComponent: () => import('./features/documentation/documentation.component').then(m => m.DocumentationComponent) }`
 *   - Adicionar página 404 personalizada:
 *     `{ path: '**', loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent) }`
 */

import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
