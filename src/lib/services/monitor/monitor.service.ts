import type { UnlistenFn } from '@tauri-apps/api/event';
import { appState } from '$lib/states/AppState';
import { cpuState } from '$lib/states/monitor/CpuState';
import { memState } from '$lib/states/monitor/MemoryState';
import { networkState } from '$lib/states/monitor/NetworkState';
import { processState } from '$lib/states/monitor/ProcessState';
import { tauriInvoke, tauriListen } from '$lib/services/tauri';

type StateName = 'cpu' | 'memory' | 'network' | 'processes';

interface StateBridgePayload {
  stateName: StateName;
  data: unknown;
}

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
      case 'cpu':
        cpuState.update(payload.data as Parameters<typeof cpuState.update>[0]);
        break;
      case 'memory':
        memState.update(payload.data as Parameters<typeof memState.update>[0]);
        break;
      case 'network':
        networkState.update(payload.data as Parameters<typeof networkState.update>[0]);
        break;
      case 'processes':
        processState.update(payload.data as Parameters<typeof processState.update>[0]);
        break;
    }
  }
}

export const monitorService = new MonitorService();
