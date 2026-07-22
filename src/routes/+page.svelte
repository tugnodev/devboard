<script lang="ts">
    import { invoke } from "@tauri-apps/api/core";
    import { Webview } from "@tauri-apps/api/webview";
    import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
    import { Window } from "@tauri-apps/api/window"
    import { onDestroy, onMount } from "svelte";

</script>

<main class="w-full no-select max-w-8xl h-full flex flex-col overflow-hidden">
    <div class="w-full h-full flex gap-2 flex-col items-center justify-center">
        <h1 class="text-4xl">Welcome to DC</h1>
    </div>
</main>
