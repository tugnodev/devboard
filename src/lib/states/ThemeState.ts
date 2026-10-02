class ThemeState {
  private _state = $state({
    theme: 'light' as 'light' | 'dark',
    systemTheme: 'light' as 'light' | 'dark'
  });

  get theme() { return this._state.theme; }
  get systemTheme() { return this._state.systemTheme; }
  get isDark() { return this._state.theme === 'dark'; }

  toggleTheme() {
    this._state.theme = this._state.theme === 'light' ? 'dark' : 'light';
    this._applyTheme();
  }

  setTheme(theme: 'light' | 'dark') {
    this._state.theme = theme;
    this._applyTheme();
  }

  private _applyTheme() {
    document.documentElement.dataset.theme = this._state.theme;
  }
}

export const themeState = new ThemeState();
