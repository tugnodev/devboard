<script>
    let { children } = $props();
    import "../app.css";

</script>

<main
    class="w-full h-screen no-scrollbar flex flex-col items-center justify-start overflow-hidden"
>
    {@render children()}
</main>
