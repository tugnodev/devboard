<script lang="ts">
    import Container from "$lib/components/reusable/Container.svelte";
    import { goto } from "$app/navigation";
    import { routesState } from "$lib/states/RoutesState";
    import { page } from "$app/state";
    import { themeState } from "$lib/states/ThemeState";
    import { themeService } from "$lib/services/theme/theme.service";
    import { Sun, Moon } from "@lucide/svelte";

    let current = $state(page.url.pathname);
    $effect(() => {
        current = page.url.pathname;
    });
</script>

<Container
    class="h-16 flex items-center justify-center bg-base-200 rounded">
    <ul class="flex w-full h-full gap-0.5">
        {#each routesState.routes as route}
            <button
                onclick={() => goto(`${route.path}`)}
                class="btn aspect-square h-full btn-ghost rounded transition-colors duration-250 border-none"
                class:btn-primary={current === route.path}
                class:bg-base-100={current === route.path}
                aria-label={route.name}
                title={route.name}
            ><route.icon />
            </button>
        {/each}
    </ul>
    <button
        onclick={() => themeService.toggle()}
        class="btn btn-ghost btn-sm ml-2"
        aria-label={themeState.isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
        {#if themeState.isDark}
            <Sun size={16} />
        {:else}
            <Moon size={16} />
        {/if}
    </button>
</Container>
