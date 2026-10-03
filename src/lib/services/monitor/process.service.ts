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
