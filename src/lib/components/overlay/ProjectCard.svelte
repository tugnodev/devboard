<script lang="ts">
	import { Folder } from "@lucide/svelte";
	import { goto } from "$app/navigation";
	import type { Project } from "$lib/dtos/project";
	import ProjectActions from "./actions/ProjectActions.svelte";

	let { project }: { project: Project } = $props();

	function handleOpen() {
		goto(`/overlay/projects/${project.id}?path=${encodeURIComponent(project.path)}`);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			handleOpen();
		}
	}
</script>

<div
	role="button"
	tabindex="0"
	aria-label={`Open ${project.name}`}
	onkeydown={handleKeydown}
	onclick={handleOpen}
	class="card bg-base-100 border border-base-200 hover:border-base-300 hover:shadow-md transition-all duration-200 cursor-pointer no-select"
>
	<div class="card-body p-4 gap-3">
		<!-- Header : icône + nom + actions -->
		<div class="flex items-start justify-between gap-3">
			<div class="flex items-center gap-3 min-w-0">
				<span class="flex items-center justify-center w-12 h-12 rounded-lg bg-base-200 shrink-0">
					<Folder size={22} class="text-base-content/50" />
				</span>
				<div class="flex flex-col min-w-0">
					<h2 class="card-title text-base truncate">{project.name}</h2>
					<span class="text-xs text-base-content/40 truncate">{project.path}</span>
				</div>
			</div>
			<div class="card-actions" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
				<ProjectActions {project} />
			</div>
		</div>

		<!-- Tags -->
		<div class="flex items-center gap-1.5 flex-wrap">
			{#each project.tags as tag}
				<span class="badge badge-sm badge-info badge-soft">{tag}</span>
			{/each}
		</div>

		<!-- Languages & Framework -->
		<div class="flex items-center gap-2 flex-wrap">
			{#each project.languages as lang}
				<span class="badge badge-sm badge-ghost">{lang}</span>
			{/each}
			{#each project.framework as fw}
				<span class="badge badge-sm badge-secondary badge-soft">{fw}</span>
			{/each}
		</div>
	</div>
</div>
