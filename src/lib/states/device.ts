import { writable } from 'svelte/store';
import type { RealtimeCpuData, RealtimeMemoryData, cpuInfos, NetworkStats, Process } from '$lib/dtos/device';

export const cpuState = writable<RealtimeCpuData>({
  globalFrequency: 0,
  globalUsage: 0,
  threadFrequency: [0],
  threadUsage: [0]
});
export const cpuInfosState = writable<cpuInfos>({
  brand: '',
  model: '',
  cores: 0,
  threads: 0,
  frequency: 0,
  maxFrequency: 0,
  virt: false,
  arch: ''
});

export const memState = writable<RealtimeMemoryData>({
  ramCapacity: 0,
  ramUsage: 0,
  swapCapacity: 0,
  swapUsage: 0
})

export const networkStats = writable<{
  send: number;
  receive: number;
  time: Date;
}>({
  send: 0,
  receive: 0,
  time: new Date()
})

export const processState = writable<Process[]>([]);
