<script lang="ts">
    import { Folder, TerminalSquare, Code2, Plus, PlayIcon } from "@lucide/svelte";
    import Container from "../reusable/Container.svelte";
    import { goto } from "$app/navigation";
    type Project = {
      name: string,
      path: string,
      langages: string[],
      framework: string[],
      tag: string[]
    }
    type Folders = {
      name: string,
      path: string
    }
    type Tag = {
      title: string,
      color: string
    }
    const projects = $state<Project[]>([
      {name: 'Project 1', path:'path/to/projects' ,langages : ['Java','TypeScript'], framework:["React"], tag:["frontend"]},
      {name: 'Another Project', path:'path/to/another' ,langages  : ['Java','TypeScript'], framework:["Angular"], tag: []},
      {name: 'Project 3', path:'path/to/projects' ,langages   : ['Java','Python'], framework:["Vue"], tag: ["Saas"]},
      {name: 'Project 4', path:'path/to/projects' ,langages   : ['Java','Python'], framework:["Vue"], tag: ["backend"]},
      {name: 'Project 5', path:'path/to/projects' ,langages   : ['Java','Python'], framework:["Vue"], tag: ["backend"]},
    ]);
    const folders = $state<Folders[]>([
      { name: "Folder One", path: "path/to/folderone" },
      { name: "Folder Two", path: "path/to/folder/two" }
    ])
    const tags = $state<Tag[]>([
      {title: "frontend", color: "#fff"},
      {title: "backend", color: "#fff"},
      {title: "Saas", color: "#fff"}
    ])

    function openTerminal(project: Project) {
      console.log("open terminal", project.path);
    }
    function openEditor(project: Project) {
      console.log("open editor", project.path);
    }

    function tagColor(title: string) {
      const found = tags.find(t => t.title === title);
      return found?.color ?? "#888";
    }
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

            <div class="flex gap-2 flex-wrap">
                {#each projects as project}
                    <div
                        role="button"
                        tabindex="0"
                        aria-label="Open Project"
                        onkeydown={() => alert("Go to project in" + project.path)}
                        onclick={() => goto(`/overlay/projects/${project.name}`)}
                        class="no-select group relative flex items-center justify-between w-64 gap-4 p-1 rounded border border-base-200 hover:border-base-300 hover:bg-base-200/40 transition-all duration-200">

                        <div class="flex items-center gap-2 w-full">
                            <span class="flex items-center justify-center w-16 h-16 rounded bg-base-200 shrink-0">
                                <Folder class="text-base-content/50 w-full" />
                            </span>

                            <div class="flex flex-col w-full h-16 py-1 justify-between min-w-0 gap-1">
                                <div class="flex items-center gap-2 justify-start">
                                    <span class="no-select font-medium text-sm truncate">{project.name}</span>
                                </div>
                                <div class="flex items-center gap-1.5 text-xs text-base-content/40">
                                    {#each project.tag as tag}
                                        <span class="badge badge-sm badge-info badge-soft">{tag}</span>
                                    {/each}
                                </div>
                            </div>
                            <div class="w-16 h-16 flex items-center justify-end">
                                <button class="btn btn-sm btn-square btn-ghost" >
                                    <PlayIcon />
                                </button>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </Container>
    <Container class="w-full flex-1 h-full" >
        <h1>Hello card</h1>
    </Container>
</section>
