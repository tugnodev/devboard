# Frontend Architecture Refactor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refonte complète de l'architecture frontend pour faciliter le changement de thème et séparer la logique métier des composants.

**Architecture:** Stores Svelte 5 runes (classes TypeScript) + services par domaine + service Tauri générique + service thème avec détection système et persistance.

**Tech Stack:** SvelteKit, Svelte 5, TypeScript, Tailwind CSS v4, daisyUI 5, Tauri v2

**Spec:** `docs/superpowers/specs/2026-10-02-frontend-architecture-refactor.md`

## Global Constraints

- Svelte 5 runes uniquement (pas de `writable()` classique)
- TypeScript strict
- Pas de `invoke()` direct dans les composants
- Pas de mutation directe des stores dans les composants
- Structure par domaine obligatoire
- Tous les stores sont des classes avec `$state`
- Tous les services sont des classes avec méthodes

## Review Focus

1. **Double initialisation du bridge** — S'assurer que `monitorService.start()` n'est appelé qu'une seule fois
2. **Fuite mémoire** — S'assurer que les listeners Tauri sont correctement nettoyés
3. **Type safety** — Vérifier que tous les types sont correctement importés et utilisés
4. **Thème persistant** — Vérifier que le thème est sauvegardé et restauré correctement
5. **Migration complète** — Vérifier qu'aucun composant n'utilise l'ancienne API

---

## Task 1: Créer le service Tauri générique

**Files:**
- Create: `src/lib/services/tauri.ts`

