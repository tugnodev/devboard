import { invoke } from '@tauri-apps/api/core';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';

export async function tauriInvoke<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  try {
    return await invoke<T>(command, args);
  } catch (error) {
    console.error(`Tauri invoke failed: ${command}`, error);
    throw error;
  }
}

export async function tauriListen<T>(event: string, callback: (event: T) => void): Promise<UnlistenFn> {
  return await listen<T>(event, (e) => callback(e.payload));
}
