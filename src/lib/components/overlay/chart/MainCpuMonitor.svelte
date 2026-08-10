<script lang="ts">
	import { Arc, Chart, ClipPath, Group, Layer, Line, LinearGradient, Text } from 'layerchart';
	import { scaleLinear, scaleThreshold } from 'd3-scale';
    import { Cpu } from '@lucide/svelte';
    import { cpuState, cpuInfosState } from '$lib/states/device';
    import { onMount } from 'svelte';


	let outerRadius = 120;
	let innerRadius = 104;
const domain: [number, number] = [0, 100];
	const angleRange: [number, number] = [-120, 120];

	const angleScale = scaleLinear().domain(domain).range(angleRange);

	const ticks = [0, 25, 50, 75, 100];

	const statusScale = scaleThreshold<number, { label: string; class: string }>()
		.domain([30, 70, 90])
		.range([
			{ label: 'Low', class: 'fill-red-500' },
			{ label: 'Good', class: 'fill-emerald-500' },
			{ label: 'Warning', class: 'fill-yellow-500' },
			{ label: 'Critical', class: 'fill-red-500' }
		]);

	const status = $derived(statusScale(Math.round($cpuState.globalUsage)));


</script>

<div class="p-4 aspect-video flex flex-col justify-center w-full h-full items-center gap-2">
    <div class="w-full flex items-center">
        <span class="flex items-center gap-1">
            <Cpu />
            <p>CPU</p>
        </span>
    </div>
	<Chart class="flex items-center justify-center">
		<Layer center>
			<Group y={30}>
				<LinearGradient class="from-emerald-500 via-yellow-500 to-red-500">
					{#snippet children({ gradient })}
						<ClipPath>
							{#snippet clip()}
								<Arc
									value={Math.f16round($cpuState.globalUsage)}
									{domain}
									range={angleRange}
									{outerRadius}
									{innerRadius}
									cornerRadius={6}
									motion="spring"
								/>
							{/snippet}
							<Arc
								value={domain[1]}
								{domain}
								range={angleRange}
								{outerRadius}
								{innerRadius}
								cornerRadius={6}
								fill={gradient}
								/>
						</ClipPath>
					{/snippet}
				</LinearGradient>

				<!-- Track outline -->
				<Arc
					value={domain[1]}
					{domain}
					range={angleRange}
					{outerRadius}
					{innerRadius}
					cornerRadius={6}
					class="fill-none"
					track={{ class: 'fill-none stroke-surface-content/10' }}
				/>

				<!-- Tick marks and labels -->
				{#each ticks as tick (tick)}
					{@const angleDeg = angleScale(tick)}
					{@const angleRad = (angleDeg * Math.PI) / 180}
					{@const tickOuter = innerRadius - 3}
					{@const tickInner = innerRadius - 10}
					{@const labelRadius = innerRadius - 16}
					<Line
						x1={Math.sin(angleRad) * tickInner}
						y1={-Math.cos(angleRad) * tickInner}
						x2={Math.sin(angleRad) * tickOuter}
						y2={-Math.cos(angleRad) * tickOuter}
						class="stroke-surface-content/40"
						strokeWidth={1.5}
					/>
					<Text
						x={Math.sin(angleRad) * labelRadius}
						y={-Math.cos(angleRad) * labelRadius}
						value={String(tick)}
						textAnchor="middle"
						verticalAnchor="middle"
						class="text-[8px] fill-surface-content/50 tabular-nums"
					/>
				{/each}

				<!-- Value display -->
				<Text
					value={Math.round($cpuState.globalUsage) + '%'}
					textAnchor="middle"
					verticalAnchor="middle"
					class="text-4xl font-bold tabular-nums"
				/>

				<!-- Status label -->
				<Text
					x={0}
					y={22}
					value={status.label}
					textAnchor="middle"
					verticalAnchor="middle"
					class={`text-[18px] font-medium ${status.class}`}
				/>
			</Group>
		</Layer>
	</Chart>
	<div class="flex items-center justify-between gap-1  h-16 w-full">
        <div class="flex flex-col items-start gap-1">
            <p>Speed</p>
            <span class="badge rounded badge-warning">
                {Math.fround($cpuState.globalFrequency / 1000).toFixed(2)} GHz
            </span>
        </div>
        <div class="flex flex-col items-end gap-1">
            <p>Max Speed</p>
            <span class="badge rounded badge-error">
                {Math.fround($cpuInfosState.maxFrequency / 1000).toFixed(2)} GHz
            </span>
        </div>
	</div>
</div>
