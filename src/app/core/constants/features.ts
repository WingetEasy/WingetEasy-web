/**
 * ==============================================================================
 * DADOS DOS RECURSOS DO WINGETEASY (features.ts)
 * ==============================================================================
 * O que é:
 *   Coleção dos 6 módulos e funcionalidades principais do WingetEasy com seus
 *   ícones Lucide, textos, ritmos (cadence), detalhes e dados de preview da janela.
 *
 * O que faz:
 *   Alimenta o componente `FeatureShowcaseComponent` da seção "Recursos" e
 *   futuras páginas de documentação.
 *
 * Como alterar caso queira:
 *   - Adicionar ou alterar recursos: Edite, adicione ou remova itens do array `FEATURES`.
 *   - Adicionar uma imagem real do aplicativo: Defina a propriedade `image: { url: 'caminho.png', alt: 'Descrição' }`.
 *   - Modificar linhas de preview: Ajuste o array `preview.rows`.
 */

import {
  Archive,
  CalendarClock,
  CheckSquare,
  CircleCheck,
  CircleX,
  Clock,
  Download,
  FileCode2,
  FileSpreadsheet,
  History,
  Layers,
  PanelBottom,
  PauseCircle,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Square,
  Terminal,
  XCircle,
  Zap,
} from 'lucide-angular';

export type FeatureRow = {
  icon: any;
  text: string;
  tone?: 'ok' | 'warn' | 'err' | 'muted';
};

export type Feature = {
  key: string;
  icon: any;
  name: string;
  cadence: string;
  headline: string;
  body: string;
  /** Suporta marcações de negrito via **texto** */
  stat: string;
  command?: string;
  docsHash: string;
  preview: {
    title: string;
    badge: string;
    meta: string;
    rows: FeatureRow[];
  };
  /** Screenshot real opcional; substitui o preview ilustrativo se fornecido */
  image?: { url: string; alt: string };
};

