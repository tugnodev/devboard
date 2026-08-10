<script lang="ts">
    import Page from "$lib/components/reusable/Page.svelte";
    import Container from "$lib/components/reusable/Container.svelte";
    import MainCpuMonitor from "$lib/components/overlay/chart/MainCpuMonitor.svelte";
    import MemoryChart from "$lib/components/overlay/chart/MemoryChart.svelte";
    import NetworkChart from "$lib/components/overlay/chart/NetworkChart.svelte";
    import DisksArc from "$lib/components/overlay/chart/DisksArc.svelte";
    import Pagination from "$lib/components/overlay/Pagination.svelte";
</script>
<Page>
    <main class="h-full max-h-screen overflow-auto flex flex-col gap-2">
        <div class="grid grid-cols-4 gap-2 w-full">
            <Container class="">
                <MainCpuMonitor />
            </Container>
            <Container>
                <MemoryChart />
            </Container>
            <Container class="">
                <NetworkChart />
            </Container>
            <Container class="">
                <DisksArc />
            </Container>
        </div>
        <div class="grid grid-cols-1 h-full grid-rows-1 overflow-hidden rounded flex-1">
            <Container class="w-full h-full overflow-hidden p-4">
                <Pagination />
            </Container>
        </div>
    </main>
</Page>
