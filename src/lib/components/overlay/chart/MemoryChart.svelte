<script lang="ts">
	import { cubicInOut } from 'svelte/easing';
	import { Arc, Chart, Layer, Legend } from 'layerchart';
    import { onDestroy } from 'svelte';
    import { MemoryStickIcon } from '@lucide/svelte';
    import { memState } from '$lib/states/device';

</script>

<div class="flex flex-col w-full h-full aspect-video">
    <div class="flex w-full items-center">
        <span class="flex items-center gap-1">
            <MemoryStickIcon />
            <p>Memory</p>
        </span>
    </div>
    <Chart class="flex w-full h-full">
    	<Layer center>
    		<Arc
    			initialValue={0}
    			value={($memState.ramUsage * 100) / $memState.ramCapacity}
    			innerRadius={-20}
    			cornerRadius={10}
    			class="fill-warning"
    			track={{ class: 'fill-warning/10' }}
    			motion={{ type: 'tween', duration: 300, easing: cubicInOut }}
    		/>
    		<Arc
    			initialValue={0}
    			value={($memState.swapUsage * 100) / $memState.swapCapacity}
    			outerRadius={-25}
    			innerRadius={-20}
    			cornerRadius={10}
    			class="fill-success"
    			track={{ class: 'fill-success/10' }}
    			motion={{ type: 'tween', duration: 300, easing: cubicInOut }}
    		/>
    	</Layer>
    </Chart>
    <div class="flex flex-col justify-end w-full gap-2">
        <div class="flex gap-2 items-center justify-between">
            <span class="flex gap-2 items-center"><div class="status status-warning animate-pulse" ></div> RAM</span>
            <span class="flex gap-2 items-center">SWAP<div class="status status-success animate-pulse" ></div></span>
        </div>
        <div class="flex gap-2 items-center justify-between">
            <span class="badge badge-warning p-1 rounded">{Math.fround(($memState.ramUsage) / Math.pow(1024, 3)).toFixed(2)} / {Math.fround($memState.ramCapacity / Math.pow(1024, 3)).toFixed(2)} GB</span>
            <span class="badge badge-success p-1 rounded">{Math.fround(($memState.swapUsage) / Math.pow(1024, 3)).toFixed(2)} / {Math.fround($memState.swapCapacity / Math.pow(1024, 3)).toFixed(2)} GB</span>
        </div>
    </div>
</div>
