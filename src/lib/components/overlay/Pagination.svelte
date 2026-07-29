<script lang="ts">
    import ProcessTable from "$lib/components/overlay/chart/ProcessTable.svelte";
    import ServiceTable from "$lib/components/overlay/chart/ServiceTable.svelte";
    import { Cpu, Infinity } from "@lucide/svelte";

    let activePage = $state("Processes");
    const pages = [
      { label: "Processes", icon: Cpu, content: ProcessTable },
      { label: "Services", icon: Infinity, content: ServiceTable },
    ]
</script>

<section class="w-full h-full overflow-y-hidden flex flex-col min-h-0">
    <div class="tabs flex flex-col flex-1 min-h-0 justify-center tabs-border">
        <div class="tabs flex justify-center tabs-border">
            {#each pages as page}
                <label class="tab flex items-center">
                    <input type="radio" name="my_tabs_2" checked={activePage === page.label} onchange={() => activePage = page.label} />
                    <span class="flex items-center text-sm gap-1"> <page.icon /> {page.label}</span>
                </label>
            {/each}
        </div>
        {#each pages as page}
            <div class="tab-content border-base-300 rounded flex-1 min-h-0 {activePage === page.label ? 'block' : 'hidden'}">
                <page.content />
            </div>
        {/each}
    </div>
</section>
