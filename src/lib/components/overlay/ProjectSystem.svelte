<script lang="ts">
    import { Folder, Plus } from "@lucide/svelte";
    import Container from "../reusable/Container.svelte";
    import type { Project } from "$lib/dtos/project";
    import ProjectCard from "./ProjectCard.svelte";

    type Folders = {
      name: string,
      path: string
    }
    type Tag = {
      title: string,
      color: string
    }
    const projects = $state<Project[]>([]);
    const folders = $state<Folders[]>([]);
    const tags = $state<Tag[]>([]);
</script>

<section class="h-full w-full flex gap-2">
    <Container class="h-full flex-3 flex w-full overflow-y-auto">
        <aside class="h-full w-72 flex flex-col gap-8 py-6">
        <div class="w-full px-5 flex flex-col items-start justify-center gap-1">
            <span class="text-xs font-medium tracking-wide uppercase text-base-content/40 px-2 mb-1">Folders</span>
            {#each folders as folder }
                <button class="group flex items-center gap-3 w-full px-2 py-1.5 rounded-lg text-sm text-base-content/80 hover:text-base-content hover:bg-base-200 transition-colors duration-150">
                    <span class="flex items-center justify-center w-6 h-6 rounded-md bg-base-200 group-hover:bg-base-300 transition-colors duration-150">
                        <Folder size={13} class="text-base-content/60" />
                    </span>
                    <span class="truncate">{folder.name}</span>
                </button>
            {/each}
            <button class="flex items-center gap-2 w-full px-2 py-1.5 mt-1 rounded-lg text-sm text-base-content/40 hover:text-primary hover:bg-primary/5 transition-colors duration-150">
                <Plus size={14} />
                Add Folder
            </button>
        </div>

        <div class="w-full px-5 flex flex-col items-start justify-center gap-1">
            <span class="text-xs font-medium tracking-wide uppercase text-base-content/40 px-2 mb-1">Tags</span>
            {#each tags as tag }
                <button class="flex items-center gap-3 w-full px-2 py-1.5 rounded-lg text-sm text-base-content/80 hover:text-base-content hover:bg-base-200 transition-colors duration-150">
                    <span class="w-2 h-2 rounded-full shrink-0" style={`background-color:${tag.color}`}></span>
                    <span class="truncate">{tag.title}</span>
                </button>
            {/each}
            <button class="flex items-center gap-2 w-full px-2 py-1.5 mt-1 rounded-lg text-sm text-base-content/40 hover:text-primary hover:bg-primary/5 transition-colors duration-150">
                <Plus size={14} />
                Add Tag
            </button>
        </div>
    </aside>

        <div class="divider divider-horizontal m-0"></div>

        <div class="flex-3 mx-auto p-4 flex flex-col gap-6">
            <div class="flex items-center justify-between">
                <div class="flex flex-col gap-0.5">
                    <h2 class="text-xl font-semibold tracking-tight">Projects</h2>
                    <span class="text-sm text-base-content/40">{projects.length} projects</span>
                </div>
                <button class="btn btn-primary btn-sm gap-2 rounded-lg">
                    <Plus size={15} />
                    New Project
                </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {#each projects as project}
                    <ProjectCard {project} />
                {:else}
                    <div class="col-span-full flex items-center justify-center text-base-content/40 py-12">
                        No projects yet. Create one to get started.
                    </div>
                {/each}
            </div>
        </div>
    </Container>
</section>
