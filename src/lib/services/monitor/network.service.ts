import { networkState } from '$lib/states/monitor/NetworkState';
import { tauriInvoke } from '$lib/services/tauri';
import type { NetworkStats } from '$lib/dtos/device';

class NetworkService {
  async getRealtimeData() {
    const data = await tauriInvoke<NetworkStats>('realtime_network_stats');
    networkState.update(data);
  }

  formatSpeed(kbps: number): string {
    // Network speeds use decimal (1000) not binary (1024) — ISPs and network equipment
    // advertise speeds in powers of 10 (1 kbps = 1000 bps, 1 Mbps = 1000 kbps)
    if (kbps >= 1000) return `${(kbps / 1000).toFixed(1)} MB/s`;
    return `${kbps} KB/s`;
  }
}

export const networkService = new NetworkService();
