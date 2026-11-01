/**
 * ==============================================================================
 * PÁGINA DE ARQUITETURA (architecture.component.ts)
 * ==============================================================================
 * O que é:
 *   Página completa de arquitetura técnica do WingetEasy em rota própria (`/arquitetura`).
 *
 * O que faz:
 *   - Usa o layout unificado `DocsLayoutComponent` com índice TOC e detecção de scroll.
 *   - Renderiza 10 seções técnicas estruturadas com diagramas SVG interativos Mermaid.js:
 *     1. Visão em camadas (Clean Architecture)
 *     2. Apresentação MVVM (CommunityToolkit.Mvvm)
 *     3. Ciclo de vida completo (Diagrama de estados e Boot/Trimming de RAM)
 *     4. Modos de execução (Tabela comparativa dos 4 modos)
 *     5. Gestão crítica de memória (LOH, GC agressivo, EmptyWorkingSet)
 *     6. Concorrência e resiliência (Circuit Breaker e SemaphoreSlim)
 *     7. Segurança, privilégios e UAC (Job JSON isolado)
 *     8. Persistência SQLite (Modelo ER e AppDbContext)
 *     9. Contratos de serviço (Tabela dos 12 contratos)
 *     10. Stack e dependências (.NET 10, C# 14, WinUI 3)
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  DocsLayoutComponent,
  DocSectionComponent,
  CComponent,
  CodeBlockComponent,
  DataTableComponent,
  SpecGridComponent,
  TocItem,
  StatItem,
} from '../../shared/components/docs-layout/docs-layout.component';
import { MermaidComponent } from '../../shared/components/mermaid/mermaid.component';
import { DIAGRAMS } from '../../core/constants/diagrams';

export const TOC: TocItem[] = [
  { id: 'camadas', label: 'Visão em camadas', group: 'Estrutura' },
  { id: 'mvvm', label: 'Apresentação MVVM', group: 'Estrutura' },
  { id: 'ciclo-de-vida', label: 'Ciclo de vida', group: 'Execução' },
  { id: 'modos', label: 'Modos de execução', group: 'Execução' },
  { id: 'memoria', label: 'Gestão de memória', group: 'Execução' },
  { id: 'concorrencia', label: 'Concorrência e resiliência', group: 'Execução' },
  { id: 'seguranca', label: 'Segurança e UAC', group: 'Execução' },
  { id: 'persistencia', label: 'Persistência SQLite', group: 'Dados' },
  { id: 'servicos', label: 'Contratos de serviço', group: 'Dados' },
  { id: 'stack', label: 'Stack e dependências', group: 'Dados' },
];

export const STATS: StatItem[] = [
  { value: '3', label: 'camadas' },
  { value: '12', label: 'contratos de serviço' },
  { value: '6', label: 'tabelas SQLite' },
  { value: '~11 MB', label: 'RAM na bandeja' },
];

@Component({
  selector: 'app-architecture',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DocsLayoutComponent,
    DocSectionComponent,
    CComponent,
    CodeBlockComponent,
    DataTableComponent,
    SpecGridComponent,
    MermaidComponent
  ],
  template: `
    <app-docs-layout
      eyebrow="Arquitetura"
      title="Por dentro do WingetEasy"
      description="Uma aplicação WinUI 3 em .NET 10 e C# 14 organizada em três camadas, com MVVM, injeção de dependências, SQLite em modo WAL e foco obsessivo em consumo mínimo de recursos."
      [stats]="stats"
      [toc]="toc"
    >
      <!-- ========================================== -->
      <!-- SEÇÃO 01: VISÃO EM CAMADAS                -->
      <!-- ========================================== -->
      <app-doc-section
        id="camadas"
        index="01"
        title="Visão em camadas"
        lead="Clean Architecture em três projetos. A interface conhece apenas contratos; o domínio não conhece a interface; a persistência implementa os contratos do domínio."
      >
        <app-mermaid [code]="diagrams.layers" title="Camadas e direção de dependências"></app-mermaid>

        <app-spec-grid
          [items]="[
            {
              title: 'WingetEasy.App',
              tag: 'WinUI 3',
              body: 'Views XAML, ViewModels, bandeja do sistema, diálogos e o contêiner de DI que compõe toda a aplicação.'
            },
            {
              title: 'WingetEasy.Core',
              tag: 'Domínio',
              body: 'Interfaces e serviços: interoperação com o winget, fila de atualização, backup, perfis, agendamento e elevação.'
            },
            {
              title: 'WingetEasy.Data',
              tag: 'EF Core',
              body: 'AppDbContext, entidades e seis repositórios sobre SQLite, sempre via IDbContextFactory.'
            },
            {
              title: 'Inversão de controle',
              tag: 'DI',
              body: 'Todos os serviços são registrados em Microsoft.Extensions.DependencyInjection e injetados por interface — nenhum ViewModel instancia um serviço diretamente.'
            }
          ]"
        ></app-spec-grid>
      </app-doc-section>

      <!-- ========================================== -->
      <!-- SEÇÃO 02: APRESENTAÇÃO MVVM               -->
      <!-- ========================================== -->
      <app-doc-section
        id="mvvm"
        index="02"
        title="Apresentação MVVM"
        lead="Views finas, ViewModels testáveis. O estado vive em propriedades observáveis e cada ação é um comando."
      >
        <ul class="space-y-3">
          <li class="flex gap-3 leading-relaxed text-subtle">
            <span class="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-brand-cyan"></span>
            <span><app-c>CommunityToolkit.Mvvm</app-c> com <app-c>ObservableObject</app-c>, <app-c>[ObservableProperty]</app-c>, <app-c>RelayCommand</app-c> e <app-c>AsyncRelayCommand</app-c>.</span>
          </li>
          <li class="flex gap-3 leading-relaxed text-subtle">
            <span class="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-brand-cyan"></span>
            <span>Atualizações de tela sempre marshalled para a UI thread via <app-c>DispatcherQueue</app-c>; trabalho de I/O roda em <app-c>Task.Run</app-c>.</span>
          </li>
          <li class="flex gap-3 leading-relaxed text-subtle">
            <span class="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-brand-cyan"></span>
            <span><app-c>UpdatesViewModel</app-c> é Singleton: a página principal e o painel da bandeja (<app-c>UpdateFlyout</app-c>) compartilham o mesmo estado de fila.</span>
          </li>
          <li class="flex gap-3 leading-relaxed text-subtle">
            <span class="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-brand-cyan"></span>
            <span>Listas longas usam virtualização XAML com <app-c>ItemsStackPanel</app-c>; a busca tem debounce para não recalcular a cada tecla.</span>
          </li>
        </ul>
      </app-doc-section>

      <!-- ========================================== -->
      <!-- SEÇÃO 03: CICLO DE VIDA COMPLETO          -->
      <!-- ========================================== -->
      <app-doc-section
        id="ciclo-de-vida"
        index="03"
        title="Ciclo de vida completo"
        lead="Do primeiro milissegundo ao descarte na bandeja: Serilog, hooks do Velopack, instância única por Mutex e decisão do modo de execução pelos argumentos."
      >
        <app-mermaid [code]="diagrams.lifecycle" title="Diagrama de estados do ciclo de vida"></app-mermaid>
        <app-mermaid
          [code]="diagrams.boot"
          title="Sequência: do clique no executável ao trimming de RAM"
          caption="Ao fechar a janela, a árvore visual é descartada e a memória cai de ~65 MB para ~11 MB."
        ></app-mermaid>
      </app-doc-section>

      <!-- ========================================== -->
      <!-- SEÇÃO 04: MODOS DE EXECUÇÃO               -->
      <!-- ========================================== -->
      <app-doc-section
        id="modos"
        index="04"
        title="Modos de execução"
        lead="O mesmo executável assume quatro papéis, decididos por CliArgumentsParser antes de qualquer janela existir."
      >
        <app-data-table
          [head]="['Argumento', 'Modo', 'O que acontece']"
          [mono]="[0]"
          [rows]="[
            ['(nenhum)', 'Desktop interativo', 'DI completo, migrations, MainWindow com Mica e coordenadas restauradas.'],
            ['--minimized', 'Bandeja', 'Sem janela DirectX: só o ícone H.NotifyIcon, verificação silenciosa e 7–15 MB de RAM.'],
            ['--check · --update-all · --backup · --restore', 'Headless', 'HeadlessRunner executa sem UI e devolve um código de saída padronizado.'],
            ['--elevated-update <job>', 'Worker elevado', 'Processo filho com UAC lê o job JSON, executa o lote como administrador e grava o resultado.']
          ]"
        ></app-data-table>
      </app-doc-section>

      <!-- ========================================== -->
      <!-- SEÇÃO 05: GESTÃO CRÍTICA DE MEMÓRIA       -->
      <!-- ========================================== -->
      <app-doc-section
        id="memoria"
        index="05"
        title="Gestão crítica de memória"
        lead="Aplicações WinUI 3 self-contained são pesadas por natureza. O WingetEasy trata RAM como recurso de primeira classe."
      >
        <app-spec-grid
          [items]="[
            {
              title: 'Contexto de dados efêmero',
              body: 'Cada operação cria e descarta seu AppDbContext via IDbContextFactory, com AsNoTracking() nas leituras — o ChangeTracker nunca acumula.'
            },
            {
              title: 'Árvore XAML descartada',
              body: 'Ao ir para a bandeja: ContentFrame.Content = null e BackStack.Clear() liberam buffers DirectX.'
            },
            {
              title: 'Compactação do LOH',
              body: 'CompactOnce + GC.Collect(2, Aggressive) seguido de P/Invoke EmptyWorkingSet (Psapi).'
            },
            {
              title: 'Imagens decodificadas no tamanho certo',
              body: 'Ícones de pacotes passam por WIC com DecodePixelWidth, evitando bitmaps em resolução total.'
            }
          ]"
        ></app-spec-grid>
        <app-mermaid [code]="diagrams.trayMemory" title="Fechamento, persistência de coordenadas e trimming de RAM"></app-mermaid>
      </app-doc-section>

      <!-- ========================================== -->
      <!-- SEÇÃO 06: CONCORRÊNCIA E RESILIÊNCIA      -->
      <!-- ========================================== -->
      <app-doc-section
        id="concorrencia"
        index="06"
        title="Concorrência e resiliência"
        lead="Separação rígida entre UI thread e workers, cancelamento cooperativo de ponta a ponta e um circuit breaker para verificações em segundo plano."
      >
        <ul class="space-y-3">
          <li class="flex gap-3 leading-relaxed text-subtle">
            <span class="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-brand-cyan"></span>
            <span>Paralelismo limitado com <app-c>SemaphoreSlim</app-c>; cancelamento propagado por <app-c>CancellationTokenSource</app-c> até o processo filho do winget (<app-c>process.Kill()</app-c>).</span>
          </li>
          <li class="flex gap-3 leading-relaxed text-subtle">
            <span class="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-brand-cyan"></span>
            <span>Streams <app-c>StandardOutput</app-c> e <app-c>StandardError</app-c> lidos de forma assíncrona para evitar deadlock quando a saída excede o pipe anônimo (~4 KB).</span>
          </li>
          <li class="flex gap-3 leading-relaxed text-subtle">
            <span class="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-brand-cyan"></span>
            <span><app-c>SchedulerService</app-c> usa <app-c>PeriodicTimer</app-c> e abre o circuito após 3 falhas seguidas, com backoff exponencial.</span>
          </li>
        </ul>
        <app-mermaid [code]="diagrams.circuitBreaker" title="Estados do circuit breaker do SchedulerService"></app-mermaid>
      </app-doc-section>

      <!-- ========================================== -->
      <!-- SEÇÃO 07: SEGURANÇA E UAC                 -->
      <!-- ========================================== -->
      <app-doc-section
        id="seguranca"
        index="07"
        title="Segurança, privilégios e UAC"
        lead="Princípio do menor privilégio: o app nunca roda elevado. Quando um pacote exige administrador, apenas um processo filho isolado é elevado — uma única vez por lote."
      >
        <ol class="grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2">
          <li class="bg-background p-6">
            <span class="font-mono text-[12px] text-brand-violet">01</span>
            <h3 class="mt-2 text-lg font-semibold tracking-tight">Sanitização</h3>
            <p class="mt-2 leading-relaxed text-subtle">Cada PackageId é validado contra <app-c>^[A-Za-z0-9._\-+]+$</app-c> (Source Generator Regex). Aspas, ponto-e-vírgula ou caracteres de controle são rejeitados.</p>
          </li>
          <li class="bg-background p-6">
            <span class="font-mono text-[12px] text-brand-violet">02</span>
            <h3 class="mt-2 text-lg font-semibold tracking-tight">Job temporário</h3>
            <p class="mt-2 leading-relaxed text-subtle">A lista de pacotes é serializada (AOT, <app-c>CoreJsonContext</app-c>) em <app-c>%TEMP%\WingetEasy\job_&lt;guid&gt;.json</app-c>.</p>
          </li>
          <li class="bg-background p-6">
            <span class="font-mono text-[12px] text-brand-violet">03</span>
            <h3 class="mt-2 text-lg font-semibold tracking-tight">Elevação sob demanda</h3>
            <p class="mt-2 leading-relaxed text-subtle">O próprio executável é iniciado com <app-c>--elevated-update</app-c> e <app-c>Verb = "runas"</app-c>: um único prompt do UAC.</p>
          </li>
          <li class="bg-background p-6">
            <span class="font-mono text-[12px] text-brand-violet">04</span>
            <h3 class="mt-2 text-lg font-semibold tracking-tight">Captura e limpeza</h3>
            <p class="mt-2 leading-relaxed text-subtle">O pai lê <app-c>result_&lt;guid&gt;.json</app-c>, desserializa os resultados e apaga os dois arquivos.</p>
          </li>
        </ol>
      </app-doc-section>

      <!-- ========================================== -->
      <!-- SEÇÃO 08: PERSISTÊNCIA SQLITE             -->
      <!-- ========================================== -->
      <app-doc-section
        id="persistencia"
        index="08"
        title="Persistência SQLite"
        lead="EF Core sobre SQLite em modo WAL: leituras da interface nunca esperam por escritas do modo headless ou de serviços em segundo plano."
      >
        <app-mermaid [code]="diagrams.er" title="Modelo de dados (AppDbContext)"></app-mermaid>
        <app-code-block
          label="Inicialização do banco"
          code="PRAGMA journal_mode=WAL;\nPRAGMA busy_timeout=5000;\n\nawait using var db = await _factory.CreateDbContextAsync(ct);"
        ></app-code-block>
        <app-data-table
          [head]="['Tabela', 'Repositório', 'Conteúdo']"
          [mono]="[0, 1]"
          [rows]="[
            ['Settings', 'SettingsRepository', 'Chaves tipadas (GetAsync<T>/SetAsync<T>), estado da janela e flags.'],
            ['UpdateHistories', 'UpdateHistoryRepository', 'Auditoria FromVersion → ToVersion, status e mensagem de erro.'],
            ['Packages', 'PackageRepository', 'Regras de supressão, pin, versão ignorada e prazo de adiamento.'],
            ['BackupSnapshots', 'BackupSnapshotRepository', 'Snapshots JSON completos do winget export com metadados da máquina.'],
            ['Profiles', 'ProfileRepository', 'Perfis temáticos e lista serializada de pacotes.'],
            ['CheckLogs', 'CheckLogRepository', 'Telemetria de cada verificação: duração, pacotes encontrados, sucesso.']
          ]"
        ></app-data-table>
        <p class="text-subtle">
          Migrações versionadas pelo EF Core: <app-c>InitialSchema</app-c> e <app-c>AddPackageSuppressionFields</app-c>.
        </p>
      </app-doc-section>

      <!-- ========================================== -->
      <!-- SEÇÃO 09: CONTRATOS DE SERVIÇO            -->
      <!-- ========================================== -->
      <app-doc-section
        id="servicos"
        index="09"
        title="Contratos de serviço"
        lead="Os “endpoints” internos do WingetEasy: cada capacidade é uma interface em WingetEasy.Core.Interfaces."
      >
        <app-data-table
          [head]="['Interface', 'Responsabilidade']"
          [mono]="[0]"
          [rows]="[
            ['IWingetService', 'Interoperação direta com winget.exe: verificar, listar instalados, instalar e reparar fontes.'],
            ['IUpdateService', 'Orquestrador da fila: pré-voo de processos, lote padrão, fallback UAC e auditoria.'],
            ['IBackupService', 'Snapshots via winget export, restauração granular e geração de scripts .ps1.'],
            ['IProfilesService', 'CRUD de perfis e instalação apenas dos pacotes ausentes (diff engine).'],
            ['IRunningProcessService', 'Detecção de apps abertos e fechamento gracioso (WM_CLOSE) ou forçado.'],
            ['ISchedulerService', 'Verificações periódicas internas com circuit breaker.'],
            ['ITaskSchedulerService', 'Tarefa WingetEasy_Background_Check no Agendador de Tarefas do Windows.'],
            ['IToastNotificationService', 'Notificações interativas, respeitando horário silencioso e som.'],
            ['INotificationService', 'Contrato genérico de notificação, implementado por ToastNotificationService.'],
            ['IAdminElevationHelper', 'Execução isolada de lotes elevados via processo filho runas.'],
            ['IAppUpdateService', 'Atualização do próprio WingetEasy via Velopack e GitHub Releases.'],
            ['ILocalizationService', 'Textos da interface traduzidos, registrado como instância única (LocalizationService.Instance).']
          ]"
        ></app-data-table>
      </app-doc-section>

      <!-- ========================================== -->
      <!-- SEÇÃO 10: STACK E DEPENDÊNCIAS            -->
      <!-- ========================================== -->
      <app-doc-section
        id="stack"
        index="10"
        title="Stack e dependências"
        lead="Windows 10 build 19041+ ou Windows 11, .NET 10, C# 14 e Windows App SDK."
      >
        <app-data-table
          [head]="['Pacote', 'Uso']"
          [mono]="[0]"
          [rows]="[
            ['CommunityToolkit.Mvvm', 'Propriedades observáveis e comandos gerados por source generators.'],
            ['Microsoft.EntityFrameworkCore.Sqlite', 'Persistência local com migrations e modo WAL.'],
            ['H.NotifyIcon', 'Ícone, tooltip dinâmico e menu de contexto na bandeja.'],
            ['Microsoft.Windows.AppNotifications', 'Toasts nativos interativos.'],
            ['Microsoft.Win32.TaskScheduler', 'Criação da tarefa agendada de verificação.'],
            ['System.CommandLine', 'Parsing dos argumentos do modo headless.'],
            ['Serilog', 'Logs estruturados diários em %LocalAppData%.'],
            ['Velopack', 'Auto-update delta do próprio aplicativo.']
          ]"
        ></app-data-table>
      </app-doc-section>
    </app-docs-layout>
  `
})
export class ArchitectureComponent {
  readonly toc = TOC;
  readonly stats = STATS;
  readonly diagrams = DIAGRAMS;
}

