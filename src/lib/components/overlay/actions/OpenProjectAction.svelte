<script lang="ts">
	import { FolderOpen } from "@lucide/svelte";
	import { projectService } from "$lib/services/project/project.service";
	import type { Project } from "$lib/dtos/project";

	let { project }: { project: Project } = $props();

	async function handleOpen() {
		try {
			await projectService.openProject(project.path);
		} catch (e) {
			console.error("Failed to open project:", e);
		}
	}
</script>

<button
	onclick={handleOpen}
	class="btn btn-sm rounded btn-ghost"
	aria-label="Open project"
	title="Open"
>
	<FolderOpen size={16} />
</button>
