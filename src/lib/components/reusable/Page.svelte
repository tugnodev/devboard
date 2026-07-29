<script lang="ts">
    import { blur, fly, slide, scale, fade } from "svelte/transition";
    import type { Snippet } from "svelte";
    import { cn } from "$lib/utils/cn";
    import type { ClassNameValue } from "tailwind-merge";

    let { children, class: className }: { children: Snippet; class?: ClassNameValue } = $props();

</script>
<section
    data-sveltekit-preload-code
    in:scale={{duration: 300, delay: 300}}
    out:scale={{duration: 300}}
    class={cn("w-full max-w-full h-full", className)}>
    {@render children()}
</section>
