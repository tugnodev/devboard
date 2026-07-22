import { House, Folder, Settings2Icon, MonitorDot } from "@lucide/svelte";
import { readable } from "svelte/store";

export const routes = readable([
  { name: "Home", path: "/overlay", icon: House },
  { name: "Monitor", path: "/overlay/monitor", icon: MonitorDot },
  { name: "Projects", path: "/overlay/projects", icon: Folder },
  { name: "Settings", path: "/overlay/settings", icon: Settings2Icon },
]);
