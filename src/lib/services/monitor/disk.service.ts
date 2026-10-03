import { tauriInvoke } from '$lib/services/tauri';
import type { Disk } from '$lib/dtos/device';

class DiskService {
  async getDisksInfos() {
    return await tauriInvoke<Disk[]>('get_disks_infos');
  }
}

export const diskService = new DiskService();
