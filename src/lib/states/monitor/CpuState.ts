import type { RealtimeCpuData } from '$lib/dtos/device';

class CpuState {
  private _state = $state({
    globalUsage: 0,
    threadUsage: [] as number[],
    globalFrequency: 0,
    threadFrequency: [] as number[],
    maxFrequency: 0
  });

  get globalUsage() { return this._state.globalUsage; }
  get threadUsage() { return this._state.threadUsage; }
  get globalFrequency() { return this._state.globalFrequency; }
  get threadFrequency() { return this._state.threadFrequency; }
  get maxFrequency() { return this._state.maxFrequency; }

  update(data: RealtimeCpuData) {
    this._state.globalUsage = data.globalUsage;
    this._state.threadUsage = data.threadUsage;
    this._state.globalFrequency = data.globalFrequency;
    this._state.threadFrequency = data.threadFrequency;
    this._state.maxFrequency = data.maxFrequency;
  }
}

export const cpuState = new CpuState();
