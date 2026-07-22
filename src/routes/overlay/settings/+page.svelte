<script lang="ts">
    import { fade, fly } from "svelte/transition";
    import { page } from "$app/state";
    import Page from "$lib/components/reusable/Page.svelte";

    let route = page.url.pathname;
</script>
<Page>
    <h1 class="text-2xl" >{route}</h1>
</Page>
