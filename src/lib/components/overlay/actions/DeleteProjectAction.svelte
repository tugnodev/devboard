<script lang="ts">
	import { Trash2 } from "@lucide/svelte";
	import { projectService } from "$lib/services/project/project.service";
	import type { Project } from "$lib/dtos/project";

	let { project }: { project: Project } = $props();

	async function handleDelete() {
		try {
			await projectService.deleteProject(project.path);
		} catch (e) {
			console.error("Failed to delete project:", e);
		}
	}
</script>

<button
	onclick={handleDelete}
	class="btn btn-sm rounded btn-ghost btn-error"
	aria-label="Delete project"
	title="Delete"
>
	<Trash2 size={16} />
</button>
