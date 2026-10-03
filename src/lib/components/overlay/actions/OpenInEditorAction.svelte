<script lang="ts">
	import { Code2 } from "@lucide/svelte";
	import { projectService } from "$lib/services/project/project.service";
	import type { Project } from "$lib/dtos/project";

	let { project }: { project: Project } = $props();

	async function handleOpenEditor() {
		try {
			await projectService.openInEditor(project.path);
		} catch (e) {
			console.error("Failed to open in editor:", e);
		}
	}
</script>

<button
	onclick={handleOpenEditor}
	class="btn btn-sm rounded btn-ghost"
	aria-label="Open in editor"
	title="Open in editor"
>
	<Code2 size={16} />
</button>
