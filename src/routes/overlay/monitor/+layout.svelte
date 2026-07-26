<script lang="ts">
    import Page from "$lib/components/reusable/Page.svelte";

    let { children } = $props();
</script>

<Page >
    <section class="w-full flex">
        {@render children()}
    </section>
</Page>
