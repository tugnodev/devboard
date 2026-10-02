import { House, Folder, Settings2Icon, MonitorDot } from "@lucide/svelte";

class RoutesState {
  private _state = $state({
    routes: [
      { name: 'Home', path: '/overlay', icon: House },
      { name: 'Monitor', path: '/overlay/monitor', icon: MonitorDot },
      { name: 'Projects', path: '/overlay/projects', icon: Folder },
      { name: 'Settings', path: '/overlay/settings', icon: Settings2Icon },
    ]
  });

  get routes() { return this._state.routes; }
}

export const routesState = new RoutesState();
