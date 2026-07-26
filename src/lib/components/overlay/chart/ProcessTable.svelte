<script lang="ts">
	import Page from '$lib/components/reusable/Page.svelte';
	import { processState } from '$lib/states/device';

	const ROW_HEIGHT = 48; // px — doit correspondre à h-[48px] sur les <tr>
	const OVERSCAN = 10;

	let scrollContainer = $state<HTMLDivElement>();
	let scrollTop = $state(0);
	let containerHeight = $state(0);

	let count = $derived($processState?.length ?? 0);

	// Bornes de la fenêtre visible (+ overscan)
	let startIndex = $derived(
		Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN)
	);
	let visibleCount = $derived(
		Math.ceil(containerHeight / ROW_HEIGHT) + OVERSCAN * 2
	);
	let endIndex = $derived(Math.min(count, startIndex + visibleCount));

	let visibleItems = $derived(
		($processState ?? []).slice(startIndex, endIndex)
	);

	let topSpacer = $derived(startIndex * ROW_HEIGHT);
	let bottomSpacer = $derived(Math.max(0, (count - endIndex) * ROW_HEIGHT));

	function handleScroll(e: Event) {
		scrollTop = (e.currentTarget as HTMLDivElement).scrollTop;
	}

	// Mesure la hauteur du conteneur et la garde à jour (resize de fenêtre, etc.)
	$effect(() => {
		if (!scrollContainer) return;

		const observer = new ResizeObserver((entries) => {
			containerHeight = entries[0].contentRect.height;
		});
		observer.observe(scrollContainer);

		return () => observer.disconnect();
	});

	function formatBytes(bytes: number, decimals = 1) {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
	}

	function formatRunTime(seconds: number) {
		const h = Math.floor(seconds / 3600);
		const m = Math.floor((seconds % 3600) / 60);
		const s = seconds % 60;
		if (h > 0) return `${h}h ${m}m ${s}s`;
		if (m > 0) return `${m}m ${s}s`;
		return `${s}s`;
	}
</script>

<Page class="h-full overflow-hidden flex flex-col p-0">
	<div class="w-full h-full flex flex-col overflow-hidden">

		<!-- Zone de Scroll globale (Conteneur parent) -->
		<div
			bind:this={scrollContainer}
			onscroll={handleScroll}
			class="w-full h-full overflow-y-auto relative"
		>

			<table class="table table-zebra w-full table-fixed">
				<!-- Entête fixe -->
				<thead class="sticky top-0 bg-base-100 z-20 shadow-sm">
					<tr>
						<th class="w-12">#</th>
						<th class="text-left w-1/4">Name</th>
						<th class="text-right">PID</th>
						<th class="text-right">CPU</th>
						<th class="text-right">Memory (RAM / Swap)</th>
						<th class="text-right">Disk (R / W)</th>
						<th class="text-right">User / Group</th>
						<th class="text-right">Run Time</th>
					</tr>
				</thead>

				<tbody>
					{#if !$processState || $processState.length === 0}
						<tr>
							<td colspan="8" class="text-center text-base-content/50 py-12">
								Aucun processus en cours d'exécution...
							</td>
						</tr>
					{:else}
						<!-- Spacer supérieur pour simuler le scroll -->
						<tr>
							<td colspan="8" style="height: {topSpacer}px; padding: 0;"></td>
						</tr>

						<!-- Rendu des lignes visibles uniquement -->
						{#each visibleItems as process, i (process.pid)}
							<tr class="hover h-[48px]">
								<td class="whitespace-nowrap text-xs text-base-content/50">
									{startIndex + i + 1}
								</td>
								<td class="text-left font-semibold truncate">{process.name}</td>
								<td class="text-right whitespace-nowrap font-mono">{process.pid}</td>
								<td class="text-right whitespace-nowrap font-mono">
									{process.cpuUsage.toFixed(1)}%
								</td>
								<td class="text-right whitespace-nowrap font-mono text-xs">
									<div>{formatBytes(process.memoryUsage.ram)}</div>
									{#if process.memoryUsage.swap > 0}
										<div class="text-base-content/50">
											Swap: {formatBytes(process.memoryUsage.swap)}
										</div>
									{/if}
								</td>
								<td class="text-right whitespace-nowrap font-mono text-xs">
									<span class="text-emerald-600">R: {formatBytes(process.diskUsage.read)}</span>
									<br />
									<span class="text-amber-600">W: {formatBytes(process.diskUsage.write)}</span>
								</td>
								<td class="text-right whitespace-nowrap text-xs font-mono">
									{process.userId ?? 'N/A'} / {process.groupId ?? 'N/A'}
								</td>
								<td class="text-right whitespace-nowrap font-mono text-xs">
									{formatRunTime(process.runTime)}
								</td>
							</tr>
						{/each}

						<!-- Spacer inférieur -->
						<tr>
							<td colspan="8" style="height: {bottomSpacer}px; padding: 0;"></td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</Page>
