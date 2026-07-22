<script lang="ts">
    import { fly } from "svelte/transition";
    import { bounceOut } from "svelte/easing";
    import { appState } from "$lib/states/appState";
    import TopBar from "$lib/components/overlay/TopBar.svelte";
    import { onMount } from "svelte";
    let { children } = $props();
    import { initTauriBridge } from "$lib/services/bridge";
    import { invoke } from "@tauri-apps/api/core";
    import type { cpuInfos } from "$lib/dtos/device";
    import { cpuInfosState } from "$lib/states/device";


    async () => {

    }

    onMount(async () => {
      await initTauriBridge();
    });
</script>

<div
    role="button"
    tabindex="0"
    aria-label="overlay"
    onkeydown={(e) => {
        if (e.key === "Escape") {
            $appState.overlayVisible = false;
        }
    }}
    onclick={() => $appState.overlayVisible = false}
    class="w-full h-screen p-4">
    {#if $appState.overlayVisible}
    <section class="flex flex-col gap-2 h-full w-full overflow-hidden">
        <header
            in:fly={{ y: -100, duration: 300, easing: bounceOut, delay: 5 }}
            out:fly={{ y: -100, duration: 300, delay: 0 }}
            class="w-full h-24 flex items-center justify-center">
                <TopBar />
        </header>
        <section
            in:fly={{ duration: 300, y: 700 }}
            out:fly={{ y: 700, duration: 300, delay: 0 }}
            class="flex justify-between h-full w-full">
            {@render children()}
        </section>
    </section>
    {:else}
    <div class="w-full h-screen "></div>
    {/if}
</div>