**Interfaces:**
- Consumes: Rien (point d'entrée)
- Produces: `tauriInvoke<T>(command: string, args?: Record<string, unknown>): Promise<T>`, `tauriListen<T>(event: string, callback: (event: T) => void): Promise<UnlistenFn>`

- [ ] **Step 1: Créer le fichier `src/lib/services/tauri.ts`**

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

- [ ] **Step 2: Vérifier que TypeScript compile**

Run: `bun run check`
Expected: 0 erreur

- [ ] **Step 3: Commit**

```bash
git add src/lib/services/tauri.ts
git commit -m "feat: add generic Tauri service"
```

---

## Task 2: Créer les stores de base (AppState, ThemeState, RoutesState)

**Files:**
- Create: `src/lib/states/AppState.ts`
- Create: `src/lib/states/ThemeState.ts`
- Create: `src/lib/states/RoutesState.ts`
- Delete: `src/lib/states/appState.ts`
- Delete: `src/lib/states/routes.ts`

**Interfaces:**
- Consumes: Rien
- Produces: `appState`, `themeState`, `routesState` (instances de classes)

- [ ] **Step 1: Créer `src/lib/states/AppState.ts`**

```typescript
import { writable } from 'svelte/store';

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

- [ ] **Step 2: Créer `src/lib/states/ThemeState.ts`**

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

- [ ] **Step 3: Créer `src/lib/states/RoutesState.ts`**

```typescript
import { House, Folder, Settings2Icon, MonitorDot } from "@lucide/svelte";

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

- [ ] **Step 4: Supprimer les anciens fichiers**

```bash
rm src/lib/states/appState.ts
rm src/lib/states/routes.ts
```

- [ ] **Step 5: Vérifier que TypeScript compile**

Run: `bun run check`
Expected: 0 erreur

- [ ] **Step 6: Commit**

```bash
git add src/lib/states/
git commit -m "feat: create base stores with Svelte 5 runes"
```

---

## Task 3: Créer les stores monitor (CpuState, MemoryState, NetworkState, ProcessState)

**Files:**
- Create: `src/lib/states/monitor/CpuState.ts`
- Create: `src/lib/states/monitor/MemoryState.ts`
- Create: `src/lib/states/monitor/NetworkState.ts`
- Create: `src/lib/states/monitor/ProcessState.ts`
- Delete: `src/lib/states/device.ts`

**Interfaces:**
- Consumes: Types from `$lib/dtos/device`
- Produces: `cpuState`, `memState`, `networkState`, `processState`

- [ ] **Step 1: Créer `src/lib/states/monitor/CpuState.ts`**

```typescript
import type { RealtimeCpuData } from '$lib/dtos/device';

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

- [ ] **Step 2: Créer `src/lib/states/monitor/MemoryState.ts`**

```typescript
import type { RealtimeMemoryData } from '$lib/dtos/device';

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

- [ ] **Step 3: Créer `src/lib/states/monitor/NetworkState.ts`**

```typescript
import type { NetworkStats } from '$lib/dtos/device';

class NetworkState {
  private _state = $state({
    send: 0,
    receive: 0,
    time: new Date()
  });

  get send() { return this._state.send; }
  get receive() { return this._state.receive; }
  get time() { return this._state.time; }

  update(data: NetworkStats) {
    this._state.send = data.bytesSent / 1000;
    this._state.receive = data.bytesReceived / 1000;
    this._state.time = new Date(data.timestampSecs * 1000);
  }
}

export const networkState = new NetworkState();
```

- [ ] **Step 4: Créer `src/lib/states/monitor/ProcessState.ts`**

```typescript
import type { Process } from '$lib/dtos/device';

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

- [ ] **Step 5: Supprimer l'ancien fichier**

```bash
rm src/lib/states/device.ts
```

- [ ] **Step 6: Vérifier que TypeScript compile**

Run: `bun run check`
Expected: 0 erreur

- [ ] **Step 7: Commit**

```bash
git add src/lib/states/
git commit -m "feat: create monitor stores with Svelte 5 runes"
```

---

## Task 4: Créer le service thème

**Files:**
- Create: `src/lib/services/theme/theme.service.ts`

**Interfaces:**
- Consumes: `themeState` from `$lib/states/ThemeState`, `tauriInvoke` from `$lib/services/tauri`
- Produces: `themeService` (instance de ThemeService)

- [ ] **Step 1: Créer `src/lib/services/theme/theme.service.ts`**

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

- [ ] **Step 2: Vérifier que TypeScript compile**

Run: `bun run check`
Expected: 0 erreur

- [ ] **Step 3: Commit**

```bash
git add src/lib/services/theme/theme.service.ts
git commit -m "feat: add theme service"
```

---

## Task 5: Créer les services monitor

**Files:**
- Create: `src/lib/services/monitor/monitor.service.ts`
- Create: `src/lib/services/monitor/cpu.service.ts`
- Create: `src/lib/services/monitor/memory.service.ts`
- Create: `src/lib/services/monitor/network.service.ts`
- Create: `src/lib/services/monitor/disk.service.ts`
- Create: `src/lib/services/monitor/process.service.ts`
- Delete: `src/lib/services/bridge.ts`
- Delete: `src/lib/services/monitor/cpu.ts`

**Interfaces:**
- Consumes: Stores from `$lib/states/`, `tauriInvoke`/`tauriListen` from `$lib/services/tauri`
- Produces: `monitorService`, `cpuService`, `memoryService`, `networkService`, `diskService`, `processService`

- [ ] **Step 1: Créer `src/lib/services/monitor/monitor.service.ts`**

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

- [ ] **Step 2: Créer `src/lib/services/monitor/cpu.service.ts`**

```typescript
import { cpuState } from '$lib/states/monitor/CpuState';
import { tauriInvoke } from '$lib/services/tauri';
import type { RealtimeCpuData } from '$lib/dtos/device';

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

- [ ] **Step 3: Créer `src/lib/services/monitor/memory.service.ts`**

```typescript
import { memState } from '$lib/states/monitor/MemoryState';
import { tauriInvoke } from '$lib/services/tauri';
import type { RealtimeMemoryData } from '$lib/dtos/device';

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

- [ ] **Step 4: Créer `src/lib/services/monitor/network.service.ts`**

```typescript
import { networkState } from '$lib/states/monitor/NetworkState';
import { tauriInvoke } from '$lib/services/tauri';
import type { NetworkStats } from '$lib/dtos/device';

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

- [ ] **Step 5: Créer `src/lib/services/monitor/disk.service.ts`**

```typescript
import { tauriInvoke } from '$lib/services/tauri';
import type { DiskInfo } from '$lib/dtos/device';

class DiskService {
  async getDisksInfos() {
    return await tauriInvoke<DiskInfo[]>('get_disks_infos');
  }
}

export const diskService = new DiskService();
```

- [ ] **Step 6: Créer `src/lib/services/monitor/process.service.ts`**

```typescript
import { processState } from '$lib/states/monitor/ProcessState';
import { tauriInvoke } from '$lib/services/tauri';
import type { Process } from '$lib/dtos/device';

class ProcessService {
  async getRealtimeData() {
    const data = await tauriInvoke<Process[]>('realtime_process_infos');
    processState.update(data);
  }
}

export const processService = new ProcessService();
```

- [ ] **Step 7: Supprimer les anciens fichiers**

```bash
rm src/lib/services/bridge.ts
rm src/lib/services/monitor/cpu.ts
```

- [ ] **Step 8: Vérifier que TypeScript compile**

Run: `bun run check`
Expected: 0 erreur

- [ ] **Step 9: Commit**

```bash
git add src/lib/services/
git commit -m "feat: add monitor services"
```

---

## Task 6: Créer le service projet

**Files:**
- Create: `src/lib/services/project/project.service.ts`

**Interfaces:**
- Consumes: `tauriInvoke` from `$lib/services/tauri`
- Produces: `projectService` (instance de ProjectService)

- [ ] **Step 1: Créer `src/lib/services/project/project.service.ts`**

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

- [ ] **Step 2: Vérifier que TypeScript compile**

Run: `bun run check`
Expected: 0 erreur

- [ ] **Step 3: Commit**

```bash
git add src/lib/services/project/project.service.ts
git commit -m "feat: add project service"
```

---

## Task 7: Mettre à jour les composants pour utiliser les nouveaux stores/services

**Files:**
- Modify: `src/routes/overlay/+layout.svelte`
- Modify: `src/routes/overlay/monitor/+page.svelte`
- Modify: `src/lib/components/overlay/TopBar.svelte`
- Modify: `src/lib/components/overlay/chart/MainCpuMonitor.svelte`
- Modify: `src/lib/components/overlay/chart/MemoryChart.svelte`
- Modify: `src/lib/components/overlay/chart/NetworkChart.svelte`
- Modify: `src/lib/components/overlay/chart/ProcessTable.svelte`
- Modify: `src/lib/components/overlay/actions/OpenProjectAction.svelte`
- Modify: `src/lib/components/overlay/actions/OpenInEditorAction.svelte`
- Modify: `src/lib/components/overlay/actions/OpenInTerminalAction.svelte`
- Modify: `src/lib/components/overlay/actions/DeleteProjectAction.svelte`

**Interfaces:**
- Consumes: Tous les stores et services créés dans les tâches précédentes
- Produces: Composants mis à jour

- [ ] **Step 1: Mettre à jour `src/routes/overlay/+layout.svelte`**

```svelte
<script lang="ts">
    import { fly } from "svelte/transition";
    import { backIn, backOut } from "svelte/easing";
    import { appState } from "$lib/states/AppState";
    import { monitorService } from "$lib/services/monitor/monitor.service";
    import { themeService } from "$lib/services/theme/theme.service";
    import TopBar from "$lib/components/overlay/TopBar.svelte";
    import { onMount, onDestroy } from "svelte";
    let { children } = $props();

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

<div
    role="button"
    tabindex="0"
    aria-label="overlay"
    onkeydown={(e) => {
        if (e.key === "Escape") {
            appState.hideOverlay();
        }
    }}
    class="w-full h-screen max-h-screen">
    {#if appState.overlayVisible}
    <section class="flex flex-col h-full gap-2 p-2 w-full overflow-hidden">
        <header
            in:fly={{ y: -100, duration: 300, easing: backIn, delay: 50 }}
            out:fly={{ y: -100, duration: 300, delay: 0, easing: backOut }}
            class="w-full flex items-center justify-center">
                <TopBar />
        </header>
        <section
            in:fly={{ duration: 300, y: 1000, easing: backIn, delay: 50 }}
            out:fly={{ y: 1000, duration: 300, easing: backOut }}
            class="flex h-full w-full">
            {@render children()}
        </section>
    </section>
    {:else}
    <div class="w-full h-screen">
    </div>
    {/if}
</div>
```

- [ ] **Step 2: Mettre à jour `src/routes/overlay/monitor/+page.svelte`**

```svelte
<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { monitorService } from "$lib/services/monitor/monitor.service";
    import Page from "$lib/components/reusable/Page.svelte";
    import Container from "$lib/components/reusable/Container.svelte";
    import MainCpuMonitor from "$lib/components/overlay/chart/MainCpuMonitor.svelte";
    import MemoryChart from "$lib/components/overlay/chart/MemoryChart.svelte";
    import NetworkChart from "$lib/components/overlay/chart/NetworkChart.svelte";
    import DisksArc from "$lib/components/overlay/chart/DisksArc.svelte";
    import Pagination from "$lib/components/overlay/Pagination.svelte";

    onMount(() => {
      monitorService.start();
    });

    onDestroy(() => {
      monitorService.stop();
    });
</script>
<Page>
    <main class="h-full max-h-screen overflow-auto flex flex-col gap-2">
        <div class="grid grid-cols-4 gap-2 w-full">
            <Container class="">
                <MainCpuMonitor />
            </Container>
            <Container>
                <MemoryChart />
            </Container>
            <Container class="">
                <NetworkChart />
            </Container>
            <Container class="">
                <DisksArc />
            </Container>
        </div>
        <div class="grid grid-cols-1 h-full grid-rows-1 overflow-hidden rounded flex-1">
            <Container class="w-full h-full overflow-hidden p-4">
                <Pagination />
            </Container>
        </div>
    </main>
</Page>
```

- [ ] **Step 3: Mettre à jour `src/lib/components/overlay/TopBar.svelte`**

```svelte
<script lang="ts">
    import Container from "$lib/components/reusable/Container.svelte";
    import { goto } from "$app/navigation";
    import { routesState } from "$lib/states/RoutesState";
    import { page } from "$app/state";
    import { themeState } from "$lib/states/ThemeState";
    import { themeService } from "$lib/services/theme/theme.service";
    import { Sun, Moon } from "@lucide/svelte";

    let current = $state(page.url.pathname);
    $effect(() => {
        current = page.url.pathname;
    });
</script>

<Container
    class="h-16 flex items-center justify-center bg-base-200 rounded">
    <ul class="flex w-full h-full gap-0.5">
        {#each routesState.routes as route}
            <button
                onclick={() => goto(`${route.path}`)}
                class="btn aspect-square h-full btn-ghost rounded transition-colors duration-250 border-none"
                class:btn-primary={current === route.path}
                class:bg-base-100={current === route.path}
                aria-label={route.name}
                title={route.name}
            ><route.icon />
            </button>
        {/each}
    </ul>
    <button
        onclick={() => themeService.toggle()}
        class="btn btn-ghost btn-sm ml-2"
        aria-label={themeState.isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
        {#if themeState.isDark}
            <Sun size={16} />
        {:else}
            <Moon size={16} />
        {/if}
    </button>
</Container>
```

- [ ] **Step 4: Mettre à jour `src/lib/components/overlay/chart/MainCpuMonitor.svelte`**

Remplacer tous les imports de `$lib/states/device` par `$lib/states/monitor/CpuState` et utiliser `cpuState.globalUsage` au lieu de `$cpuState.globalUsage`.

- [ ] **Step 5: Mettre à jour `src/lib/components/overlay/chart/MemoryChart.svelte`**

Remplacer tous les imports de `$lib/states/device` par `$lib/states/monitor/MemoryState` et utiliser `memState.ramCapacity` au lieu de `$memState.ramCapacity`.

- [ ] **Step 6: Mettre à jour `src/lib/components/overlay/chart/NetworkChart.svelte`**

Remplacer tous les imports de `$lib/states/device` par `$lib/states/monitor/NetworkState` et utiliser `networkState.send` au lieu de `$networkStats.send`.

- [ ] **Step 7: Mettre à jour `src/lib/components/overlay/chart/ProcessTable.svelte`**

Remplacer tous les imports de `$lib/states/device` par `$lib/states/monitor/ProcessState` et utiliser `processState.processes` au lieu de `$processState`.

- [ ] **Step 8: Mettre à jour les composants d'action**

Pour chaque composant d'action (`OpenProjectAction`, `OpenInEditorAction`, `OpenInTerminalAction`, `DeleteProjectAction`) :
- Remplacer `invoke()` par `projectService`
- Ajouter des `aria-label` et `title`

- [ ] **Step 9: Vérifier que TypeScript compile**

Run: `bun run check`
Expected: 0 erreur

- [ ] **Step 10: Commit**

```bash
git add src/
git commit -m "feat: update components to use new stores and services"
```

---

## Task 8: Nettoyer les fichiers inutilisés

**Files:**
- Delete: `src/lib/dtos/data.ts`
- Delete: `src/lib/components/overlay/chart/ProcessRow.svelte`
- Delete: `src/lib/components/overlay/chart/Tread.svelte`
- Delete: `src/lib/components/animations/fly.ts`
- Delete: `src/lib/utils/listen.ts`

**Interfaces:**
- Consumes: Rien
- Produces: Fichiers supprimés

- [ ] **Step 1: Supprimer les fichiers inutilisés**

```bash
rm src/lib/dtos/data.ts
rm src/lib/components/overlay/chart/ProcessRow.svelte
rm src/lib/components/overlay/chart/Tread.svelte
rm src/lib/components/animations/fly.ts
rm src/lib/utils/listen.ts
```

- [ ] **Step 2: Vérifier que TypeScript compile**

Run: `bun run check`
Expected: 0 erreur

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove unused files"
```

---

## Task 9: Mettre à jour app.css pour le thème

**Files:**
- Modify: `src/app.css`

**Interfaces:**
- Consumes: Rien
- Produces: CSS mis à jour avec support du thème

- [ ] **Step 1: Mettre à jour `src/app.css`**

Ajouter les variables de thème pour le support du toggle :

```css
@import "tailwindcss";
@plugin "daisyui";

:root {
    background-color: transparent;
}

:root[data-theme="light"] {
    /* Thème clair */
}

:root[data-theme="dark"] {
    /* Thème sombre */
}

@layer utilities {
    .no-scrollbar {
        scrollbar-width: none;
        -ms-overflow-style: none;
        overflow-y: scroll;
        &::-webkit-scrollbar {
            display: none;
        }
    }
    .no-select {
        user-select: none;
    }
}

@plugin "daisyui/theme" {
    name: "light";
    default: true;
    prefersdark: false;
    color-scheme: "light";
    --color-base-100: oklch(96% 0.001 286.375);
    --color-base-200: oklch(98% 0.001 106.423);
    --color-base-300: oklch(100% 0 0);
    --color-base-content: oklch(20% 0 0);
    --color-primary: oklch(83% 0.128 66.29);
    --color-primary-content: oklch(26% 0.079 36.259);
    --color-secondary: oklch(90% 0.182 98.111);
    --color-secondary-content: oklch(28% 0.066 53.813);
    --color-accent: oklch(82% 0.12 346.018);
    --color-accent-content: oklch(28% 0.109 3.907);
    --color-neutral: oklch(20% 0 0);
    --color-neutral-content: oklch(98% 0 0);
    --color-info: oklch(80% 0.105 251.813);
    --color-info-content: oklch(28% 0.091 267.935);
    --color-success: oklch(79% 0.209 151.711);
    --color-success-content: oklch(26% 0.065 152.934);
    --color-warning: oklch(85% 0.199 91.936);
    --color-warning-content: oklch(28% 0.066 53.813);
    --color-error: oklch(70% 0.191 22.216);
    --color-error-content: oklch(25% 0.092 26.042);
    --radius-selector: 0.5rem;
    --radius-field: 1rem;
    --radius-box: 1rem;
    --size-selector: 0.25rem;
    --size-field: 0.25rem;
    --border: 1px;
    --depth: 0;
    --noise: 0;
}

@plugin "daisyui/theme" {
    name: "dark";
    default: false;
    prefersdark: true;
    color-scheme: "dark";
    --color-base-100: oklch(20% 0.042 265.755);
    --color-base-200: oklch(27% 0.041 260.031);
    --color-base-300: oklch(12% 0.042 264.695);
    --color-base-content: oklch(100% 0 0);
    --color-primary: oklch(75% 0.183 55.934);
    --color-primary-content: oklch(26% 0.079 36.259);
    --color-secondary: oklch(79% 0.209 151.711);
    --color-secondary-content: oklch(26% 0.065 152.934);
    --color-accent: oklch(70% 0.01 56.259);
    --color-accent-content: oklch(14% 0.004 49.25);
    --color-neutral: oklch(44% 0.017 285.786);
    --color-neutral-content: oklch(98% 0 0);
    --color-info: oklch(78% 0.154 211.53);
    --color-info-content: oklch(30% 0.056 229.695);
    --color-success: oklch(77% 0.152 181.912);
    --color-success-content: oklch(27% 0.046 192.524);
    --color-warning: oklch(82% 0.189 84.429);
    --color-warning-content: oklch(27% 0.077 45.635);
    --color-error: oklch(80% 0.114 19.571);
    --color-error-content: oklch(25% 0.092 26.042);
    --radius-selector: 2rem;
    --radius-field: 0.5rem;
    --radius-box: 1rem;
    --size-selector: 0.25rem;
    --size-field: 0.25rem;
    --border: 1px;
    --depth: 0;
    --noise: 0;
}
```

- [ ] **Step 2: Vérifier que l'application fonctionne**

Run: `bun run tauri:dev`
Expected: L'application démarre sans erreur

- [ ] **Step 3: Commit**

```bash
git add src/app.css
git commit -m "feat: update app.css for theme support"
```

---

## Task 10: Tests finaux

**Files:**
- Modify: Tous les fichiers modifiés

**Interfaces:**
- Consumes: Tous les fichiers créés/modifiés
- Produces: Application fonctionnelle

- [ ] **Step 1: Vérifier que TypeScript compile**

Run: `bun run check`
Expected: 0 erreur

- [ ] **Step 2: Vérifier que l'application démarre**

Run: `bun run tauri:dev`
Expected: L'application démarre sans erreur

- [ ] **Step 3: Tester le toggle de thème**

Vérifier que le bouton dans TopBar permet de basculer entre light et dark.

- [ ] **Step 4: Tester le monitoring**

Vérifier que les données CPU, mémoire, réseau et processus s'affichent correctement.

- [ ] **Step 5: Tester la navigation**

Vérifier que la navigation entre les pages fonctionne correctement.

- [ ] **Step 6: Tester la persistance du thème**

Vérifier que le thème est restauré après un redémarrage.

- [ ] **Step 7: Commit final**

```bash
git add -A
git commit -m "feat: complete frontend architecture refactor"
```
