import type { UnlistenFn } from '@tauri-apps/api/event';
import { appState, type AppStateData } from '$lib/states/AppState';
import { cpuState } from '$lib/states/monitor/CpuState';
import { memState } from '$lib/states/monitor/MemoryState';
import { networkState } from '$lib/states/monitor/NetworkState';
import { processState } from '$lib/states/monitor/ProcessState';
import { tauriInvoke, tauriListen } from '$lib/services/tauri';
import type { RealtimeCpuData, RealtimeMemoryData, NetworkStats, Process } from '$lib/dtos/device';

type OverlayPayload = {
  stateName: 'overlay';
  data: Pick<AppStateData, 'overlayVisible'>;
};

type CpuPayload = {
  stateName: 'cpu';
  data: RealtimeCpuData;
};

type MemoryPayload = {
  stateName: 'memory';
  data: RealtimeMemoryData;
};

type NetworkPayload = {
  stateName: 'network';
  data: NetworkStats;
};

type ProcessesPayload = {
  stateName: 'processes';
  data: Process[];
};

type StateBridgePayload = OverlayPayload | CpuPayload | MemoryPayload | NetworkPayload | ProcessesPayload;

class MonitorService {
  private unlisten: UnlistenFn | null = null;
  private monitoring = false;

  async start() {
    if (this.monitoring) return;
    this.monitoring = true;
    appState.setActive(true);

    this.unlisten = await tauriListen<StateBridgePayload>('state-bridge', (payload) => {
      this.handleStateUpdate(payload);
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

  private handleStateUpdate(payload: StateBridgePayload) {
    switch (payload.stateName) {
      case 'overlay':
        appState.updateFromRust(payload.data);
        break;
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
      default:
        console.warn('Unknown state-bridge payload:', payload);
    }
  }
}

export const monitorService = new MonitorService();
