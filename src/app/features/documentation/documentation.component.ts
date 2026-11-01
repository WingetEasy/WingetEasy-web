/**
 * ==============================================================================
 * PÁGINA DE DOCUMENTAÇÃO (documentation.component.ts)
 * ==============================================================================
 * O que é:
 *   Página técnica completa com a documentação oficial do WingetEasy em rota própria (`/documentacao`).
 *
 * O que faz:
 *   - Utiliza o shell unificado `DocsLayoutComponent` com índice lateral TOC (13 seções).
 *   - Renderiza tabelas, grids de casos de uso (UC01 a UC10), blocos de código e diagramas Mermaid:
 *     1. Visão geral
 *     2. Telas do aplicativo (UpdatesPage, UpdateFlyout, HistoryPage, etc.)
 *     3. Casos de uso (UC01 a UC10)
 *     4. Fluxo de verificação de atualizações (Diagrama Mermaid)
 *     5. Fluxo de atualização em lote (Diagrama Mermaid)
 *     6. Fluxo de cancelamento em tempo real (Diagrama Mermaid)
 *     7. Fluxo de snapshot e exportação PowerShell (Diagrama Mermaid + Script .ps1)
 *     8. Fluxo de restauração granular (Diagrama Mermaid)
 *     9. Auto-cura de fontes do WinGet (Diagrama Mermaid)
 *     10. Modo headless CLI (Tabela de argumentos, exit codes e tarefa agendada)
 *     11. Catálogo de erros do winget traduzidos (HRESULTs)
 *     12. Configurações e efeito imediato
 *     13. Próximos passos e roadmap
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
  TocItem,
  StatItem,
} from '../../shared/components/docs-layout/docs-layout.component';
import { MermaidComponent } from '../../shared/components/mermaid/mermaid.component';
import { DIAGRAMS } from '../../core/constants/diagrams';

export const TOC: TocItem[] = [
  { id: 'visao-geral', label: 'Visão geral', group: 'Começo' },
  { id: 'telas', label: 'Telas do aplicativo', group: 'Começo' },
  { id: 'casos-de-uso', label: 'Casos de uso', group: 'Começo' },
  { id: 'fluxo-verificacao', label: 'Verificar atualizações', group: 'Fluxos' },
  { id: 'fluxo-atualizacao', label: 'Atualização em lote', group: 'Fluxos' },
  { id: 'fluxo-cancelamento', label: 'Cancelamento', group: 'Fluxos' },
  { id: 'fluxo-backup', label: 'Snapshot e PowerShell', group: 'Fluxos' },
  { id: 'fluxo-restauracao', label: 'Restauração granular', group: 'Fluxos' },
  { id: 'fluxo-autocura', label: 'Auto-cura de fontes', group: 'Fluxos' },
  { id: 'cli', label: 'Modo headless (CLI)', group: 'Referência' },
  { id: 'erros', label: 'Códigos de erro', group: 'Referência' },
  { id: 'configuracoes', label: 'Configurações', group: 'Referência' },
  { id: 'roadmap', label: 'Próximos passos', group: 'Referência' },
];

export const STATS: StatItem[] = [
  { value: '10', label: 'casos de uso' },
  { value: '6', label: 'fluxos E2E' },
  { value: '5', label: 'argumentos CLI' },
  { value: '6', label: 'erros traduzidos' },
];

export const USE_CASES = [
  ['UC01', 'Atualização rápida pela bandeja', 'Usuário final', 'Abre o painel pelo ícone, marca/desmarca pacotes e atualiza com o botão dinâmico.'],
  ['UC02', 'Conflito com apps abertos', 'Usuário final', 'Chrome ou VS Code abertos são detectados antes; o usuário escolhe “Fechar e atualizar” ou “Pular pacote”.'],
  ['UC03', 'Elevação administrativa (UAC)', 'Usuário / Administrador', 'Pacotes que exigem admin são agrupados e pedem um único consentimento do Windows.'],
  ['UC04', 'Pacotes problemáticos ou em loop', 'Usuário final', 'UpdateLoopDetector identifica versões Unknown ou < 1.0; é possível adiar ou ignorar a versão.'],
  ['UC05', 'Snapshot antes de formatar', 'Usuário / Técnico de suporte', 'Cria o snapshot, salva localmente e exporta um script .ps1 auto-instalável.'],
  ['UC06', 'Restauração em nova instalação', 'Usuário final', 'Seleciona o snapshot, escolhe só os programas desejados num checklist e restaura em lote.'],
  ['UC07', 'Perfis temáticos', 'Desenvolvedor / Usuário avançado', 'Cria perfis como “Setup Web Dev” e instala de uma vez tudo que falta na máquina.'],
  ['UC08', 'Execução agendada headless', 'Sistema / Administrador de TI', 'schtasks dispara --check ou --update-all sem janela, com auditoria no SQLite e toast.'],
  ['UC09', 'Auto-cura de repositórios', 'Usuário com falhas de catálogo', 'Na manutenção das Configurações, executa winget source reset --force e valida as fontes.'],
  ['UC10', 'Inicialização silenciosa', 'Sistema / Usuário', 'Inicia com o Windows via --minimized, só na bandeja, consumindo ~7–15 MB.'],
];

@Component({
  selector: 'app-documentation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DocsLayoutComponent,
    DocSectionComponent,
    CComponent,
    CodeBlockComponent,
    DataTableComponent,
    MermaidComponent
  ],
  template: `
    <app-docs-layout
      eyebrow="Documentação"
      title="Como o WingetEasy funciona, clique a clique"
      description="Casos de uso formais, os fluxos de ponta a ponta com diagramas de sequência, a referência do modo headless e o catálogo de erros do winget traduzidos."
      [stats]="stats"
      [toc]="toc"
    >
      <!-- ========================================== -->
      <!-- 01. VISÃO GERAL                            -->
      <!-- ========================================== -->
      <app-doc-section
        id="visao-geral"
        index="01"
        title="Visão geral"
        lead="O winget é poderoso, mas é uma ferramenta de terminal. O WingetEasy coloca as atualizações do Windows numa interface nativa, discreta e com controle deliberado pelo usuário."
      >
        <ul class="space-y-3">
          <li class="flex gap-3 leading-relaxed text-subtle">
            <span class="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-brand-cyan"></span>
            <span>Verifica e aplica atualizações de todos os apps instalados via winget, com categorias, busca e filtros.</span>
          </li>
          <li class="flex gap-3 leading-relaxed text-subtle">
            <span class="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-brand-cyan"></span>
            <span>Resolve os problemas reais do dia a dia: apps abertos, pedidos de administrador, pacotes em loop e fontes corrompidas.</span>
          </li>
          <li class="flex gap-3 leading-relaxed text-subtle">
            <span class="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-brand-cyan"></span>
            <span>Guarda snapshots da máquina, gera scripts PowerShell e monta perfis para reinstalar tudo em outro PC.</span>
          </li>
          <li class="flex gap-3 leading-relaxed text-subtle">
            <span class="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-brand-cyan"></span>
            <span>Roda discretamente na bandeja ou sem interface nenhuma, pelo Agendador de Tarefas.</span>
          </li>
        </ul>
      </app-doc-section>

      <!-- ========================================== -->
      <!-- 02. TELAS DO APLICATIVO                    -->
      <!-- ========================================== -->
      <app-doc-section
        id="telas"
        index="02"
        title="Telas do aplicativo"
        lead="Navegação lateral com NavigationView, tema claro/escuro e idioma PT-BR/EN-US alternáveis na barra de título."
      >
        <app-data-table
          [head]="['Tela', 'Para que serve']"
          [rows]="[
            ['UpdatesPage', 'Central de atualizações: banner de estado, chips Todos/Apps/Runtimes/Segurança, busca, adiados e barra de progresso do lote.'],
            ['UpdateFlyout', 'Painel rápido da bandeja com efeito acrílico, checklist com rolagem e botão “Atualizar Selecionados (N)”.'],
            ['HistoryPage', 'Linha do tempo agrupada por data, filtros 24 h/7 dias/30 dias/Tudo e exportação CSV.'],
            ['BackupPage', 'Snapshots em cartões: Restaurar, Exportar .json, Exportar .ps1, Transformar em perfil e Excluir.'],
            ['ProfilesPage', 'Catálogo de perfis com nome, descrição, contagem de pacotes e instalação em lote.'],
            ['SettingsPage', 'Bandeja e inicialização, automação, notificações, auto-cura de fontes e atualização via Velopack.']
          ]"
        ></app-data-table>
      </app-doc-section>

      <!-- ========================================== -->
      <!-- 03. CASOS DE USO                           -->
      <!-- ========================================== -->
      <app-doc-section
        id="casos-de-uso"
        index="03"
        title="Casos de uso"
        lead="Especificação formal dos cenários que o WingetEasy cobre."
      >
        <div class="grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2">
          @for (uc of useCases; track uc[0]) {
            <div class="bg-background p-6">
              <div class="flex items-center justify-between gap-3">
                <span class="font-mono text-[12px] text-brand-cyan">{{ uc[0] }}</span>
                <span class="text-right font-mono text-[11.5px] text-muted-foreground">{{ uc[2] }}</span>
              </div>
              <h3 class="mt-2 text-lg font-semibold tracking-tight">{{ uc[1] }}</h3>
              <p class="mt-2 leading-relaxed text-subtle">{{ uc[3] }}</p>
            </div>
          }
        </div>
      </app-doc-section>

      <!-- ========================================== -->
      <!-- 04. FLUXO: VERIFICAÇÃO                     -->
      <!-- ========================================== -->
      <app-doc-section
        id="fluxo-verificacao"
        index="04"
        title="Verificação de atualizações"
        lead="Disparada por F5, pelo botão “Verificar agora”, pelo temporizador periódico, pela tarefa agendada ou por --check."
      >
        <app-mermaid [code]="diagrams.checkUpdates" title="Fluxo 1 · Verificação manual ou agendada"></app-mermaid>
      </app-doc-section>

      <!-- ========================================== -->
      <!-- 05. FLUXO: ATUALIZAÇÃO EM LOTE             -->
      <!-- ========================================== -->
      <app-doc-section
        id="fluxo-atualizacao"
        index="05"
        title="Atualização em lote"
        lead="Três fases: pré-voo de processos conflitantes, lote de usuário padrão e fallback UAC em lote único."
      >
        <app-mermaid [code]="diagrams.batchUpdate" title="Fluxo 2 · Lote com detecção de processos e fallback UAC"></app-mermaid>
      </app-doc-section>

      <!-- ========================================== -->
      <!-- 06. FLUXO: CANCELAMENTO                    -->
      <!-- ========================================== -->
      <app-doc-section
        id="fluxo-cancelamento"
        index="06"
        title="Cancelamento em tempo real"
        lead="O sinal de cancelamento atravessa todas as camadas até encerrar o instalador em execução."
      >
        <app-mermaid [code]="diagrams.cancel" title="Fluxo 3 · Cancelamento"></app-mermaid>
      </app-doc-section>

      <!-- ========================================== -->
      <!-- 07. FLUXO: SNAPSHOT E POWERSHELL           -->
      <!-- ========================================== -->
      <app-doc-section
        id="fluxo-backup"
        index="07"
        title="Snapshot e exportação PowerShell"
        lead="winget export enriquecido com nome da máquina, versão do Windows e data, salvo no SQLite e opcionalmente exportado como script."
      >
        <app-mermaid [code]="diagrams.backup" title="Fluxo 4 · Criação de snapshot e .ps1"></app-mermaid>
        <app-code-block
          label="Script .ps1 gerado (trecho)"
          code="#Requires -RunAsAdministrator\nWrite-Host 'Iniciando instalacao dos programas via Winget...' -ForegroundColor Cyan\n\nwinget install --id 'Google.Chrome' --exact --silent --accept-package-agreements --accept-source-agreements\nwinget install --id 'Git.Git' --exact --silent --accept-package-agreements --accept-source-agreements"
        ></app-code-block>
      </app-doc-section>

      <!-- ========================================== -->
      <!-- 08. FLUXO: RESTAURAÇÃO GRANULAR           -->
      <!-- ========================================== -->
      <app-doc-section
        id="fluxo-restauracao"
        index="08"
        title="Restauração granular"
        lead="Todos os pacotes vêm marcados; o usuário desmarca o que não quer e acompanha o progresso item a item."
      >
        <app-mermaid [code]="diagrams.restore" title="Fluxo 5 · Restauração via snapshot"></app-mermaid>
      </app-doc-section>

      <!-- ========================================== -->
      <!-- 09. FLUXO: AUTO-CURA DE FONTES            -->
      <!-- ========================================== -->
      <app-doc-section
        id="fluxo-autocura"
        index="09"
        title="Auto-cura de fontes do WinGet"
        lead="Quando o catálogo corrompe ou gera timeouts, um clique restaura as fontes oficiais."
      >
        <app-mermaid [code]="diagrams.repair" title="Fluxo 6 · Self-healing"></app-mermaid>
      </app-doc-section>

      <!-- ========================================== -->
      <!-- 10. MODO HEADLESS (CLI)                   -->
      <!-- ========================================== -->
      <app-doc-section
        id="cli"
        index="10"
        title="Modo headless (CLI)"
        lead="Para scripts, terminal e agendadores — sem carregar a interface WinUI."
      >
        <app-data-table
          [head]="['Argumento', 'Efeito']"
          [rows]="[
            ['--check', 'Verifica atualizações silenciosamente. Retorna 0 se tudo estiver atualizado ou 10 se houver pendências.'],
            ['--update-all', 'Atualiza automaticamente todos os pacotes pendentes.'],
            ['--minimized', 'Inicia direto na bandeja do sistema, sem janela.'],
            ['--backup <caminho>', 'Gera um snapshot no arquivo informado.'],
            ['--restore <caminho>', 'Restaura os pacotes de um snapshot.']
          ]"
        ></app-data-table>

        <app-data-table
          [head]="['Código', 'Significado']"
          [rows]="[
            ['0', 'Sucesso / nenhuma ação pendente'],
            ['1', 'Erro genérico de execução'],
            ['2', 'Argumentos inválidos'],
            ['10', 'Atualizações disponíveis encontradas (durante --check)'],
            ['11', 'Falha ao executar uma ou mais atualizações']
          ]"
        ></app-data-table>

        <app-code-block
          label="Tarefa agendada · WingetEasy_Background_Check"
          code="Ação:      WingetEasy.App.exe --check\nGatilho:   diário ou repetição configurável (SettingsPage)\nCondições: RunOnlyIfNetworkAvailable = true\n           DisallowStartIfOnBatteries = false\n           StopIfGoingOnBatteries = false"
        ></app-code-block>
      </app-doc-section>

      <!-- ========================================== -->
      <!-- 11. CÓDIGOS DE ERRO                       -->
      <!-- ========================================== -->
      <app-doc-section
        id="erros"
        index="11"
        title="Códigos de erro do winget"
        lead="O WingetErrorTranslator converte HRESULTs em mensagens em português e decide a próxima ação."
      >
        <app-data-table
          [head]="['Hex', 'Inteiro', 'Mensagem no WingetEasy']"
          [mono]="[0, 1]"
          [rows]="[
            ['0x8A150056', '-1978335146', 'O aplicativo está aberto no momento. Feche-o e tente novamente.'],
            ['0x8A15004E', '-1978335154', 'Atualização aplicada com sucesso! Reinicie o computador para concluir. (tratado como sucesso)'],
            ['0x8A150014', '-1978335212', 'Esta atualização requer permissões de Administrador. (dispara o fallback UAC)'],
            ['0x8A15002B', '-1978335189', 'O arquivo baixado tem assinatura diferente do catálogo. Pode ser um erro temporário do fabricante.'],
            ['0x8A150011', '-1978335215', 'O instalador deste programa não suporta atualização silenciosa.'],
            ['0x8A15002E', '-1978335186', 'O pacote já se encontra na versão mais recente compatível.']
          ]"
        ></app-data-table>
      </app-doc-section>

      <!-- ========================================== -->
      <!-- 12. CONFIGURAÇÕES                         -->
      <!-- ========================================== -->
      <app-doc-section
        id="configuracoes"
        index="12"
        title="Configurações e efeito imediato"
        lead="Cada toggle é gravado atomicamente no SettingsRepository e lido pelo serviço que depende dele."
      >
        <app-data-table
          [head]="['Configuração', 'Onde é avaliada']"
          [rows]="[
            ['KeepInSystemTray', 'Em MainWindow.AppWindow_Closing: esconde na bandeja ou encerra o app.'],
            ['AutoStart', 'Registro em HKCU\\…\\Run com --minimized.'],
            ['AutoUpdate', 'Cria ou remove a tarefa no Agendador de Tarefas do Windows.'],
            ['IncludeBetaVersions', 'Libera versões beta, rc, preview, canary, insider e nightly na verificação.'],
            ['QuietHours', 'Em ToastNotificationService, antes de exibir qualquer alerta.'],
            ['NotificationSound', 'Aplicado na carga da notificação do Windows.'],
            ['WindowBounds', 'Carregado no construtor de MainWindow para restaurar posição e tamanho.']
          ]"
        ></app-data-table>
      </app-doc-section>

      <!-- ========================================== -->
      <!-- 13. PRÓXIMOS PASSOS (ROADMAP)             -->
      <!-- ========================================== -->
      <app-doc-section
        id="roadmap"
        index="13"
        title="Próximos passos"
        lead="Milestone 6 — distribuição."
      >
        <ul class="space-y-3">
          <li class="flex gap-3 leading-relaxed text-subtle">
            <span class="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-brand-cyan"></span>
            <span>Finalização do manifesto MSIX (<app-c>Package.appxmanifest</app-c>).</span>
          </li>
          <li class="flex gap-3 leading-relaxed text-subtle">
            <span class="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-brand-cyan"></span>
            <span>Pipeline de CI/CD para releases automatizadas (<app-c>release.yml</app-c> com Velopack).</span>
          </li>
          <li class="flex gap-3 leading-relaxed text-subtle">
            <span class="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-brand-cyan"></span>
            <span>Submissão ao repositório oficial <app-c>microsoft/winget-pkgs</app-c>.</span>
          </li>
        </ul>
      </app-doc-section>
    </app-docs-layout>
  `
})
export class DocumentationComponent {
  readonly toc = TOC;
  readonly stats = STATS;
  readonly diagrams = DIAGRAMS;
  readonly useCases = USE_CASES;
}

