<script lang="ts">
	import { Chart, Highlight, Layer, Spline, Tooltip } from 'layerchart';
	import { curveCatmullRom } from 'd3-shape';
	import { Network } from '@lucide/svelte'; // Correction import lucide
	import { onMount } from 'svelte';
	import { networkStats } from '$lib/states/device';

	let data = $state<{ send: number; receive: number; time: Date }[]>([]);

	onMount(() => {
		const interval = setInterval(() => {
			data = [...data.slice(-19), $networkStats];
		}, 1000);

		return () => clearInterval(interval);
	});
</script>

<section class="flex flex-col gap-2 items-center justify-center w-full h-full aspect-video overflow-hidden">
	<div class="w-full flex items-center">
		<span class="flex items-center gap-1">
			<Network />
			<p>Network</p>
		</span>
	</div>

	{#if data.length > 0}
		<div class="w-full h-full"> <!-- Important : Donner une hauteur explicite à la zone du graph -->
			<Chart
				{data}
				x="time"
				y="send"
				yDomain={[0, Math.max(...data.map(d => d.send))]}
				y1="receive"
				y1Domain={[0, Math.max(...data.map(d => d.receive))]}
				padding={{ top: 10, left: 10, right: 10 }}
				tooltipContext={{ mode: 'quadtree-x' }}
			>
				{#snippet children({ context })}
					<Layer>
						<!-- ✅ Passer directement l'accesseur/clé à Spline sans appeler xScale manuellement -->
						<Spline y="send" curve={curveCatmullRom} class="stroke-2 stroke-primary fill-none" />
						<Spline y="receive" curve={curveCatmullRom} class="stroke-2 stroke-secondary fill-none" />
						<Highlight points lines y="receive" />
						<Highlight points lines y="send" />
					</Layer>

					<Tooltip.Root {context}>
						{#snippet children({ data })}
							<Tooltip.Header>{data.time.toLocaleTimeString()}</Tooltip.Header>
							<Tooltip.List>
								<Tooltip.Item label="send" value="{data.send} Kb/s" />
								<Tooltip.Item label="receive" value="{data.receive} Kb/s" />
							</Tooltip.List>
						{/snippet}
					</Tooltip.Root>
				{/snippet}
			</Chart>
		</div>

		<div class="flex w-full justify-between items-center">
			<div class="flex items-center gap-1">
				<span class="status status-primary animate-pulse"></span> Send
				<p class="badge badge-primary rounded">{data[data.length - 1].send} Kb/s</p>
			</div>
			<div class="flex items-center gap-1 flex-row-reverse">
				<span class="status status-secondary animate-pulse"></span> Receive
				<p class="badge badge-secondary rounded">{data[data.length - 1].receive} Kb/s</p>
			</div>
		</div>
	{:else}
		<div class="flex h-full items-center justify-center text-sm text-neutral-500">
			En attente de données réseau...
		</div>
	{/if}
</section>
