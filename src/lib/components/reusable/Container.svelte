<script lang="ts">
let { children, class: className } : {children: Snippet, class?: ClassNameValue} = $props()
import { cn } from "$lib/utils/cn";
    import type { Snippet } from "svelte";
    import type { ClassNameValue } from "tailwind-merge";
</script>

<div
    role="button"
    onkeydown={(e) => {
        //e.stopPropagation();
    }}
    tabindex="0"
    aria-label="Top Bar"
    onclick={(e) => {
        e.stopPropagation();
    }}
    class={`${cn(`bg-base-100 border border-base-300 rounded`, className)}`}>
        {@render children()}
</div>
