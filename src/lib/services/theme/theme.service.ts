import { themeState } from '$lib/states/ThemeState.svelte';
import { tauriInvoke } from '$lib/services/tauri';

class ThemeService {
  private mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  async init() {
    const saved = await tauriInvoke<string>('get_setting', { key: 'theme' });
    if (saved === 'light' || saved === 'dark') {
      themeState.setTheme(saved);
    } else {
      themeState.setTheme(this.mediaQuery.matches ? 'dark' : 'light');
    }

    this.mediaQuery.addEventListener('change', (e) => {
      themeState.setTheme(e.matches ? 'dark' : 'light');
    });
  }

  async toggle() {
    themeState.toggleTheme();
    await tauriInvoke('set_setting', { key: 'theme', value: themeState.theme });
  }
}

export const themeService = new ThemeService();
