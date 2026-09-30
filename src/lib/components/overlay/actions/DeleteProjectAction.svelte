<script lang="ts">
	import { Trash2 } from "@lucide/svelte";
	import type { Project } from "$lib/dtos/project";

	let { project }: { project: Project } = $props();

	function handleDelete() {
		console.log("Delete project:", project.path);
		// TODO: invoke Tauri command to delete project
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
