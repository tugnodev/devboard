# Frontend Architecture Refactor — DevBoard

**Date** : 2026-10-02
**Statut** : Approuvé
**Objectif** : Refonte complète de l'architecture frontend pour faciliter le changement de thème et séparer la logique métier des composants.

---

## 1. Contexte

### Problèmes actuels
- Logique métier dans les composants (monitoring, invoke Tauri)
- Stores mutables directement dans les composants
- Double initialisation du bridge Tauri
- Pas de toggle de thème
- Fichiers vides et composants inutilisés
- DTOs avec mocks mélangés aux types

### Objectifs
- Stores Svelte 5 runes (classes TypeScript)
- Services par domaine avec logique métier centralisée
- Service thème avec détection système + toggle manuel + persistance
- Structure par domaine claire
- Composants Svelte pur (pas de logique métier)

---

## 2. Architecture des Stores

### Pattern : Classes avec runes Svelte 5

Chaque store est une classe TypeScript avec :
- **État privé** via `$state`
- **Getters réactifs** pour lire l'état
- **Actions** pour modifier l'état
- **Propriétés dérivées** via `$derived`

### Stores à créer

#### `src/lib/states/AppState.ts`
```typescript
class AppState {
  private _state = $state({
    overlayVisible: false,
    active: false,
    interval: 1000
  });

  get overlayVisible() { return this._state.overlayVisible; }
  get active() { return this._state.active; }
  get interval() { return this._state.interval; }

  showOverlay() { this._state.overlayVisible = true; }
  hideOverlay() { this._state.overlayVisible = false; }
  setActive(active: boolean) { this._state.active = active; }
}

export const appState = new AppState();
```

#### `src/lib/states/ThemeState.ts`
```typescript
class ThemeState {
  private _state = $state({
    theme: 'light' as 'light' | 'dark',
    systemTheme: 'light' as 'light' | 'dark'
  });

  get theme() { return this._state.theme; }
  get systemTheme() { return this._state.systemTheme; }
  get isDark() { return this._state.theme === 'dark'; }

  toggleTheme() {
    this._state.theme = this._state.theme === 'light' ? 'dark' : 'light';
    this._applyTheme();
  }

  setTheme(theme: 'light' | 'dark') {
    this._state.theme = theme;
    this._applyTheme();
  }

  private _applyTheme() {
    document.documentElement.dataset.theme = this._state.theme;
  }
}

export const themeState = new ThemeState();
```

#### `src/lib/states/RoutesState.ts`
```typescript
class RoutesState {
  private _state = $state({
    routes: [
      { name: 'Home', path: '/overlay', icon: House },
      { name: 'Monitor', path: '/overlay/monitor', icon: MonitorDot },
      { name: 'Projects', path: '/overlay/projects', icon: Folder },
      { name: 'Settings', path: '/overlay/settings', icon: Settings2Icon },
    ]
  });

  get routes() { return this._state.routes; }
}

export const routesState = new RoutesState();
```

#### `src/lib/states/monitor/CpuState.ts`
```typescript
class CpuState {
  private _state = $state({
    globalUsage: 0,
    threadUsage: [] as number[],
    globalFrequency: 0,
    threadFrequency: [] as number[],
    maxFrequency: 0
  });

  get globalUsage() { return this._state.globalUsage; }
  get threadUsage() { return this._state.threadUsage; }
  get globalFrequency() { return this._state.globalFrequency; }
  get threadFrequency() { return this._state.threadFrequency; }
  get maxFrequency() { return this._state.maxFrequency; }

  update(data: RealtimeCpuData) {
    this._state.globalUsage = data.globalUsage;
    this._state.threadUsage = data.threadUsage;
    this._state.globalFrequency = data.globalFrequency;
    this._state.threadFrequency = data.threadFrequency;
    this._state.maxFrequency = data.maxFrequency;
  }
}

export const cpuState = new CpuState();
```

#### `src/lib/states/monitor/MemoryState.ts`
```typescript
class MemoryState {
  private _state = $state({
    ramCapacity: 0,
    ramUsage: 0,
    swapCapacity: 0,
    swapUsage: 0
  });

  get ramCapacity() { return this._state.ramCapacity; }
  get ramUsage() { return this._state.ramUsage; }
  get swapCapacity() { return this._state.swapCapacity; }
  get swapUsage() { return this._state.swapUsage; }

  get ramUsagePercent() {
    return this._state.ramCapacity > 0
      ? (this._state.ramUsage / this._state.ramCapacity) * 100
      : 0;
  }

  update(data: RealtimeMemoryData) {
    this._state.ramCapacity = data.ramCapacity;
    this._state.ramUsage = data.ramUsage;
    this._state.swapCapacity = data.swapCapacity;
    this._state.swapUsage = data.swapUsage;
  }
}

export const memState = new MemoryState();
```

