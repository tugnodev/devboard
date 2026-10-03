<script lang="ts">
let { children, class: className } : {children: Snippet, class?: ClassNameValue} = $props()
import { cn } from "$lib/utils/cn";
    import type { Snippet } from "svelte";
    import type { ClassNameValue } from "tailwind-merge";
</script>

<div
    class={`${cn(`bg-base-100 border border-base-300 rounded no-select no-scrollbar`, className)}`}>
        {@render children()}
</div>
