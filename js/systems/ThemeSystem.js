import { bus } from '../core/EventBus.js';

/**
 * ThemeSystem manages board color themes and synchronization with the canvas grid
 */
export class ThemeSystem {
  constructor(renderer) {
    this.renderer = renderer;
    this.themes = {
      classic: {
        id: 'classic',
        name: 'Classic Dark',
        bg1: '#1a1b26',
        bg2: '#161720',
        line: 'rgba(255, 255, 255, 0.03)'
      },
      dark: {
        id: 'dark',
        name: 'AMOLED Black',
        bg1: '#0e0e12',
        bg2: '#08080a',
        line: 'rgba(255, 255, 255, 0.02)'
      },
      forest: {
        id: 'forest',
        name: 'Forest Jungle',
        bg1: '#152618',
        bg2: '#101e13',
        line: 'rgba(100, 220, 100, 0.04)'
      },
      space: {
        id: 'space',
        name: 'Cosmic Space',
        bg1: '#101026',
        bg2: '#0b0b1a',
        line: 'rgba(160, 140, 255, 0.05)'
      },
      retro: {
        id: 'retro',
        name: 'Retro Amber CRT',
        bg1: '#20170a',
        bg2: '#181106',
        line: 'rgba(255, 190, 118, 0.06)'
      },
      ocean: {
        id: 'ocean',
        name: 'Deep Ocean',
        bg1: '#0a2238',
        bg2: '#07192b',
        line: 'rgba(0, 210, 211, 0.04)'
      }
    };

    this.activeTheme = 'classic';
    this.load();
  }

  load() {
    let saved = 'classic';
    try {
      if (typeof localStorage !== 'undefined') {
        saved = localStorage.getItem('snake_selected_theme') || 'classic';
      }
    } catch (e) {
      console.warn('Could not load theme from storage:', e);
    }
    this.applyTheme(saved);
  }

  applyTheme(themeId) {
    const theme = this.themes[themeId] || this.themes.classic;
    this.activeTheme = theme.id;

    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme.id);
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('snake_selected_theme', theme.id);
    }

    // Update GridRenderer colors
    if (this.renderer && this.renderer.gridRenderer) {
      this.renderer.gridRenderer.setThemeColors(theme.bg2, theme.bg1, theme.line);
    }

    bus.emit('theme:changed', theme);
  }

  getAll() {
    return Object.values(this.themes);
  }
}

