<script>
    import { onMount } from "svelte";
    let { children } = $props();
    import "../app.css";

    import { invoke } from "@tauri-apps/api/core";
    onMount(async () => {

    });
</script>

<main
    class="w-full h-screen no-scrollbar flex flex-col items-center justify-start overflow-hidden"
>
    {@render children()}
</main>
