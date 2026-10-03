<script>
    let { children } = $props();
    import "../app.css";

</script>

<main
    class="w-full h-screen bg-base-200/10 backdrop-blur-2xl no-scrollbar overflow-hidden"
>
    {@render children()}
</main>
