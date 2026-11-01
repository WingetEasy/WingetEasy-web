// Mermaid diagrams taken from the WingetEasy technical documentation.
// "<" and ">" inside labels are written as #lt; / #gt; (Mermaid entity codes).

export const DIAGRAMS = {
  layers: `flowchart TB
    subgraph APP["WingetEasy.App · Apresentação (WinUI 3)"]
      direction LR
      V["Views XAML<br/>UpdatesPage · HistoryPage · BackupPage<br/>ProfilesPage · SettingsPage · UpdateFlyout"]
      VM["ViewModels MVVM<br/>CommunityToolkit.Mvvm"]
      T["Bandeja<br/>H.NotifyIcon"]
      V --> VM
      T --> VM
    end
    subgraph CORE["WingetEasy.Core · Domínio e serviços"]
      direction LR
      I["Interfaces<br/>IWingetService · IUpdateService · IBackupService<br/>IProfilesService · ISchedulerService …"]
      S["Serviços<br/>WingetService · UpdateService · BackupService<br/>AdminElevationHelper · HeadlessRunner"]
      S -. implementa .-> I
    end
    subgraph DATA["WingetEasy.Data · Persistência"]
      direction LR
      R["Repositórios<br/>Settings · UpdateHistory · Package<br/>BackupSnapshot · Profile · CheckLog"]
      DB[("SQLite · EF Core<br/>WAL")]
      R --> DB
    end
    OS["Windows<br/>winget.exe · UAC · Agendador · Toasts"]
    VM -->|"depende de interfaces"| I
    R -. implementa contratos .-> I
    S --> OS
    APP -. "composição via DI" .-> DATA`,

  lifecycle: `stateDiagram-v2
    [*] --> ProcessStart: Usuário clica no ícone / Windows inicializa

    state ProcessStart {
        [*] --> SerilogInit: Configura log diário em LocalAppData
        SerilogInit --> VelopackHook: VelopackApp.Build().Run()
        VelopackHook --> SingleInstanceCheck: Verifica Mutex WingetEasy_SingleInstance
        SingleInstanceCheck --> ParseArgs: CliArgumentsParser.TryParse()
    }

    ProcessStart --> ElevatedWorker: Contém --elevated-update (Job UAC)
    ProcessStart --> HeadlessMode: Contém --check / --update-all
    ProcessStart --> MinimizedBoot: Contém --minimized (Autostart Windows)
    ProcessStart --> NormalDesktop: Sem argumentos (Início com Janela)

    state ElevatedWorker {
        [*] --> RunElevatedJob: Lê TEMP/job_guid.json
        RunElevatedJob --> ExecWingetUAC: Executa winget upgrade em lote como Admin
        ExecWingetUAC --> WriteResultJSON: Grava TEMP/result_guid.json
        WriteResultJSON --> ExitElevated: Environment.Exit(0)
    }

    state HeadlessMode {
        [*] --> HeadlessDbMigrate: Database.Migrate()
        HeadlessDbMigrate --> HeadlessRunnerExec: HeadlessRunner.RunAsync()
        HeadlessRunnerExec --> ExitHeadless: Retorna ExitCode (0, 10, 11)
    }

    state MinimizedBoot {
        [*] --> AllocDiMin: Registra Singletons no IServiceProvider
        AllocDiMin --> TrayOnly: Instancia H.NotifyIcon (Sem janela DirectX)
        TrayOnly --> CheckInitialMin: Executa verificação silenciosa
        CheckInitialMin --> TrimRamMin: P/Invoke EmptyWorkingSet (7 MB a 15 MB RAM)
    }

    state NormalDesktop {
        [*] --> AllocDiFull: Configura DI Container completo
        AllocDiFull --> MigrateDb: EF Core SQLite WAL (AppDbContext)
        MigrateDb --> CreateWindow: new MainWindow()
        CreateWindow --> SetupMica: Vincula MicaBackdrop e customiza TitleBar Win32
        SetupMica --> RestoreCoords: Restaura WindowBounds do SQLite
        RestoreCoords --> RenderUI: Carrega UpdatesPage no ContentFrame
    }

    MinimizedBoot --> IdleTray: Permanece ativo na bandeja do sistema
    NormalDesktop --> UserInteraction: Janela aberta aguardando ações do usuário

    state UserInteraction {
        [*] --> WaitEvent
        WaitEvent --> ClickButton: Clique em botão / Atalho de teclado
        ClickButton --> ViewModelDispatch: RelayCommand acionado no ViewModel
        ViewModelDispatch --> CoreExecution: IWingetService / IUpdateService
        CoreExecution --> SqliteUpdate: Persistência atômica no SQLite
        SqliteUpdate --> UIUpdate: DispatcherQueue atualiza elementos XAML
        UIUpdate --> WaitEvent
    }

    UserInteraction --> CloseToTray: Clica no botão X de fechar janela

    state CloseToTray {
        [*] --> CheckKeepInTray: Consulta KeepInSystemTray no SQLite
        CheckKeepInTray --> HideWindow: Se true, sender.Hide()
        HideWindow --> ClearXamlTree: ContentFrame.Content = null e BackStack.Clear()
        ClearXamlTree --> EmptyWorkingSetCall: GC.Collect(2) + EmptyWorkingSet()
        CheckKeepInTray --> TerminateApp: Se false, App.Current.Exit()
    }

    CloseToTray --> IdleTray
    IdleTray --> NormalDesktop: Clique no ícone da bandeja / Notificação Toast
    CloseToTray --> [*]
    ElevatedWorker --> [*]
    HeadlessMode --> [*]`,

  boot: `sequenceDiagram
    autonumber
    actor User as Usuário
    participant Win as Windows OS
    participant App as App.xaml.cs
    participant DI as IServiceProvider
    participant Shell as MainWindow.xaml.cs
    participant Page as UpdatesPage.xaml
    participant VM as UpdatesViewModel
    participant Core as WingetService
    participant DB as SQLite (AppDbContext)
    participant RAM as Gerenciador de RAM (Psapi)

    User->>Win: Clica duas vezes no executável WingetEasy.App.exe
    Win->>App: Invoca Main() -> Construtor App()
    App->>App: Inicia Serilog e executa VelopackApp.Build().Run()
    App->>DI: ConfigureServices() (Aloca Singletons e IDbContextFactory)
    App->>Win: Registra AppNotificationManager (Toasts)

    Win->>App: Invoca OnLaunched(args)
    App->>DB: Database.MigrateAsync() (Aplica migrations pendentes)
    App->>Shell: Inicia ShowMainWindow() -> new MainWindow()

    Shell->>Win: WinRT WindowNative.GetWindowHandle(this) -> HWND
    Shell->>Shell: titleBar.ExtendsContentIntoTitleBar = true (Fluent Design)
    Shell->>DB: SettingsRepository.GetAsync("WindowBounds")
    DB-->>Shell: Retorna "140,120,1080,760"
    Shell->>Win: MoveAndResize(x, y, w, h)

    Shell->>Page: ContentFrame.Navigate(typeof(UpdatesPage))
    Page->>VM: Assina DataContext = UpdatesViewModel (Singleton)

    VM->>Core: CheckUpdatesAsync()
    Core->>Win: Process.Start("winget.exe upgrade --accept-source-agreements")
    Win-->>Core: Stream stdout assíncrono
    Core->>Core: Parsing posicional e categorização semântica
    Core-->>VM: Retorna lista de pacotes
    VM-->>Page: Atualiza ObservableCollection de itens na tela

    User->>Shell: Clica no botão "X" (Fechar janela)
    Shell->>Shell: AppWindow_Closing(args) -> args.Cancel = true
    Shell->>DB: SaveWindowStateAsync(WindowBounds)
    Shell->>Win: sender.Hide() (Oculta da tela)
    Shell->>Shell: ContentFrame.Content = null (Desaloca buffers da GPU)
    Shell->>RAM: App.OptimizeBackgroundMemory() -> EmptyWorkingSet()
    Note over RAM: Memória cai de ~65 MB para ~11 MB na bandeja`,

  trayMemory: `sequenceDiagram
    autonumber
    actor User as Usuário
    participant View as MainWindow (Botão Fechar X)
    participant Settings as SettingsRepository (SQLite)
    participant WinRT as AppWindow / Frame XAML
    participant Memory as Gerenciador de Memória (K32 / Psapi / GC)
    participant Tray as System Tray (H.NotifyIcon)

    User->>View: Clica no botão de fechar "X" no topo da janela
    View->>View: Intercepta o evento nativo AppWindow_Closing(args)

    View->>Settings: GetAsync#lt;bool#gt;("KeepInSystemTray")
    Settings-->>View: Retorna valor configurado (ex: true)

    alt KeepInSystemTray == true (Manter na Bandeja)
        View->>View: args.Cancel = true (Cancela o encerramento do processo)
        View->>Settings: SaveWindowStateAsync(X, Y, Width, Height)
        Settings-->>View: Coordenadas salvas no banco

        View->>WinRT: sender.Hide() (Oculta a janela da barra de tarefas e da tela)
        View->>WinRT: ContentFrame.Content = null e ContentFrame.BackStack.Clear()
        Note over View,WinRT: Libera buffers DirectX e elementos visuais da GPU

        View->>Memory: GCSettings.LargeObjectHeapCompactionMode = CompactOnce
        View->>Memory: GC.Collect(2, Aggressive, blocking: true, compacting: true)
        View->>Memory: P/Invoke EmptyWorkingSet(GetCurrentProcess().Handle)
        Memory-->>View: Páginas físicas ociosas são liberadas para a paginação

        View->>Tray: Mantém o ícone ativo na área de notificação do Windows
        Note over Tray: Consumo de memória RAM reduzido para 7 MB – 15 MB
    else KeepInSystemTray == false (Encerrar Aplicação)
        View->>Settings: SaveWindowStateAsync(X, Y, Width, Height)
        View->>View: args.Cancel = false
        View->>WinRT: Invoca App.Current.Exit()
        Note over View,WinRT: Processo finalizado por completo
    end`,

  circuitBreaker: `stateDiagram-v2
    direction LR
    [*] --> Closed
    Closed --> Closed: Sucesso (zera contador de falhas)
    Closed --> Open: 3 falhas consecutivas
    Open --> HalfOpen: Backoff expira (30 min, 1 h, 2 h)
    HalfOpen --> Closed: Verificação de teste bem-sucedida
    HalfOpen --> Open: Falha (espera ampliada)
    note right of Closed
      PeriodicTimer dispara no intervalo
      configurado (ex.: a cada 4 horas)
    end note`,

  er: `erDiagram
    Settings {
      TEXT Key PK
      TEXT Value
      TEXT UpdatedAt
    }
    UpdateHistories {
      INTEGER Id PK
      TEXT PackageId
      TEXT PackageName
      TEXT FromVersion
      TEXT ToVersion
      INTEGER Status
      TEXT ErrorMessage
      TEXT ExecutedAt
    }
    Packages {
      TEXT PackageId PK
      INTEGER IsPinned
      TEXT SuppressionReason
      TEXT IgnoredVersion
      TEXT SuppressedUntil
    }
    BackupSnapshots {
      TEXT Id PK
      TEXT Name
      TEXT MachineName
      INTEGER PackageCount
      TEXT JsonData
      TEXT CreatedAt
    }
    Profiles {
      TEXT Id PK
      TEXT Name
      TEXT Description
      TEXT PackageIdsJson
      TEXT CreatedAt
    }
    CheckLogs {
      INTEGER Id PK
      TEXT ExecutedAt
      INTEGER DurationMs
      INTEGER PackagesFound
      INTEGER Success
      TEXT ErrorMessage
    }
    Packages ||--o{ UpdateHistories : "PackageId"`,

  checkUpdates: `sequenceDiagram
    autonumber
    actor User as Usuário / Temporizador
    participant View as UpdatesPage (WinUI 3 XAML)
    participant VM as UpdatesViewModel (MVVM)
    participant Core as WingetService (Core Domain)
    participant OS as Sistema Operacional (winget.exe)
    participant DB as SQLite (CheckLogs / Packages)

    User->>View: Pressiona F5 ou Clica em "Verificar agora"
    View->>VM: Dispara CheckUpdatesCommand
    VM->>VM: Define IsChecking = true (Ativa ProgressRing)
    VM->>Core: CheckUpdatesAsync(includeBeta = false)

    Core->>OS: Process.Start("winget.exe upgrade --accept-source-agreements")
    OS-->>Core: Stream stdout assíncrono (linha por linha)

    Core->>Core: Parsing posicional de colunas (Nome, Id, Versão, Disponível)
    Core->>Core: Categorização semântica (App, Runtime, Security)

    Core->>DB: Consulta regras de supressão ativas (PackageRepository)
    DB-->>Core: Lista de pacotes ignorados/adiados

    Core->>Core: UpdateLoopDetector (Filtra loops de 'Unknown' ou atualizados #lt; 24h)
    Core-->>VM: Retorna IReadOnlyList#lt;WingetPackage#gt;

    VM->>DB: CheckLogRepository.AddAsync(duração, pacotesEncontrados, sucesso)
    DB-->>VM: Confirmação de persistência

    VM->>VM: Repopula ObservableCollection#lt;PackageItemViewModel#gt;
    VM->>VM: Define IsChecking = false (Desativa ProgressRing)
    VM-->>View: Notifica PropertyChanged via DispatcherQueue
    View-->>User: Atualiza contadores do Hero Banner ("X atualizações disponíveis")`,

  batchUpdate: `sequenceDiagram
    autonumber
    actor User as Usuário
    participant View as UpdatesPage / UpdateFlyout
    participant VM as UpdatesViewModel
    participant UpdService as UpdateService (Orquestrador)
    participant ProcService as RunningProcessService
    participant ElevHelper as AdminElevationHelper
    participant OS as Windows (Processos / UAC)
    participant DB as SQLite (UpdateHistories)

    User->>View: Clica em "Atualizar Selecionados"
    View->>VM: Dispara UpdateSelectedCommand
    VM->>VM: Define IsUpdating = true, instancia CancellationTokenSource
    VM->>UpdService: ExecuteUpdatesAsync(packageIds, metadata, callbacks)

    Note over UpdService,ProcService: Fase 1: Pré-Voo de Processos Conflitantes
    UpdService->>ProcService: CheckRunningProcessesAsync(packageIds)
    ProcService->>OS: Process.GetProcessesByName() e inspeciona MainWindowHandle
    OS-->>ProcService: Detecta ex: "chrome.exe" ativo com janela aberta
    ProcService-->>UpdService: Retorna ProcessSnapshot(conflito detectado)
    UpdService->>VM: Aciona callback HandleRunningApp("Google.Chrome")
    VM->>View: Exibe RunningProcessConflictDialog
    User->>View: Escolhe "Fechar aplicativo e atualizar"
    View-->>VM: Confirmação de fechamento
    VM->>ProcService: CloseProcessAsync(snapshot, force: false)
    ProcService->>OS: process.CloseMainWindow() (Timeout 5s)
    OS-->>ProcService: Processo encerrado com sucesso

    Note over UpdService,OS: Fase 2: Lote de Usuário Padrão
    loop Para cada pacote do lote padrão
        UpdService->>OS: winget.exe upgrade --id #lt;id#gt; --silent
        OS-->>UpdService: Telemetria stdout ("Baixando..." / "Instalando...")
        UpdService-->>VM: Reporta progresso percentual e fase atual
        VM-->>View: Atualiza anel de progresso e texto da linha
        OS-->>UpdService: Retorna ExitCode

        alt Sucesso Normal (ExitCode == 0 ou 0x8A15004E - Reboot)
            UpdService->>DB: UpdateHistoryRepository.AddAsync(FromVersion, ToVersion, Success)
        else Requer Permissões Administrativas (ExitCode == 0x8A150014)
            UpdService->>UpdService: Enfileira pacote na 'elevatedQueue'
        end
    end

    Note over UpdService,ElevHelper: Fase 3: Fallback UAC em Lote Único
    opt Se houver pacotes em 'elevatedQueue'
        UpdService->>VM: Aciona callback ConfirmElevation()
        VM->>View: Exibe ElevationConfirmationDialog
        User->>View: Confirma autorização de administrador
        UpdService->>ElevHelper: ExecuteElevatedAsync(elevatedQueue)
        ElevHelper->>ElevHelper: Grava TEMP/WingetEasy/job_#lt;guid#gt;.json
        ElevHelper->>OS: Process.Start("WingetEasy.App.exe --elevated-update #lt;jobPath#gt;", Verb="runas")
        OS->>User: Exibe prompt nativo do UAC do Windows (1 único consentimento)
        User->>OS: Autoriza UAC
        OS->>OS: Processo elevado executa winget upgrade em lote
        OS-->>ElevHelper: Conclusão e gravação de result_#lt;guid#gt;.json
        ElevHelper-->>UpdService: Retorna lista de UpdateResult do lote elevado
        UpdService->>DB: Grava histórico de cada pacote elevado em UpdateHistories
    end

    UpdService-->>VM: Retorna lista consolidada de resultados
    VM->>VM: Define IsUpdating = false
    VM-->>View: Exibe UpdateSummaryDialog (Relatório de Sucessos e Falhas)
    View-->>User: Exibe resumo final e remove concluídos da lista`,

  cancel: `sequenceDiagram
    autonumber
    actor User as Usuário
    participant View as UpdatesPage (Botão Cancelar)
    participant VM as UpdatesViewModel
    participant UpdService as UpdateService
    participant OS as Sistema Operacional (winget.exe)

    Note over VM,OS: Atualizações em andamento (Pacote 2 de 5)
    User->>View: Clica no botão "Cancelar"
    View->>VM: Dispara CancelUpdatesCommand
    VM->>VM: Desabilita botão "Cancelar" e define texto "Cancelando..."
    VM->>VM: Invoca CancellationTokenSource.Cancel()

    VM-->>UpdService: Sinal de cancelamento propagado via CancellationToken
    UpdService->>OS: Identifica processo filho ativo e invoca process.Kill()
    OS-->>UpdService: Processo do instalador finalizado imediatamente

    UpdService->>UpdService: Marca pacotes restantes da fila como UpdateStatus.Cancelled
    UpdService-->>VM: Retorna OperationCanceledException com resultados parciais

    VM->>VM: Define IsUpdating = false
    VM->>VM: Reseta barra de progresso horizontal
    VM-->>View: Restaura pacotes não atualizados para o estado 'Pendente'
    View-->>User: Exibe InfoBar ("Atualização cancelada pelo usuário")`,

  backup: `sequenceDiagram
    autonumber
    actor User as Usuário
    participant View as BackupPage
    participant VM as BackupViewModel
    participant BackupSvc as BackupService (Core Domain)
    participant OS as Windows (winget.exe / Explorer)
    participant DB as SQLite (BackupSnapshots)

    User->>View: Clica no botão "Criar Snapshot"
    View->>VM: Dispara CreateSnapshotCommand
    VM->>VM: Define IsLoading = true
    VM->>BackupSvc: CreateSnapshotAsync("Backup Automático")

    BackupSvc->>OS: winget.exe export -o "TEMP/export.json" --accept-source-agreements
    OS-->>BackupSvc: Arquivo JSON exportado com sucesso

    BackupSvc->>BackupSvc: Lê JSON e enriquece com metadados (MachineName, Data, Versão SO)
    BackupSvc->>DB: BackupSnapshotRepository.AddAsync(snapshotEntity)
    DB-->>BackupSvc: Confirma gravação com GUID gerado
    BackupSvc-->>VM: Retorna objeto BackupSnapshot criado

    VM->>VM: Adiciona novo cartão na ObservableCollection de snapshots
    VM->>VM: Define IsLoading = false
    View-->>User: Exibe novo cartão de snapshot na tela

    opt Exportação como Script PowerShell (.ps1)
        User->>View: Clica em "Exportar PowerShell (.ps1)" no cartão
        View->>VM: Dispara ExportPowerShellCommand
        VM->>BackupSvc: GeneratePowerShellScript(snapshot.JsonData)
        BackupSvc->>BackupSvc: Compila script com Requires -RunAsAdministrator e winget install
        BackupSvc-->>VM: Retorna string do script .ps1
        VM->>OS: Abre SaveFilePicker / Win32SaveFileDialog
        User->>OS: Seleciona diretório e clica em "Salvar"
        OS-->>VM: Retorna StorageFile de destino
        VM->>OS: Grava arquivo de texto UTF-8 no caminho selecionado
        VM-->>View: Exibe Toast de sucesso com o caminho do arquivo
    end`,

  restore: `flowchart TD
    Start(["Início: Usuário clica em 'Restaurar' no cartão de Snapshot"]) --> OpenModal["BackupViewModel lê JSON do snapshot e abre RestoreSnapshotDialog"]
    OpenModal --> PopulateList["Apresenta lista com todos os programas contidos no backup"]
    PopulateList --> CheckboxDefault["Todas as checkboxes são marcadas por padrão (true)"]
    CheckboxDefault --> UserChoice{"Usuário deseja filtrar algum pacote?"}

    UserChoice -- Sim --> DeselectItems["Usuário desmarca ferramentas não desejadas"]
    UserChoice -- Não --> ConfirmRestore["Usuário clica em 'Restaurar Selecionados (N)'"]
    DeselectItems --> ConfirmRestore

    ConfirmRestore --> DispatchRestore["Invoca IBackupService.RestoreSnapshotAsync(selectedIds)"]
    DispatchRestore --> LoopPackages["Inicia iteração sequencial sobre os pacotes marcados"]

    LoopPackages --> RunWinget["Executa winget install --id #lt;id#gt; --exact --silent"]
    RunWinget --> CheckExit{"Código de Saída == 0?"}

    CheckExit -- Sim --> SuccessItem["Registra item como sucesso"]
    CheckExit -- Não --> TranslateErr["Passa erro por WingetErrorTranslator e registra falha"]

    SuccessItem --> UpdateProgress["Reporta progresso percentual para o modal"]
    TranslateErr --> UpdateProgress

    UpdateProgress --> HasMore{"Existem mais pacotes na fila?"}
    HasMore -- Sim --> LoopPackages
    HasMore -- Não --> ShowSummary["Exibe relatório no modal: 'X de Y pacotes restaurados com sucesso'"]
    ShowSummary --> Finish(["Fim do Fluxo"])`,

  repair: `sequenceDiagram
    autonumber
    actor User as Usuário
    participant View as SettingsPage (Card de Manutenção)
    participant VM as SettingsViewModel
    participant WingetSvc as WingetService
    participant OS as Sistema Operacional (winget.exe)

    User->>View: Clica no botão "Reparar Fontes do WinGet"
    View->>VM: Dispara RepairSourcesCommand
    VM->>VM: Define IsRepairing = true (Desabilita botão e ativa ProgressRing)
    VM->>WingetSvc: RepairSourcesAsync()

    WingetSvc->>OS: Process.Start("winget.exe source reset --force")
    OS->>OS: Restaura os repositórios locais para o padrão oficial da Microsoft
    OS-->>WingetSvc: Processo finalizado com código de saída 0

    WingetSvc->>OS: Process.Start("winget.exe source list")
    OS-->>WingetSvc: Retorna fontes ativas ("winget", "msstore")

    WingetSvc-->>VM: Retorna true (Auto-cura concluída)
    VM->>VM: Define IsRepairing = false
    VM->>VM: Atualiza status do card para "Fontes ativas e operacionais"
    VM-->>View: Exibe badge verde com ícone de verificação
    View-->>User: Feedback visual de restauração concluída`,
} as const;

export type DiagramKey = keyof typeof DIAGRAMS;
