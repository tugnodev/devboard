<script lang="ts">
    import { Cpu, MemoryStick, Power, Timer } from "@lucide/svelte";

  /**
   * Liste horizontale de cards (daisyUI) affichant les projets actuellement
   * allumés/en cours d'exécution, avec leur consommation RAM et CPU.
   *
   * Props :
   * - projects : tableau d'objets
   *     {
   *       id            : identifiant unique
   *       name          : nom du projet
   *       status        : 'running' | 'starting' | 'error' (défaut 'running')
   *       cpuPercent     : 0-100
   *       ramUsedMb      : Mo utilisés
   *       ramLimitMb     : Mo alloués/limite (optionnel, pour le % RAM)
   *       pid            : PID du process (optionnel)
   *       uptimeSeconds  : temps depuis le démarrage (optionnel)
   *     }
   */

   type Project = {
    id: number;
    name: string;
    cpuPercent: number;
    ramUsedMb: number;
    pid: number;
    uptimeSeconds: number;
  };
  let { projects = [], maxRam }: { projects: Project[]; maxRam: number } = $props();

  function formatUptime(seconds: number): string {
    if (seconds == null) return '0 s';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h} h ${m} min`;
    if (m > 0) return `${m} min`;
    return `${seconds} s`;
  }

  function ramPercent(project: Project): number {
    if (!maxRam) return 0;
    return Math.min(100, Math.round((project.ramUsedMb / maxRam) * 100));
  }
</script>

<div class="flex gap-4 overflow-x-auto items-center w-full h-full">
  {#each projects as project (project.id ?? project.name)}
    {@const uptime = formatUptime(project.uptimeSeconds)}
    <div class="card rounded bg-base-100 shadow shrink-0 w-fit h-full border border-base-300">
      <div class="card-body p-2 gap-3">
        <!-- En-tête : nom + statut -->
        <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-1">
                <span class="inline-block w-2 h-2 rounded-full bg-success mr-1 animate-pulse"></span>
                <h3 class="card-title text-base truncate">{project.name}</h3>
            </div>
            <div>
                <button class="h-fit btn-sm btn btn-soft btn-error btn-circle aspect-square" >
                    <Power />
                </button>
            </div>
        </div>
        <div class="flex items-start gap-4">
            <span class="flex gap-1 items-center"><Cpu size={16} /> {project.cpuPercent}%</span>
            <span class="flex gap-1 items-center"><MemoryStick size={16} /> {project.ramUsedMb} Mb</span>
        </div>
        <div class="flex items-center gap-1">
            <Timer size={16} />
            <h3>{uptime}</h3>
        </div>
      </div>
    </div>
  {:else}
    <div class="text-sm text-base-content/50 italic p-4">
      Aucun projet en cours d'exécution.
    </div>
  {/each}
</div>
