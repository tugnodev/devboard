<script>
    import { page } from "$app/state";
    import Container from "$lib/components/reusable/Container.svelte";

    const params = page.params;
    console.log(params);

</script>

<section>
<Container>
    <h1>Hello wrld</h1>
    <p>{params}</p>
</Container>
</section>
