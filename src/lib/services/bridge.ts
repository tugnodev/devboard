import { listen } from '@tauri-apps/api/event';
import { appState, type AppState } from '../states/appState';
import { cpuState, memState, networkStats, processState } from '$lib/states/device';
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
        appState.set(data);
        break;
      }
      case StateName.cpu: {
        const data = payload.data as RealtimeCpuData;
        cpuState.set(data);
        break;
      }
      case StateName.memory: {
        const data = payload.data as RealtimeMemoryData;
        memState.set(data);
        break;
      }
      case StateName.process: {
        const data = payload.data as Process[];
        processState.set(data);
        console.log(`taille des processus ${data.length}`)
        break
      }
      case StateName.network: {
        const data = payload.data as NetworkStats;
        networkStats.subscribe((stats) => {
          stats.send = data.bytesSent / Math.pow(1000, 1);
          stats.receive = data.bytesReceived / Math.pow(1000, 1);
          stats.time = new Date(data.timestamp.secs_since_epoch * 1000);
        });
      }
    }
  });
}

//export async function initTauriBridge2() {
//  // Sécurité indispensable pour SvelteKit : on n'exécute que dans le navigateur
//  if (typeof window === 'undefined') return;
//  console.log('initTauriBridge2');
//
//  return await listen<EmitResponse<StateName>>('state-bridge2', (event) => {
//    const payload = event.payload;
//    console.log(payload);
//    switch (payload.stateName) {
//
//    }
//  });
//}
