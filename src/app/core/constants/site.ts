/**
 * ==============================================================================
 * CONSTANTES GLOBAIS DO SITE (site.ts)
 * ==============================================================================
 * O que é:
 *   Arquivo central com metadados, links externos e itens de navegação do WingetEasy.
 *
 * O que faz:
 *   Centraliza links (GitHub, releases, comando winget) e a lista do menu para que
 *   qualquer alteração reflita em todo o site (Header, Hero, Footer, Modais).
 *
 * Como alterar caso queira:
 *   - Mudar URL do repositório: Edite `githubUrl` ou `releasesUrl`.
 *   - Alterar comando de instalação: Altere `installCommand`.
 *   - Adicionar/remover item do menu: Inclua ou remova objetos da lista `NAV`.
 *     * Para seções com âncora na Home: use `{ label: 'Nome', to: '/', hash: 'id-da-secao' }`
 *     * Para páginas internas separadas: use `{ label: 'Nome', to: '/nome-da-rota' }`
 */

export const SITE = {
  name: 'WingetEasy',
  githubUrl: 'https://github.com/WingetEasy/WingetEasy',
  releasesUrl: 'https://github.com/WingetEasy/WingetEasy/releases',
  installCommand: 'winget install WingetEasy',
} as const;

// Define se o item de menu leva a uma âncora (#) na home ou a uma rota dedicada
export type NavItem =
  | { label: string; to: "/"; hash: string }
  | { label: string; to: "/arquitetura" | "/documentacao" };

export const NAV: readonly NavItem[] = [
  { label: "Recursos", to: "/", hash: "recursos" },
  { label: "Como funciona", to: "/", hash: "como-funciona" },
  { label: "Arquitetura", to: "/arquitetura" },
  { label: "Documentação", to: "/documentacao" },
  { label: "Instalação", to: "/", hash: "instalar" },
];
