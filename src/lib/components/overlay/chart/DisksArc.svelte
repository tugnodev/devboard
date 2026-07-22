<script lang="ts">
    import { HardDrive } from '@lucide/svelte';
    import { invoke } from '@tauri-apps/api/core';
	import { ArcChart } from 'layerchart';
    import { onMount } from 'svelte';
    import type { Disk } from '$lib/dtos/device';

	let data = $state<Disk[]>([]);
	onMount(async () => {
		const disks = await invoke<Disk[]>('get_disks_infos');
		data = disks;
	});
</script>

<section class="flex w-full flex-col gap-1 h-full aspect-video">
    <div class="w-full">
        <span class="flex items-center gap-1">
            <HardDrive />
            <p>Storage</p>
        </span>
    </div>
    {#if data.length > 0}
        <section class="grid grid-cols-3 grid-rows-2 w-full h-full">
            {#each data as disk}
	    <ArcChart
	    data={[disk]}
	    class="w-full"
	    key="mountPoint"
	    value="usedSpaceMb"
	    maxValue={disk.totalSpaceMb}
	    range={[0, 360]}
	    outerRadius={0}
	    innerRadius={-10}
	    cornerRadius={50}
	    />
	{/each}
        </section>
    {/if}
</section>
