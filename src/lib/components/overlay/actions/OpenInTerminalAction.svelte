<script lang="ts">
	import { TerminalSquare } from "@lucide/svelte";
	import type { Project } from "$lib/dtos/project";

	let { project }: { project: Project } = $props();

	function handleOpenTerminal() {
		console.log("Open in terminal:", project.path);
		// TODO: invoke Tauri command to open terminal at project path
	}
</script>

<button
	onclick={handleOpenTerminal}
	class="btn btn-sm rounded btn-ghost"
	aria-label="Open in terminal"
	title="Open in terminal"
>
	<TerminalSquare size={16} />
</button>
