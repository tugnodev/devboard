<script lang="ts">
    import { page } from "$app/state";
    import Page from "$lib/components/reusable/Page.svelte";
    import Container from "$lib/components/reusable/Container.svelte";
    import ProjectStats from "$lib/components/overlay/ProjectStats.svelte";
    import RunningProjectsCards from "$lib/components/overlay/RunningProjectsCards.svelte";

</script>
<Page>
    <main class="w-full h-full flex flex-col gap-2">
        <section class="flex-3 h-full w-full">
            <Container class="w-full h-full">hello wrld</Container>
        </section>
        <div class="w-full h-fit gap-2 grid grid-cols-2">
            <Container class="grid-1 p-1">
                <ProjectStats
                  projectCount={12}
                  totalSizeBytes={2_400_000_000}
                  maxSizeBytes={487_000_000}
                  locations={['/home/user/projects/app-a', '/srv/data/legacy-proj']}
                  lastScanDate={new Date()}
                  scanDurationMs={842}
                />
            </Container>
            <Container class="h-full flex flex-col items-center gap-2 p-1">
                <RunningProjectsCards
                  projects={[]}
                  maxRam={1024}
                />
            </Container>
        </div>
    </main>
</Page>
