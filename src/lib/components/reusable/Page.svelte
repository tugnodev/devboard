<script lang="ts">
    import { blur, fly } from "svelte/transition";
    import type { Snippet } from "svelte";
    import { cn } from "$lib/utils/cn";
    import type { ClassNameValue } from "tailwind-merge";

    let { children, class: className }: { children: Snippet; class?: ClassNameValue } = $props();

</script>
<section
    data-sveltekit-preload-code
    in:blur={{duration: 250, delay: 250}}
    out:blur={{duration: 250}}
    class={cn("w-full max-w-full h-screen", className)}>
    {@render children()}
</section>
