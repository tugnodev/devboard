<script lang="ts">
	import { Chart, Highlight, Layer, Spline, Tooltip } from 'layerchart';
	import { curveMonotoneX } from 'd3-shape';
	import { Network } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { networkStats } from '$lib/states/device';

	type Point = { send: number; receive: number; time: Date };

	let data = $state<Point[]>([]);

	onMount(() => {
		const interval = setInterval(() => {
			const stats = $networkStats;
			const point: Point = {
				send: stats.send,
				receive: stats.receive,
				time: new Date()
			};
			data = [...data.slice(-19), point];
		}, 1000);
		return () => clearInterval(interval);
	});
</script>

<section class="p-4 flex flex-col gap-2 items-center justify-center w-full h-full aspect-video overflow-hidden">
	<div class="w-full flex items-center">
		<span class="flex items-center gap-1">
			<Network />
			<p>Network</p>
		</span>
	</div>
	{#if data.length > 0}
		<div class="w-full h-full overflow-hidden">
			<Chart
				{data}
				x="time"
				y="send"
				yDomain={[0, 10]}
				y1="receive"
				y1Domain={[0, 10]}
				padding={{ top: 25, left: 10, right: 10 }}
				tooltipContext={{ mode: 'quadtree-x' }}
			>
				{#snippet children({ context })}
					<Layer>
						<!-- curveMonotoneX : ne dépasse jamais les valeurs min/max des points,
						     contrairement à curveCatmullRom qui peut "overshoot" -->
						<Spline y="send" curve={curveMonotoneX} class="stroke-2 stroke-primary fill-none" />
						<Spline y="receive" curve={curveMonotoneX} class="stroke-2 stroke-secondary fill-none" />
						<Highlight points lines y="receive" />
						<Highlight points lines y="send" />
					</Layer>
					<Tooltip.Root {context}>
						{#snippet children({ data })}
							<Tooltip.Header>{data.time.toLocaleTimeString()}</Tooltip.Header>
							<Tooltip.List>
								<Tooltip.Item label="send" value="{data.send.toFixed(2)} MB/s" />
								<Tooltip.Item label="receive" value="{data.receive.toFixed(2)} MB/s" />
							</Tooltip.List>
						{/snippet}
					</Tooltip.Root>
				{/snippet}
			</Chart>
		</div>
		<div class="flex w-full justify-between items-center">
			<div class="flex items-center gap-1">
				<span class="status status-primary animate-pulse"></span> Send
				<p class="badge badge-primary rounded">{data[data.length - 1].send.toFixed(2)} MB/s</p>
			</div>
			<div class="flex items-center gap-1 flex-row-reverse">
				<span class="status status-secondary animate-pulse"></span> Receive
				<p class="badge badge-secondary rounded">{data[data.length - 1].receive.toFixed(2)} MB/s</p>
			</div>
		</div>
	{:else}
		<div class="flex h-full items-center justify-center text-sm text-neutral-500">
			En attente de données réseau...
		</div>
	{/if}
</section>
