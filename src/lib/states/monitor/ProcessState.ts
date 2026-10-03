import type { Process } from '$lib/dtos/device';

class ProcessState {
  private _state = $state<Process[]>([]);

  get processes() { return this._state; }
  get count() { return this._state.length; }

  update(processes: Process[]) {
    this._state = processes;
  }
}

export const processState = new ProcessState();
