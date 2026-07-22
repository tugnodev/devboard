<script lang="ts">
	import Page from '$lib/components/reusable/Page.svelte';
	import { processState } from '$lib/states/device';

	// Props du composant (Svelte 5)


	// Utilitaire pour formater les octets proprement (B, KB, MB, GB)
	function formatBytes(bytes: number, decimals = 1) {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
	}

	// Utilitaire pour formater le temps d'exécution (secondes -> HH:MM:SS)
	function formatRunTime(seconds: number) {
		const h = Math.floor(seconds / 3600);
		const m = Math.floor((seconds % 3600) / 60);
		const s = seconds % 60;
		if (h > 0) return `${h}h ${m}m ${s}s`;
		if (m > 0) return `${m}m ${s}s`;
		return `${s}s`;
	}
</script>

<Page class="h-full overflow-y-scroll">
	<div class="w-full overflow-x-auto overflow-y-hidden">
		<table class="table table-zebra w-full table-sticky">
			<thead class="sticky top-0 bg-base-100 z-10">
				<tr>
					<th></th>
					<th class="text-left w-full">Name</th>
					<th class="text-right">PID</th>
					<th class="text-right">CPU</th>
					<th class="text-right">Memory (RAM / Swap)</th>
					<th class="text-right">Disk (Read / Write)</th>
					<th class="text-right">User / Group</th>
					<th class="text-right">Run Time</th>
				</tr>
			</thead>
			<tbody>
				{#each $processState as process, index (process.pid)}
					<tr class="hover">
						<td class="whitespace-nowrap text-xs text-base-content/50">{index + 1}</td>
						<td class="text-left font-semibold">{process.name}</td>
						<td class="text-right whitespace-nowrap font-mono">{process.pid}</td>
						<td class="text-right whitespace-nowrap font-mono">
							{process.cpuUsage.toFixed(1)}%
						</td>
						<!-- Memory Usage -->
						<td class="text-right whitespace-nowrap font-mono text-xs">
							<div>{formatBytes(process.memoryUsage.ram)}</div>
							{#if process.memoryUsage.swap > 0}
								<div class="text-base-content/50">
									Swap: {formatBytes(process.memoryUsage.swap)}
								</div>
							{/if}
						</td>
						<!-- Disk Usage -->
						<td class="text-right whitespace-nowrap font-mono text-xs">
							<span class="text-emerald-600">R: {formatBytes(process.diskUsage.read)}</span>
							<br />
							<span class="text-amber-600">W: {formatBytes(process.diskUsage.write)}</span>
						</td>
						<!-- User / Group IDs -->
						<td class="text-right whitespace-nowrap text-xs font-mono">
							{process.userId ?? 'N/A'} / {process.groupId ?? 'N/A'}
						</td>
						<!-- Run Time -->
						<td class="text-right whitespace-nowrap font-mono text-xs">
							{formatRunTime(process.runTime)}
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="8" class="text-center text-base-content/50 py-4">
							Aucun processus en cours d'exécution...
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</Page>
