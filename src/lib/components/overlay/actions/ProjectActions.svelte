<script lang="ts">
	import type { Project } from "$lib/dtos/project";
	import OpenProjectAction from "./OpenProjectAction.svelte";
	import OpenInEditorAction from "./OpenInEditorAction.svelte";
	import OpenInTerminalAction from "./OpenInTerminalAction.svelte";
	import DeleteProjectAction from "./DeleteProjectAction.svelte";

	let { project }: { project: Project } = $props();
</script>

<div class="flex items-center gap-1">
	<OpenProjectAction {project} />
	<OpenInEditorAction {project} />
	<OpenInTerminalAction {project} />
	<DeleteProjectAction {project} />
</div>
