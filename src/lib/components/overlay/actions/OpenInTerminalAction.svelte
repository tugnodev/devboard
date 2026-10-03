<script lang="ts">
	import { TerminalSquare } from "@lucide/svelte";
	import { projectService } from "$lib/services/project/project.service";
	import type { Project } from "$lib/dtos/project";

	let { project }: { project: Project } = $props();

	async function handleOpenTerminal() {
		try {
			await projectService.openInTerminal(project.path);
		} catch (e) {
			console.error("Failed to open in terminal:", e);
		}
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
