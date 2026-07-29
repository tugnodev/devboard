<script lang="ts">
    import { page } from "$app/state";
    import Page from "$lib/components/reusable/Page.svelte";

    let route = page.url.pathname;
</script>
<Page>
    <div class="w-full h-full min-h-full bg-red-500">
        <h1 class="text-2xl" >{route}</h1>
    </div>
</Page>
