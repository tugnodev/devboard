<script lang="ts">
    import Page from "$lib/components/reusable/Page.svelte";
    import { invoke } from "@tauri-apps/api/core";
    import { cpuInfosState } from "$lib/states/device";
    import type { cpuInfos } from "$lib/dtos/device";
    import { onMount } from "svelte";
    import { appState } from "$lib/states/appState";


    let { children } = $props();

</script>

<Page >
    <section class="w-full flex">
        {@render children()}
    </section>
</Page>