#### `src/lib/states/monitor/NetworkState.ts`
```typescript
class NetworkState {
  private _state = $state({
    send: 0,
    receive: 0,
    time: new Date()
  });

  get send() { return this._state.send; }
  get receive() { return this._state.receive; }
  get time() { return this._state.time; }

  update(data: { bytesSent: number; bytesReceived: number; timestampSecs: number }) {
    this._state.send = data.bytesSent / 1000;
    this._state.receive = data.bytesReceived / 1000;
    this._state.time = new Date(data.timestampSecs * 1000);
  }
}

export const networkState = new NetworkState();
```

#### `src/lib/states/monitor/ProcessState.ts`
```typescript
class ProcessState {
  private _state = $state<Process[]>([]);

  get processes() { return this._state; }
  get count() { return this._state.length; }

  update(processes: Process[]) {
    this._state = processes;
  }
}

export const processState = new ProcessState();
```

---

## 3. Architecture des Services

### Pattern : Services par domaine + service Tauri générique

#### `src/lib/services/tauri.ts`
Service générique pour tous les appels Tauri.

```typescript
import { invoke } from '@tauri-apps/api/core';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';

export async function tauriInvoke<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  try {
    return await invoke<T>(command, args);
  } catch (error) {
    console.error(`Tauri invoke failed: ${command}`, error);
    throw error;
  }
}

export async function tauriListen<T>(event: string, callback: (event: T) => void): Promise<UnlistenFn> {
  return await listen<T>(event, callback);
}
```

#### `src/lib/services/theme/theme.service.ts`
Service thème avec détection système et persistance.

```typescript
import { themeState } from '$lib/states/ThemeState';
import { tauriInvoke } from '$lib/services/tauri';

class ThemeService {
  private mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  async init() {
    const saved = await tauriInvoke<string>('get_setting', { key: 'theme' });
    if (saved === 'light' || saved === 'dark') {
      themeState.setTheme(saved);
    } else {
      themeState.setTheme(this.mediaQuery.matches ? 'dark' : 'light');
    }

    this.mediaQuery.addEventListener('change', (e) => {
      themeState.setTheme(e.matches ? 'dark' : 'light');
    });
  }

  async toggle() {
    themeState.toggleTheme();
    await tauriInvoke('set_setting', { key: 'theme', value: themeState.theme });
  }
}

export const themeService = new ThemeService();
```

#### `src/lib/services/monitor/monitor.service.ts`
Service orchestrateur du monitoring.

```typescript
import { appState } from '$lib/states/AppState';
import { cpuState } from '$lib/states/monitor/CpuState';
import { memState } from '$lib/states/monitor/MemoryState';
import { networkState } from '$lib/states/monitor/NetworkState';
import { processState } from '$lib/states/monitor/ProcessState';
import { tauriInvoke, tauriListen } from '$lib/services/tauri';

class MonitorService {
  private unlisten: UnlistenFn | null = null;
  private monitoring = false;

  async start() {
    if (this.monitoring) return;
    this.monitoring = true;
    appState.setActive(true);

    this.unlisten = await tauriListen('state-bridge', (event) => {
      this.handleStateUpdate(event.payload);
    });

    await tauriInvoke('start_monitoring');
  }

  async stop() {
    if (!this.monitoring) return;
    this.monitoring = false;
    appState.setActive(false);

    if (this.unlisten) {
      this.unlisten();
      this.unlisten = null;
    }

    await tauriInvoke('stop_monitoring');
  }

  private handleStateUpdate(payload: any) {
    switch (payload.stateName) {
      case 'cpu':
        cpuState.update(payload.data);
        break;
      case 'memory':
        memState.update(payload.data);
        break;
      case 'network':
        networkState.update(payload.data);
        break;
      case 'processes':
        processState.update(payload.data);
        break;
    }
  }
}

export const monitorService = new MonitorService();
```

#### `src/lib/services/monitor/cpu.service.ts`
Service CPU avec formatage et calculs.

```typescript
import { cpuState } from '$lib/states/monitor/CpuState';
import { tauriInvoke } from '$lib/services/tauri';

class CpuService {
  async getRealtimeData() {
    const data = await tauriInvoke<RealtimeCpuData>('realtime_cpu_infos');
    cpuState.update(data);
  }

  formatFrequency(mhz: number): string {
    if (mhz >= 1000) return `${(mhz / 1000).toFixed(1)} GHz`;
    return `${mhz} MHz`;
  }

  getUsageColor(usage: number): string {
    if (usage >= 90) return 'text-error';
    if (usage >= 70) return 'text-warning';
    return 'text-success';
  }
}

export const cpuService = new CpuService();
```

#### `src/lib/services/monitor/memory.service.ts`
Service mémoire avec calculs.

