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

<section class="w-full h-full overflow-y-hidden">
    <!-- name of each tab group should be unique -->
    <div class="tabs flex h-full justify-center overflow-y-hidden tabs-border">
        {#each pages as page}
            <label class="tab flex items-center">
                <input type="radio" name="my_tabs_2" checked={activePage === page.label} onchange={() => activePage = page.label} />
                <span class="flex items-center text-sm gap-1"> <page.icon /> {page.label}</span>
            </label>
            <div class="tab-content border-base-300 rounded">
                <page.content />
            </div>
        {/each}
    </div>
</section>
