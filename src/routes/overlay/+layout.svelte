<script lang="ts">
    import { fly } from "svelte/transition";
    import { backIn, backOut } from "svelte/easing";
    import { appState } from "$lib/states/AppState";
    import { invoke } from "@tauri-apps/api/core";
    import TopBar from "$lib/components/overlay/TopBar.svelte";
    import { onMount, onDestroy } from "svelte";
    let { children } = $props();
    import { initTauriBridge } from "$lib/services/bridge";

    let cleanup: (() => void) | undefined;
    let monitoringStarted = false;

    onMount(() => {
        if (monitoringStarted) return;
        monitoringStarted = true;
        appState.showOverlay();
        appState.setActive(true);
        invoke("start_monitoring").catch((err) => console.error("Failed to start monitoring:", err));
        initTauriBridge().then((unlisten) => {
            cleanup = unlisten;
        });
    });

    onDestroy(() => {
        cleanup?.();
        if (!monitoringStarted) return;
        monitoringStarted = false;
        appState.setActive(false);
        invoke("stop_monitoring").catch((err) => console.error("Failed to stop monitoring:", err));
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
    onclick={() => appState.hideOverlay()}
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
