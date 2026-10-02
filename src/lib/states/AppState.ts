export type AppStateData = {
  overlayVisible: boolean;
  active: boolean;
  interval: number;
};

export class AppState {
  private _state = $state({
    overlayVisible: false,
    active: false,
    interval: 1000
  });

  get overlayVisible() { return this._state.overlayVisible; }
  get active() { return this._state.active; }
  get interval() { return this._state.interval; }

  showOverlay() { this._state.overlayVisible = true; }
  hideOverlay() { this._state.overlayVisible = false; }
  setActive(active: boolean) { this._state.active = active; }
  updateFromRust(data: Pick<AppStateData, 'overlayVisible'>) {
    this._state.overlayVisible = data.overlayVisible;
  }
}

export const appState = new AppState();
