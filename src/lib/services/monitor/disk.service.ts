import { tauriInvoke } from '$lib/services/tauri';
import type { DiskInfo } from '$lib/dtos/device';

class DiskService {
  async getDisksInfos() {
    return await tauriInvoke<DiskInfo[]>('get_disks_infos');
  }
}

export const diskService = new DiskService();
