<script lang="ts">
    import { fly } from "svelte/transition";
    import { backIn, backOut } from "svelte/easing";
    import { appState } from "$lib/states/AppState";
    import { monitorService } from "$lib/services/monitor/monitor.service";
    import { themeService } from "$lib/services/theme/theme.service";
    import TopBar from "$lib/components/overlay/TopBar.svelte";
    import { onMount, onDestroy } from "svelte";
    let { children } = $props();

    onMount(() => {
        appState.showOverlay();
        monitorService.start();
        themeService.init();
    });

    onDestroy(() => {
        monitorService.stop();
        appState.hideOverlay();
    });
</script>

<div
    role="button"
    tabindex="0"
    aria-label="overlay"
    onkeydown={(e) => {
        if (e.key === "Escape") {
            appState.hideOverlay();
        }
    }}
    class="w-full h-screen max-h-screen">
    {#if appState.overlayVisible}
    <section class="flex flex-col h-full gap-2 p-2 w-full overflow-hidden">
        <header
            in:fly={{ y: -100, duration: 300, easing: backIn, delay: 50 }}
            out:fly={{ y: -100, duration: 300, delay: 0, easing: backOut }}
            class="w-full flex items-center justify-center">
                <TopBar />
        </header>
        <section
            in:fly={{ duration: 300, y: 1000, easing: backIn, delay: 50 }}
            out:fly={{ y: 1000, duration: 300, easing: backOut }}
            class="flex h-full w-full">
            {@render children()}
        </section>
    </section>
    {:else}
    <div class="w-full h-screen">
    </div>
    {/if}
</div>
