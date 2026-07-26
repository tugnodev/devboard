import { writable } from 'svelte/store';
import { invoke } from '@tauri-apps/api/core';
import type { cpuInfos } from '$lib/dtos/device';
import { cpuInfosState } from './device';

export type AppState = {
  overlayVisible: boolean;

	interval: number; //milliseconds
};

export const appState = writable<AppState>({ overlayVisible: false, interval: 1000 });
appState.subscribe(async (state) => {
  switch (state.overlayVisible) {
    case true:
      invoke("realtime_cpu_infos");
      invoke("realtime_memory_infos");
      invoke("realtime_network_stats");
      invoke("realtime_process_infos");
    const data = await invoke<cpuInfos>("get_cpu_infos");
    cpuInfosState.set(data);
      break;
    case false:
      console.log('overlay hidden', state.overlayVisible);
      setTimeout(() => {
        invoke("hide_overlay");
      }, 300)
      break;
  }
});
