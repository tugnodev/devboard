<script>
    let { children } = $props();
    import "../app.css";

</script>

<main
    class="w-full h-screen no-scrollbar overflow-hidden"
>
    {@render children()}
</main>
