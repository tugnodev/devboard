<script lang="ts">
    import Container from "$lib/components/reusable/Container.svelte";
    import { goto } from "$app/navigation";
    import { routes } from "$lib/states/routes";
    import { page } from "$app/state";
    import { onMount } from "svelte";
    import { preloadCode, preloadData } from "$app/navigation";

    let current = $state(page.url.pathname);
    $effect(() => {
        current = page.url.pathname;
    });
</script>

<Container
    class="h-16 flex items-center justify-center bg-base-200 rounded">
    <ul class="flex w-full h-full gap-0.5">
        {#each $routes as route}
            <button
                onclick={() => goto(`${route.path}`)}
                class="btn aspect-square h-full btn-ghost rounded transition-colors duration-250 border-none"
                class:btn-primary={current.includes(route.path) && current === route.path}
                class:btn-soft={current.includes(route.path) && current === route.path}
                class:bg-base-100={current.includes(route.path) && current === route.path}
            ><route.icon />
            </button>
        {/each}
    </ul>
</Container>
