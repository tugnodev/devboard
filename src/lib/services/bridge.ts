import { listen } from '@tauri-apps/api/event';
import { appState, type AppStateData as AppState } from '../states/AppState';
import { cpuState } from '$lib/states/monitor/CpuState';
import { memState } from '$lib/states/monitor/MemoryState';
import { networkState } from '$lib/states/monitor/NetworkState';
import { processState } from '$lib/states/monitor/ProcessState';
import type { RealtimeCpuData, RealtimeMemoryData, NetworkStats, Process } from '$lib/dtos/device';

export enum StateName {
  overlay = 'overlay',
  cpu = 'cpu',
  memory = 'memory',
  network = 'network',
  process = "processes"
}

export type StatePayloads = {
  [StateName.overlay]: AppState;
  [StateName.cpu]: RealtimeCpuData;
  [StateName.memory]: RealtimeMemoryData;
  [StateName.network]: NetworkStats;
  [StateName.process]: Process[];
};

// Helper pour mettre à jour l'état overlay depuis Rust
// Ne modifie PAS 'active' pour éviter la boucle avec le subscriber
function updateOverlayState(data: AppState) {
  appState.updateFromRust({ overlayVisible: data.overlayVisible });
  // On ne modifie pas 'active' ici pour éviter la boucle infinie
  // 'active' est géré uniquement par startMonitoring/stopMonitoring
}

export type EmitResponse<K extends StateName> = {
  stateName: K;
  data: StatePayloads[K];
};

export async function initTauriBridge() {
  // Sécurité indispensable pour SvelteKit : on n'exécute que dans le navigateur
  if (typeof window === 'undefined') return;

  return await listen<EmitResponse<StateName>>('state-bridge', (event) => {
    const payload = event.payload;
    switch (payload.stateName) {
      case StateName.overlay: {
        const data = payload.data as AppState;
        updateOverlayState(data);
        break;
      }
      case StateName.cpu: {
        const data = payload.data as RealtimeCpuData;
        cpuState.update(data);
        break;
      }
      case StateName.memory: {
        const data = payload.data as RealtimeMemoryData;
        memState.update(data);
        break;
      }
      case StateName.process: {
        const data = payload.data as Process[];
        processState.update(data);
        break;
      }
      case StateName.network: {
        const data = payload.data as NetworkStats;
        networkState.update(data);
        break;
      }
    }
  });
}
