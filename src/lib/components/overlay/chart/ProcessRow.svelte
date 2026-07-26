<script lang="ts">
	import type { Process } from "$lib/dtos/device";

	let { process, index } : { process: Process, index: number } = $props();

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

<!-- Les enfants directs se positionnent automatiquement dans les colonnes Grid du parent -->
<div class="whitespace-nowrap text-xs text-base-content/50">{index + 1}</div>
<div class="text-left font-semibold truncate">{process.name}</div>
<div class="text-right whitespace-nowrap font-mono">{process.pid}</div>
<div class="text-right whitespace-nowrap font-mono">
	{process.cpuUsage.toFixed(1)}%
</div>

<!-- Memory Usage -->
<div class="text-right whitespace-nowrap font-mono text-xs">
	<div>{formatBytes(process.memoryUsage.ram)}</div>
	{#if process.memoryUsage.swap > 0}
		<div class="text-base-content/50">
			Swap: {formatBytes(process.memoryUsage.swap)}
		</div>
	{/if}
</div>

<!-- Disk Usage -->
<div class="text-right whitespace-nowrap font-mono text-xs">
	<span class="text-emerald-600">R: {formatBytes(process.diskUsage.read)}</span>
	<br />
	<span class="text-amber-600">W: {formatBytes(process.diskUsage.write)}</span>
</div>

<!-- User / Group IDs -->
<div class="text-right whitespace-nowrap text-xs font-mono">
	{process.userId ?? 'N/A'} / {process.groupId ?? 'N/A'}
</div>

<!-- Run Time -->
<div class="text-right whitespace-nowrap font-mono text-xs">
	{formatRunTime(process.runTime)}
</div>
