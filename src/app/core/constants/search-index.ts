/**
 * ==============================================================================
 * ÍNDICE DE BUSCA GLOBAL DO SITE (search-index.ts)
 * ==============================================================================
 * O que é:
 *   Base de conhecimento indexada para a busca rápida (Ctrl + K) cobrindo:
 *   1. Problemas e códigos de erro reais (0x8A150056, UAC, loop, fontes corrompidas)
 *   2. Capítulos e seções da Documentação e Arquitetura
 *   3. Seções da Página Inicial (Recursos, Como funciona, Instalação, FAQ)
 *   4. Links e atalhos úteis
 *
 * O que faz:
 *   Permite que o usuário digite termos cotidianos (ex: "Chrome aberto", "pede admin",
 *   "loop", "0x8A150014") e encontre a solução com preview explicativo em 1 clique.
 */

export type SearchCategory = 'problemas' | 'documentacao' | 'arquitetura' | 'paginas';

export type SearchResultItem = {
  id: string;
  category: SearchCategory;
  categoryLabel: string;
  title: string;
  preview: string;
  url: string;
  hash?: string;
  keywords: string[];
};

export const SEARCH_INDEX: SearchResultItem[] = [
  // ==========================================
  // PROBLEMAS E SOLUÇÕES (ERROS E FALHAS REAIS)
  // ==========================================
  {
    id: 'err-app-aberto',
    category: 'problemas',
    categoryLabel: 'Solução de Problemas',
    title: 'Erro 0x8A150056: O aplicativo está aberto',
    preview: 'Detecta Chrome, VS Code ou outros apps abertos antes de atualizar. Escolha “Fechar e atualizar” ou pule o pacote.',
    url: '/documentacao',
    hash: 'solucao-problemas',
    keywords: ['0x8a150056', '-1978335146', 'aplicativo aberto', 'app aberto', 'chrome aberto', 'fechar', 'conflito', 'running', 'bloqueado']
  },
  {
    id: 'err-uac-admin',
    category: 'problemas',
    categoryLabel: 'Solução de Problemas',
    title: 'Erro 0x8A150014: Requer permissões de Administrador',
    preview: 'O WingetEasy nunca roda elevado. Pacotes que pedem admin são agrupados num único consentimento UAC isolado.',
    url: '/documentacao',
    hash: 'solucao-problemas',
    keywords: ['0x8a150014', '-1978335212', 'administrador', 'admin', 'uac', 'elevacao', 'privilegio', 'root', 'runas', 'permissao']
  },
  {
    id: 'err-loop-unknown',
    category: 'problemas',
    categoryLabel: 'Solução de Problemas',
    title: 'Pacote atualizando em loop / versão Unknown',
    preview: 'UpdateLoopDetector adia automaticamente versões Unknown ou < 1.0 que já foram atualizadas nas últimas 24 horas.',
    url: '/documentacao',
    hash: 'solucao-problemas',
    keywords: ['loop', 'atualiza toda hora', 'repetindo', 'unknown', 'desconhecida', 'falso positivo', 'adiados', 'versao']
  },
  {
    id: 'err-fontes-corrompidas',
    category: 'problemas',
    categoryLabel: 'Solução de Problemas',
    title: 'Fontes corrompidas / Timeout de catálogo do WinGet',
    preview: 'Use a Auto-cura nas Configurações: restaura as fontes oficiais (winget source reset --force) e limpa o catálogo.',
    url: '/documentacao',
    hash: 'solucao-problemas',
    keywords: ['fontes corrompidas', 'source reset', 'erro de catalogo', 'timeout', 'auto cura', 'reparo', 'falha ao carregar']
  },
  {
    id: 'err-hash-mismatch',
    category: 'problemas',
    categoryLabel: 'Solução de Problemas',
    title: 'Erro 0x8A15002B: Assinatura ou hash diferente do catálogo',
    preview: 'Geralmente um erro temporário do fabricante. O instalador baixado não coincide com o manifesto da Microsoft.',
    url: '/documentacao',
    hash: 'solucao-problemas',
    keywords: ['0x8a15002b', '-1978335189', 'hash', 'assinatura', 'invalido', 'sha256', 'corrompido', 'seguranca']
  },
  {
    id: 'err-sem-silent',
    category: 'problemas',
    categoryLabel: 'Solução de Problemas',
    title: 'Erro 0x8A150011: Instalador não suporta modo silencioso',
    preview: 'Alguns programas exigem interface interativa. O pacote pode ser instalado manualmente ou adiado.',
    url: '/documentacao',
    hash: 'solucao-problemas',
    keywords: ['0x8a150011', '-1978335215', 'silencioso', 'silent', 'sem tela', 'instalador manual', 'incompativel']
  },
  {
    id: 'err-reboot-required',
    category: 'problemas',
    categoryLabel: 'Solução de Problemas',
    title: 'Código 0x8A15004E: Reinício do computador pendente',
    preview: 'Tratado como sucesso pelo WingetEasy: a atualização foi gravada, mas o Windows precisa reiniciar para trocar arquivos em uso.',
    url: '/documentacao',
    hash: 'solucao-problemas',
    keywords: ['0x8a15004e', '-1978335154', 'reiniciar', 'reinicio', 'reinicializacao', 'reboot', 'reinicie']
  },

  // ==========================================
  // CAPÍTULOS DE DOCUMENTAÇÃO
  // ==========================================
  {
    id: 'doc-telas',
    category: 'documentacao',
    categoryLabel: 'Documentação',
    title: 'Telas e Navegação do Aplicativo',
    preview: 'UpdatesPage, painel acrílico da bandeja (UpdateFlyout), histórico de atualizações e catálogo de perfis.',
    url: '/documentacao',
    hash: 'telas',
    keywords: ['telas', 'flyout', 'bandeja', 'historico', 'perfis', 'interface', 'janela', 'updatespage']
  },
  {
    id: 'doc-fluxo-atualizacao',
    category: 'documentacao',
    categoryLabel: 'Documentação',
    title: 'Fluxo de Atualização em Lote',
    preview: 'As 3 fases: pré-voo de processos conflitantes, lote sem privilégios e elevação única via UAC.',
    url: '/documentacao',
    hash: 'fluxo-atualizacao',
    keywords: ['atualizacao em lote', 'atualizar tudo', 'lote', 'processo', 'etapas', 'fluxo']
  },
  {
    id: 'doc-backup',
    category: 'documentacao',
    categoryLabel: 'Documentação',
    title: 'Snapshots de Backup e Scripts PowerShell',
    preview: 'Fotografe todos os programas antes de formatar e gere scripts .ps1 auto-instaláveis para outro computador.',
    url: '/documentacao',
    hash: 'fluxo-backup',
    keywords: ['backup', 'snapshot', 'formatar', 'powershell', 'ps1', 'restaurar', 'migrar', 'computador novo']
  },
  {
    id: 'doc-cli',
    category: 'documentacao',
    categoryLabel: 'Documentação',
    title: 'Modo Headless (Linha de Comando e Agendador)',
    preview: 'Argumentos --check, --update-all, --minimized e códigos de saída padronizados (exit 0, exit 10, exit 11).',
    url: '/documentacao',
    hash: 'cli',
    keywords: ['headless', 'cli', 'linha de comando', 'terminal', 'agendador', 'tarefa', 'schtasks', 'cron', 'automatizar']
  },
  {
    id: 'doc-config',
    category: 'documentacao',
    categoryLabel: 'Documentação',
    title: 'Configurações do WingetEasy',
    preview: 'Inicialização com o Windows, modo bandeja, horário silencioso de notificações e auto-update via Velopack.',
    url: '/documentacao',
    hash: 'configuracoes',
    keywords: ['configuracoes', 'ajustes', 'inicializacao', 'autostart', 'notificacoes', 'som', 'velopack']
  },

  // ==========================================
  // CAPÍTULOS DE ARQUITETURA
  // ==========================================
  {
    id: 'arq-camadas',
    category: 'arquitetura',
    categoryLabel: 'Arquitetura',
    title: 'Clean Architecture em Três Camadas',
    preview: 'WingetEasy.App (WinUI 3), WingetEasy.Core (Domínio e 12 contratos) e WingetEasy.Data (EF Core SQLite).',
    url: '/arquitetura',
    hash: 'camadas',
    keywords: ['arquitetura', 'camadas', 'clean architecture', 'core', 'app', 'data', 'winui', 'dotnet 10']
  },
  {
    id: 'arq-memoria',
    category: 'arquitetura',
    categoryLabel: 'Arquitetura',
    title: 'Gestão de Memória: 7 a 15 MB na Bandeja',
    preview: 'Descarte total da árvore visual XAML, esvaziamento do LOH com GC agressivo e P/Invoke EmptyWorkingSet.',
    url: '/arquitetura',
    hash: 'memoria',
    keywords: ['memoria', 'ram', 'consumo', 'otimizacao', 'descarte', 'bandeja', 'working set', 'gc']
  },
  {
    id: 'arq-ciclo',
    category: 'arquitetura',
    categoryLabel: 'Arquitetura',
    title: 'Ciclo de Vida e Instância Única (Mutex)',
    preview: 'Controle de inicialização única com Mutex, Serilog diário em LocalAppData e hooks de update Velopack.',
    url: '/arquitetura',
    hash: 'ciclo-de-vida',
    keywords: ['ciclo de vida', 'mutex', 'instancia unica', 'boot', 'inicializacao', 'serilog']
  },
  {
    id: 'arq-concorrencia',
    category: 'arquitetura',
    categoryLabel: 'Arquitetura',
    title: 'Concorrência, Pipes e Circuit Breaker',
    preview: 'Controle de processos com SemaphoreSlim, leitura assíncrona de pipes anônimos e circuit breaker para falhas.',
    url: '/arquitetura',
    hash: 'concorrencia',
    keywords: ['concorrencia', 'pipes', 'circuit breaker', 'deadlock', 'semaphoreslim', 'resiliencia']
  },

  // ==========================================
  // SEÇÕES DA PÁGINA INICIAL
  // ==========================================
  {
    id: 'pag-recursos',
    category: 'paginas',
    categoryLabel: 'Página Inicial',
    title: 'Recursos do WingetEasy',
    preview: 'Central de Atualizações, Painel da Bandeja, Snapshots, Perfis, Histórico e Automação Headless.',
    url: '/',
    hash: 'recursos',
    keywords: ['recursos', 'funcionalidades', 'modulos', 'central', 'painel']
  },
  {
    id: 'pag-como-funciona',
    category: 'paginas',
    categoryLabel: 'Página Inicial',
    title: 'Como Funciona (Pipeline em 6 Etapas)',
    preview: 'Verificar → Filtrar → Pré-voo → Atualizar → Elevar → Registrar com console ao vivo.',
    url: '/',
    hash: 'como-funciona',
    keywords: ['como funciona', 'pipeline', 'etapas', 'passo a passo', 'fluxo']
  },
  {
    id: 'pag-instalacao',
    category: 'paginas',
    categoryLabel: 'Página Inicial',
    title: 'Instalação e Requisitos de Sistema',
    preview: 'Comando winget install WingetEasy, releases oficiais no GitHub e requisitos do Windows 10/11.',
    url: '/',
    hash: 'instalar',
    keywords: ['instalar', 'instalacao', 'download', 'requisitos', 'baixar', 'como instalar']
  },
  {
    id: 'pag-faq',
    category: 'paginas',
    categoryLabel: 'Página Inicial',
    title: 'Perguntas Frequentes (FAQ)',
    preview: 'Dúvidas sobre substituição do winget, .NET 10, UAC, licença open-source e migração entre máquinas.',
    url: '/',
    hash: 'faq',
    keywords: ['faq', 'perguntas frequentes', 'duvidas', 'respostas', 'ajuda']
  }
];