export const FEATURES: Feature[] = [
  {
    key: 'atualizacoes',
    icon: RefreshCw,
    name: 'Central de Atualizações',
    cadence: 'Sob demanda (F5) ou a cada 4 h',
    headline: 'Todas as atualizações da máquina numa lista categorizada e filtrável.',
    body: 'Uma verificação roda winget upgrade, lê a saída em tempo real e separa apps, runtimes e segurança. Antes de atualizar, o WingetEasy avisa sobre programas abertos e agrupa num único pedido de administrador o que exigir elevação.',
    stat: 'Pacote com versão **Unknown** ou **< 1.0** que já foi atualizado para a mesma versão nas **últimas 24 h** vai direto para os adiados, sem notificações repetidas.',
    command: 'winget upgrade --accept-source-agreements',
    docsHash: 'fluxo-atualizacao',
    preview: {
      title: 'Lote de atualização',
      badge: 'Concluído',
      meta: 'UpdateService · agora',
      rows: [
        { icon: RefreshCw, text: 'Encontrou **5** atualizações em **3,2 s**' },
        { icon: PauseCircle, text: 'Adiou **Discord** — versão **Unknown** em loop', tone: 'muted' },
        { icon: XCircle, text: '**Google Chrome** estava aberto · usuário escolheu **Fechar e atualizar**' },
        { icon: ShieldCheck, text: '**1** pacote pediu admin · **um único** consentimento UAC' },
        { icon: CircleCheck, text: '**4** atualizados · **1** reinício pendente', tone: 'ok' },
      ],
    },
  },
  {
    key: 'bandeja',
    icon: PanelBottom,
    name: 'Painel da Bandeja',
    cadence: 'Um clique no ícone da bandeja',
    headline: 'Atualize sem abrir a janela principal.',
    body: 'Um painel acrílico ancorado ao relógio do Windows, com cantos arredondados nativos do Windows 11. Marque ou desmarque pacotes e o botão se ajusta sozinho entre “Atualizar Selecionados (N)” e “Atualizar Tudo”.',
    stat: 'Em segundo plano, o WingetEasy ocupa de **7 a 15 MB** de RAM — a interface é descartada ao ir para a bandeja.',
    command: 'WingetEasy.App.exe --minimized',
    docsHash: 'telas',
    preview: {
      title: 'WingetEasy · 4 atualizações',
      badge: 'Bandeja',
      meta: 'UpdateFlyout',
      rows: [
        { icon: CheckSquare, text: '**Google Chrome** 129.0 → 130.0' },
        { icon: CheckSquare, text: '**Visual Studio Code** 1.94.2 → 1.95.0' },
        { icon: Square, text: '**Microsoft PowerToys** 0.85.1 → 0.86.0', tone: 'muted' },
        { icon: CheckSquare, text: '**.NET Desktop Runtime 10** 10.0.0 → 10.0.1' },
        { icon: Zap, text: 'Botão: **Atualizar Selecionados (3)**', tone: 'ok' },
      ],
    },
  },
  {
    key: 'backup',
    icon: Archive,
    name: 'Snapshots e Backup',
    cadence: 'Antes de formatar ou migrar',
    headline: 'Fotografe tudo que está instalado e restaure em outro PC.',
    body: 'O snapshot usa o winget export e guarda junto o nome da máquina, a versão do Windows e a data. Na hora de restaurar, um checklist deixa você escolher só os programas que quer de volta.',
    stat: 'Cada snapshot pode virar um script **.ps1** auto-instalável ou um **perfil** reutilizável.',
    command: 'winget export -o backup.json --accept-source-agreements',
    docsHash: 'fluxo-backup',
    preview: {
      title: 'Snapshot · Pré-formatação',
      badge: '48 pacotes',
      meta: 'BackupService · DESKTOP-JB',
      rows: [
        { icon: Archive, text: 'Criou o snapshot **Pré-formatação** com **48** pacotes' },
        { icon: FileCode2, text: 'Exportou **setup.ps1** com #Requires -RunAsAdministrator' },
        { icon: RotateCcw, text: 'Restaurou **45 de 48** pacotes selecionados', tone: 'ok' },
        { icon: Layers, text: 'Transformou o snapshot no perfil **Setup Web Dev**' },
      ],
    },
  },
  {
    key: 'perfis',
    icon: Layers,
    name: 'Perfis de Software',
    cadence: 'Máquina nova, mesmo setup',
    headline: 'Conjuntos de apps por finalidade, instalados de uma vez.',
    body: 'Monte perfis como Desenvolvimento Web, Design & Edição ou Produtividade. Ao aplicar, o WingetEasy compara o perfil com o que já existe na máquina e instala apenas a diferença.',
    stat: 'O diff engine calcula **perfil − instalados** e baixa **só o que falta**, economizando tempo e banda.',
    docsHash: 'casos-de-uso',
    preview: {
      title: 'Perfil · Desenvolvimento Web',
      badge: '12 pacotes',
      meta: 'ProfilesService',
      rows: [
        { icon: Layers, text: '**12** pacotes no perfil' },
        { icon: CircleCheck, text: '**9** já instalados nesta máquina', tone: 'muted' },
        { icon: Download, text: 'Instalando **3** ausentes: Node.js, Docker Desktop, Postman' },
        { icon: CircleCheck, text: 'Perfil aplicado em **2 min 41 s**', tone: 'ok' },
      ],
    },
  },
  {
    key: 'historico',
    icon: History,
    name: 'Histórico e Auditoria',
    cadence: 'Cada atualização registrada',
    headline: 'Uma linha do tempo do que mudou, de qual versão para qual.',
    body: 'Toda operação vira um registro com versão anterior, versão nova, status e mensagem de erro traduzida. Filtre por 24 horas, 7 dias, 30 dias ou todo o histórico.',
    stat: 'Exportação em **CSV** pronta para o Excel, com versão anterior, versão nova e erro de cada pacote.',
    docsHash: 'erros',
    preview: {
      title: 'Histórico · Hoje',
      badge: '3 registros',
      meta: 'UpdateHistoryRepository',
      rows: [
        { icon: CircleCheck, text: '**Google Chrome** 129.0 → **130.0** · Sucesso', tone: 'ok' },
        { icon: Clock, text: '**PowerToys** 0.85.1 → **0.86.0** · Reinício pendente', tone: 'warn' },
        { icon: CircleX, text: '**Zoom** · instalador sem modo silencioso', tone: 'err' },
        { icon: FileSpreadsheet, text: 'Exportou **historico-outubro.csv**' },
      ],
    },
  },
  {
    key: 'automacao',
    icon: Terminal,
    name: 'Automação Headless',
    cadence: 'Agendado, sem janela',
    headline: 'Verificações pelo Agendador de Tarefas, mesmo com o app fechado.',
    body: 'A tarefa WingetEasy_Background_Check roda só quando há internet. Se falhar três vezes seguidas, um circuit breaker pausa as tentativas e volta aos poucos (30 min, 1 h, 2 h).',
    stat: 'Códigos de saída padronizados: **0** atualizado, **10** atualizações pendentes, **11** falha.',
    command: 'WingetEasy.App.exe --check',
    docsHash: 'cli',
    preview: {
      title: 'WingetEasy_Background_Check',
      badge: 'exit 10',
      meta: 'Agendador de Tarefas · 09:00',
      rows: [
        { icon: CalendarClock, text: 'Tarefa agendada disparou às **09:00**' },
        { icon: Terminal, text: '--check encontrou **4** atualizações · exit **10**' },
        { icon: CircleCheck, text: 'Toast enviado fora do **horário silencioso**', tone: 'ok' },
        { icon: ShieldCheck, text: 'Circuit breaker **fechado** · 0 falhas seguidas', tone: 'muted' },
      ],
    },
  },
];

