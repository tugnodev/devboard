import type { NetworkStats } from '$lib/dtos/device';

class NetworkState {
  private _state = $state({
    send: 0,
    receive: 0,
    time: new Date()
  });

  get send() { return this._state.send; }
  get receive() { return this._state.receive; }
  get time() { return this._state.time; }

  update(data: NetworkStats) {
    this._state.send = data.bytesSent / 1000;
    this._state.receive = data.bytesReceived / 1000;
    this._state.time = new Date(data.timestampSecs * 1000);
  }
}

export const networkState = new NetworkState();