```typescript
import { memState } from '$lib/states/monitor/MemoryState';
import { tauriInvoke } from '$lib/services/tauri';

class MemoryService {
  async getRealtimeData() {
    const data = await tauriInvoke<RealtimeMemoryData>('realtime_memory_infos');
    memState.update(data);
  }

  formatBytes(bytes: number): string {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let value = bytes;
    let i = 0;
    while (value >= 1024 && i < units.length - 1) {
      value /= 1024;
      i++;
    }
    return `${value.toFixed(i > 0 && value < 10 ? 1 : 0)} ${units[i]}`;
  }
}

export const memoryService = new MemoryService();
```

#### `src/lib/services/monitor/network.service.ts`
Service réseau avec formatage.

```typescript
import { networkState } from '$lib/states/monitor/NetworkState';
import { tauriInvoke } from '$lib/services/tauri';

class NetworkService {
  async getRealtimeData() {
    const data = await tauriInvoke<NetworkStats>('realtime_network_stats');
    networkState.update(data);
  }

  formatSpeed(kbps: number): string {
    if (kbps >= 1000) return `${(kbps / 1000).toFixed(1)} MB/s`;
    return `${kbps} KB/s`;
  }
}

export const networkService = new NetworkService();
```

#### `src/lib/services/monitor/disk.service.ts`
Service disque.

```typescript
import { tauriInvoke } from '$lib/services/tauri';

class DiskService {
  async getDisksInfos() {
    return await tauriInvoke<DiskInfo[]>('get_disks_infos');
  }
}

export const diskService = new DiskService();
```

#### `src/lib/services/monitor/process.service.ts`
Service processus.

```typescript
import { processState } from '$lib/states/monitor/ProcessState';
import { tauriInvoke } from '$lib/services/tauri';

class ProcessService {
  async getRealtimeData() {
    const data = await tauriInvoke<Process[]>('realtime_process_infos');
    processState.update(data);
  }
}

export const processService = new ProcessService();
```

#### `src/lib/services/project/project.service.ts`
Service projets.

```typescript
import { tauriInvoke } from '$lib/services/tauri';

class ProjectService {
  async openProject(path: string) {
    return await tauriInvoke('open_project', { path });
  }

  async openInEditor(path: string) {
    return await tauriInvoke('open_in_editor', { path });
  }

  async openInTerminal(path: string) {
    return await tauriInvoke('open_in_terminal', { path });
  }

  async deleteProject(path: string) {
    return await tauriInvoke('delete_project', { path });
  }
}

export const projectService = new ProjectService();
```

---

## 4. Structure des dossiers

```
src/
├── app.css
├── app.html
├── lib/
│   ├── components/
│   │   ├── animations/
│   │   │   └── fly.ts
│   │   ├── overlay/
│   │   │   ├── actions/
│   │   │   │   ├── DeleteProjectAction.svelte
│   │   │   │   ├── OpenInEditorAction.svelte
│   │   │   │   ├── OpenInTerminalAction.svelte
│   │   │   │   ├── OpenProjectAction.svelte
│   │   │   │   └── ProjectActions.svelte
│   │   │   ├── chart/
│   │   │   │   ├── DisksArc.svelte
│   │   │   │   ├── MainCpuMonitor.svelte
│   │   │   │   ├── MemoryChart.svelte
│   │   │   │   ├── NetworkChart.svelte
│   │   │   │   ├── ProcessTable.svelte
│   │   │   │   └── ServiceTable.svelte
│   │   │   ├── ButtomBar.svelte
│   │   │   ├── LeftBar.svelte
│   │   │   ├── Pagination.svelte
│   │   │   ├── ProjectCard.svelte
│   │   │   ├── ProjectStats.svelte
│   │   │   ├── ProjectSystem.svelte
│   │   │   ├── RightBar.svelte
│   │   │   ├── RunningProjectsCards.svelte
│   │   │   └── TopBar.svelte
│   │   └── reusable/
│   │       ├── Container.svelte
│   │       └── Page.svelte
│   ├── dtos/
│   │   ├── device.ts
│   │   ├── project.ts
│   │   └── index.ts
│   ├── services/
│   │   ├── tauri.ts
│   │   ├── theme/
│   │   │   └── theme.service.ts
│   │   ├── monitor/
│   │   │   ├── monitor.service.ts
│   │   │   ├── cpu.service.ts
│   │   │   ├── memory.service.ts
│   │   │   ├── network.service.ts
│   │   │   ├── disk.service.ts
│   │   │   └── process.service.ts
│   │   └── project/
│   │       └── project.service.ts
│   ├── states/
│   │   ├── AppState.ts
│   │   ├── ThemeState.ts
│   │   ├── RoutesState.ts
│   │   └── monitor/
│   │       ├── CpuState.ts
│   │       ├── MemoryState.ts
│   │       ├── NetworkState.ts
│   │       ├── DiskState.ts
│   │       └── ProcessState.ts
│   └── utils/
│       └── cn.ts
└── routes/
    ├── +layout.svelte
    ├── +layout.ts
    ├── +page.svelte
    └── overlay/
        ├── +layout.svelte
        ├── +page.svelte
        ├── monitor/+page.svelte
        ├── projects/
        │   ├── +page.svelte
        │   └── [slug]/+page.svelte
        └── settings/+page.svelte
```

