/**
 * ==============================================================================
 * ROTEAMENTO PRINCIPAL DA APLICAÇÃO (app.routes.ts)
 * ==============================================================================
 * O que é:
 *   Configuração de rotas do Angular com carregamento preguiçoso (Lazy Loading).
 *
 * Rotas configuradas:
 *   - '' -> HomeComponent (Landing Page principal)
 *   - 'arquitetura' -> ArchitectureComponent (Documentação de arquitetura técnica)
 *   - 'documentacao' -> DocumentationComponent (Documentação oficial de ponta a ponta)
 */

import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'arquitetura',
    loadComponent: () => import('./features/architecture/architecture.component').then(m => m.ArchitectureComponent)
  },
  {
    path: 'documentacao',
    loadComponent: () => import('./features/documentation/documentation.component').then(m => m.DocumentationComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
