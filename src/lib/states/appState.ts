import { writable } from 'svelte/store';
import { invoke } from '@tauri-apps/api/core';
import type { cpuInfos } from '$lib/dtos/device';
import { cpuInfosState } from './device';

export type AppState = {
  overlayVisible: boolean;
  active: boolean;
  interval: number;
};

export const appState = writable<AppState>({ overlayVisible: false, active: false, interval: 1000 });

let monitoringStarted = false;

export async function startMonitoring() {
  if (monitoringStarted) return;
  monitoringStarted = true;
  invoke("realtime_cpu_infos");
  invoke("realtime_memory_infos");
  invoke("realtime_network_stats");
  invoke("realtime_process_infos");
  const data = await invoke<cpuInfos>("get_cpu_infos");
  cpuInfosState.set(data);
}

export async function stopMonitoring() {
  if (!monitoringStarted) return;
  monitoringStarted = false;
  await invoke("stop_monitoring");
}

appState.subscribe(async (state) => {
  if (state.overlayVisible && !monitoringStarted) {
    await startMonitoring();
  } else if (!state.overlayVisible && monitoringStarted) {
    await stopMonitoring();
  }
});
