<script lang="ts">
	import { FolderOpen } from "@lucide/svelte";
	import type { Project } from "$lib/dtos/project";

	let { project }: { project: Project } = $props();

	function handleOpen() {
		console.log("Open project:", project.path);
		// TODO: invoke Tauri command to open project folder
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
