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