---

## 5. Fichiers supprimés

| Fichier | Raison |
|---------|--------|
| `src/lib/services/monitor/cpu.ts` | Vide |
| `src/lib/utils/listen.ts` | Vide |
| `src/lib/dtos/data.ts` | Mocks mélangés aux types |
| `src/lib/components/overlay/chart/ProcessRow.svelte` | Non utilisé |
| `src/lib/components/overlay/chart/Tread.svelte` | Non utilisé |
| `src/lib/components/animations/fly.ts` | Non utilisé |

---

## 6. Fichiers renommés

| Avant | Après |
|-------|-------|
| `src/lib/states/appState.ts` | `src/lib/states/AppState.ts` |
| `src/lib/states/device.ts` | `src/lib/states/monitor/CpuState.ts` + `MemoryState.ts` + `NetworkState.ts` + `ProcessState.ts` |
| `src/lib/states/routes.ts` | `src/lib/states/RoutesState.ts` |
| `src/lib/services/bridge.ts` | `src/lib/services/monitor/monitor.service.ts` |

---

## 7. Migration des composants

### Principes
- Les composants ne font qu'appeler les services et lire les stores
- Pas de `invoke()` direct dans les composants
- Pas de mutation directe des stores
- Utilisation des getters réactifs

### Exemple : `overlay/+layout.svelte`

**Avant** :
```svelte
<script>
  import { initTauriBridge } from "$lib/services/bridge";
  import { startMonitoring, stopMonitoring } from "$lib/states/appState";
  
  onMount(() => {
    $appState.overlayVisible = true;
    startMonitoring();
    initTauriBridge();
  });
</script>
```

**Après** :
```svelte
<script>
  import { monitorService } from "$lib/services/monitor/monitor.service";
  import { themeService } from "$lib/services/theme/theme.service";
  import { appState } from "$lib/states/AppState";
  
  onMount(() => {
    appState.showOverlay();
    monitorService.start();
    themeService.init();
  });
  
  onDestroy(() => {
    monitorService.stop();
    appState.hideOverlay();
  });
</script>
```

### Exemple : `monitor/+page.svelte`

**Avant** :
```svelte
<script>
  import { initTauriBridge } from "$lib/services/bridge";
  
  onMount(() => {
    initTauriBridge();
    $appState.active = true;
  });
</script>
```

**Après** :
```svelte
<script>
  import { monitorService } from "$lib/services/monitor/monitor.service";
  
  onMount(() => {
    monitorService.start();
  });
  
  onDestroy(() => {
    monitorService.stop();
  });
</script>
```

---

## 8. Gestion du thème dans l'UI

### Toggle thème dans TopBar

```svelte
<!-- src/lib/components/overlay/TopBar.svelte -->
<script>
  import { themeState } from "$lib/states/ThemeState";
  import { themeService } from "$lib/services/theme/theme.service";
  import { Sun, Moon } from "@lucide/svelte";
</script>

<button
  onclick={() => themeService.toggle()}
  class="btn btn-ghost btn-sm"
  aria-label={themeState.isDark ? 'Switch to light mode' : 'Switch to dark mode'}
>
  {#if themeState.isDark}
    <Sun size={16} />
  {:else}
    <Moon size={16} />
  {/if}
</button>
```

### Application du thème dans `app.css`

```css
:root[data-theme="light"] {
  /* Thème clair */
}

:root[data-theme="dark"] {
  /* Thème sombre */
}
```

---

## 9. Tests

### Tests unitaires des stores
- Tester les actions de chaque store
- Vérifier que l'état est correctement mis à jour

### Tests unitaires des services
- Tester les appels Tauri (mock)
- Vérifier la gestion d'erreurs

### Tests d'intégration
- Tester le cycle de vie du monitoring
- Tester la bascule de thème

---

## 10. Critères de succès

- [ ] Tous les stores sont des classes avec runes Svelte 5
- [ ] Tous les services sont dans `src/lib/services/` par domaine
- [ ] Aucun `invoke()` direct dans les composants
- [ ] Aucune mutation directe des stores dans les composants
- [ ] Le thème peut être basculé via un toggle dans l'UI
- [ ] Le thème est persisté et restauré au démarrage
- [ ] Le thème suit le système par défaut
- [ ] Tous les fichiers vides et composants inutilisés sont supprimés
- [ ] TypeScript compile sans erreur
- [ ] L'application fonctionne correctement après la refonte
