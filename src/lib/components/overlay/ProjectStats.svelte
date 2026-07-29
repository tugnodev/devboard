<script lang="ts">
  /**
   * Composant "stats" horizontal (daisyUI) pour Svelte 5.
   * Vue d'ensemble des projets détectés sur le disque / dans un workspace.
   *
   * Props :
   * - projectCount    : nombre de projets détectés
   * - maxSizeBytes    : taille (en octets) du plus gros projet
   * - totalSizeBytes  : taille cumulée de tous les projets (octets)
   * - locations       : liste des chemins où les projets ont été trouvés
   * - lastScanDate    : Date (ou timestamp) de la dernière analyse
   * - scanDurationMs  : durée de la dernière analyse, en ms
   */
  let {
    projectCount = 0,
    maxSizeBytes = 0,
    totalSizeBytes = 0,
    locations = [],
    lastScanDate = null,
    scanDurationMs = null
  } = $props();

  // Affichage/masquage de la liste des emplacements
  let showLocations = $state(false);

  function formatBytes(bytes: number) {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let value = bytes;
    let i = 0;
    while (value >= 1024 && i < units.length - 1) {
      value /= 1024;
      i++;
    }
    return `${value.toFixed(i > 0 && value < 10 ? 1 : 0)} ${units[i]}`;
  }

  function formatDuration(ms: number | null) {
    if (ms == null) return '—';
    if (ms < 1000) return `${ms} ms`;
    return `${(ms / 1000).toFixed(1)} s`;
  }

  function formatRelativeTime(date: Date | number | string | null) {
    if (!date) return 'jamais';
    const d = date instanceof Date ? date : new Date(date);
    const diffSec = Math.round((Date.now() - d.getTime()) / 1000);
    if (diffSec < 60) return "à l'instant";
    const diffMin = Math.round(diffSec / 60);
    if (diffMin < 60) return `il y a ${diffMin} min`;
    const diffH = Math.round(diffMin / 60);
    if (diffH < 24) return `il y a ${diffH} h`;
    const diffJ = Math.round(diffH / 24);
    return `il y a ${diffJ} j`;
  }

  let maxSizeLabel = $derived(formatBytes(maxSizeBytes));
  let totalSizeLabel = $derived(formatBytes(totalSizeBytes));
  let avgSizeLabel = $derived(
    formatBytes(projectCount > 0 ? totalSizeBytes / projectCount : 0)
  );
  let lastScanLabel = $derived(formatRelativeTime(lastScanDate));
  let scanDurationLabel = $derived(formatDuration(scanDurationMs));
</script>

<div class="stats stats-vertical lg:stats-horizontal shadow w-full overflow-x-auto">
  <!-- Nombre de projets -->
  <div class="stat place-items-center">
    <div class="stat-figure text-primary">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9.75h16.5M3.75 9.75v9a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-9M3.75 9.75l1.5-4.5h13.5l1.5 4.5" />
      </svg>
    </div>
    <div class="stat-title">Projets</div>
    <div class="stat-value text-primary">{projectCount}</div>
    <div class="stat-desc">détectés</div>
  </div>

  <!-- Taille totale -->
  <div class="stat place-items-center">
    <div class="stat-figure text-accent">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 3.75c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
      </svg>
    </div>
    <div class="stat-title">Taille totale</div>
    <div class="stat-value text-accent">{totalSizeLabel}</div>
    <div class="stat-desc">tous projets confondus</div>
  </div>

  <!-- Taille moyenne -->
  <div class="stat place-items-center">
    <div class="stat-title">Taille moyenne</div>
    <div class="stat-value">{avgSizeLabel}</div>
    <div class="stat-desc">par projet</div>
  </div>

  <!-- Taille max -->
  <div class="stat place-items-center">
    <div class="stat-title">Taille max</div>
    <div class="stat-value text-secondary">{maxSizeLabel}</div>
    <div class="stat-desc">plus gros projet</div>
  </div>

  <!-- Dernière analyse -->
  <div class="stat place-items-center">
    <div class="stat-title">Dernière analyse</div>
    <div class="stat-value text-sm">{lastScanLabel}</div>
    <div class="stat-desc">durée : {scanDurationLabel}</div>
  </div>
</div>
