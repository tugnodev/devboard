import { cpuState } from '$lib/states/monitor/CpuState';
import { tauriInvoke } from '$lib/services/tauri';
import type { RealtimeCpuData } from '$lib/dtos/device';

type UsageLevel = 'error' | 'warning' | 'success';

class CpuService {
  async getRealtimeData() {
    const data = await tauriInvoke<RealtimeCpuData>('realtime_cpu_infos');
    cpuState.update(data);
  }

  formatFrequency(mhz: number): string {
    if (mhz >= 1000) return `${(mhz / 1000).toFixed(1)} GHz`;
    return `${mhz} MHz`;
  }

  getUsageColor(usage: number): UsageLevel {
    if (usage >= 90) return 'error';
    if (usage >= 70) return 'warning';
    return 'success';
  }
}

export const cpuService = new CpuService();
