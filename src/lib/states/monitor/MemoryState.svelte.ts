import type { RealtimeMemoryData } from '$lib/dtos/device';

class MemoryState {
  private _state = $state({
    ramCapacity: 0,
    ramUsage: 0,
    swapCapacity: 0,
    swapUsage: 0
  });

  get ramCapacity() { return this._state.ramCapacity; }
  get ramUsage() { return this._state.ramUsage; }
  get swapCapacity() { return this._state.swapCapacity; }
  get swapUsage() { return this._state.swapUsage; }

  get ramUsagePercent() {
    return this._state.ramCapacity > 0
      ? (this._state.ramUsage / this._state.ramCapacity) * 100
      : 0;
  }

  update(data: RealtimeMemoryData) {
    this._state.ramCapacity = data.ramCapacity;
    this._state.ramUsage = data.ramUsage;
    this._state.swapCapacity = data.swapCapacity;
    this._state.swapUsage = data.swapUsage;
  }
}

export const memState = new MemoryState();
