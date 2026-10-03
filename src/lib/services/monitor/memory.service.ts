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
