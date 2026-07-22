<script lang="ts">
    import Page from "$lib/components/reusable/Page.svelte";
    import { Play, Square, RefreshCw, AlertTriangle } from "@lucide/svelte";
    import { linuxMockSystemServices, windowsMockSystemServices, type SystemService, type WindowsService, type LinuxService } from "$lib/dtos/data";

    // Change cette valeur pour basculer l'affichage ("windows" ou "linux")
    let currentOs = $state("linux");

    let windowsServices: WindowsService[] = windowsMockSystemServices();
    let linuxServices: LinuxService[] = linuxMockSystemServices();

    // Fonction utilitaire pour formater les octets en MB lisibles
    function formatMemory(bytes: number | null): string {
        if (bytes === null) return "—";
        return `${Math.round(bytes / (1024 * 1024))} MB`;
    }
</script>

<section class="h-full w-full overflow-y-scroll pb-20">
    <div class="w-full h-full overflow-x-auto">
        <table class="table table-zebra w-full table-auto h-full">
            <thead class="">
                <tr class="">
                    <th></th>
                    {#if currentOs === "windows"}
                        <th class="text-left">Name / Display Name</th>
                        <th class="text-left">Status</th>
                        <th class="text-left">Startup Type</th>
                        <th class="text-right">PID</th>
                        <th class="text-left">Account</th>
                    {:else}
                        <th class="text-left">Unit Name / Description</th>
                        <th class="text-left">Active State</th>
                        <th class="text-left">Load / Boot</th>
                        <th class="text-right">PID</th>
                        <th class="text-right">Memory</th>
                    {/if}
                </tr>
            </thead>
            <tbody class="overflow-y-scroll no-scrollbar">
                {#if currentOs === "windows"}
                    {#each windowsServices as service, index}
                        <tr class="hover">
                            <td class="text-base-content/50 text-xs w-4">{index + 1}</td>
                            <td class="text-left max-w-xs truncate">
                                <div class="font-semibold text-sm">{service.displayName}</div>
                                <div class="text-xs text-base-content/60 font-mono">{service.name}</div>
                            </td>
                            <td class="text-left whitespace-nowrap">
                                {#if service.status === "Running"}
                                    <span class="badge badge-success badge-sm text-white font-medium">{service.status}</span>
                                {:else if service.status === "Stopped"}
                                    <span class="badge badge-ghost badge-sm text-base-content/60 font-medium">{service.status}</span>
                                {:else if service.status.includes("Pending")}
                                    <span class="badge badge-warning badge-sm font-medium">{service.status}</span>
                                {:else}
                                    <span class="badge badge-info badge-sm text-white font-medium">{service.status}</span>
                                {/if}
                            </td>
                            <td class="text-left whitespace-nowrap text-sm text-base-content/80">
                                {service.startType}
                            </td>
                            <td class="text-right font-mono text-sm">
                                {service.pid ?? "—"}
                            </td>
                            <td class="text-left text-xs text-base-content/70 font-mono max-w-xs truncate" title={service.account}>
                                {service.account}
                            </td>
                        </tr>
                    {/each}
                {:else}
                    {#each linuxServices as service, index}
                        <tr class="hover">
                            <td class="text-base-content/50 text-xs w-4">{index + 1}</td>
                            <td class="text-left max-w-sm">
                                <div class="font-mono font-semibold text-sm text-primary">{service.name}</div>
                                <div class="text-xs text-base-content/70 truncate" title={service.description}>{service.description}</div>
                            </td>
                            <td class="text-left whitespace-nowrap">
                                <div class="flex flex-col gap-0.5">
                                    {#if service.activeState === "active"}
                                        <span class="badge badge-success badge-sm text-white font-medium w-fit">{service.activeState}</span>
                                    {:else if service.activeState === "failed"}
                                        <span class="badge badge-error badge-sm text-white font-medium w-fit">{service.activeState}</span>
                                    {:else if service.activeState === "activating" || service.activeState === "deactivating"}
                                        <span class="badge badge-warning badge-sm font-medium w-fit">{service.activeState}</span>
                                    {:else}
                                        <span class="badge badge-ghost badge-sm text-base-content/60 font-medium w-fit">{service.activeState}</span>
                                    {/if}
                                    <span class="text-[10px] text-base-content/50 font-mono pl-1">({service.subState})</span>
                                </div>
                            </td>
                            <td class="text-left whitespace-nowrap">
                                <div class="text-sm">{service.enabledState}</div>
                                <div class="text-[10px] text-base-content/50 font-mono">
                                    config: <span class:text-error={service.loadState !== "loaded"}>{service.loadState}</span>
                                </div>
                            </td>
                            <td class="text-right font-mono text-sm">
                                {service.pid ?? "—"}
                            </td>
                            <td class="text-right font-mono text-sm whitespace-nowrap">
                                {formatMemory(service.memoryBytes)}
                            </td>
                        </tr>
                    {/each}
                {/if}
            </tbody>
        </table>
    </div>
</section>
