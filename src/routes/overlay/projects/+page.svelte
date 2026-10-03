<script lang="ts">
    import { page } from "$app/state";
    import Page from "$lib/components/reusable/Page.svelte";
    import Container from "$lib/components/reusable/Container.svelte";
    import ProjectStats from "$lib/components/overlay/ProjectStats.svelte";
    import RunningProjectsCards from "$lib/components/overlay/RunningProjectsCards.svelte";
    import ProjectSystem from "$lib/components/overlay/ProjectSystem.svelte"

</script>
<Page>
    <main class="w-full h-full flex flex-col gap-2">
        <section class="flex-3 h-full w-full">
            <ProjectSystem />
        </section>
        <div class="w-full h-fit gap-2 flex">
            <Container class="p-1">
                <ProjectStats
                  projectCount={0}
                  totalSizeBytes={0}
                />
            </Container>
            <Container class="h-full w-full flex flex-col items-center gap-2 p-1">
                <RunningProjectsCards
                  projects={[]}
                  maxRam={0}
                />
            </Container>
        </div>
    </main>
</Page>
