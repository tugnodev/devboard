<script lang="ts">
	import { page } from "$app/state";
	import Container from "$lib/components/reusable/Container.svelte";

	const id = page.params.slug;
	const path = page.url.searchParams.get("path") ?? "";
</script>

<section>
	<Container>
		<h1 class="text-2xl font-semibold">Project Detail</h1>
		<div class="flex flex-col gap-2 mt-4">
			<span class="text-sm text-base-content/60">ID: <span class="font-mono">{id}</span></span>
			<span class="text-sm text-base-content/60">Path: <span class="font-mono">{path}</span></span>
		</div>
	</Container>
</section>
