<script lang="ts">
	import { Code2 } from "@lucide/svelte";
	import type { Project } from "$lib/dtos/project";

	let { project }: { project: Project } = $props();

	function handleOpenEditor() {
		console.log("Open in editor:", project.path);
		// TODO: invoke Tauri command to open project in editor
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
