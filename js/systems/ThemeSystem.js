import { bus } from '../core/EventBus.js';

/**
 * ThemeSystem manages board color themes and synchronization with the canvas grid
 */
export class ThemeSystem {
  constructor(renderer) {
    this.renderer = renderer;
    this.themes = {
      desert: {
        id: 'desert',
        name: 'Desert Gold (Google Snake)',
        header: '#53461c',
        border: '#ab4e30',
        bg1: '#fed049',
        bg2: '#f5c338',
        line: 'rgba(0, 0, 0, 0)'
      },
      classic: {
        id: 'classic',
        name: 'Classic Green (Google Snake)',
        header: '#4a752c',
        border: '#578a34',
        bg1: '#aad751',
        bg2: '#a2d149',
        line: 'rgba(0, 0, 0, 0)'
      },
      dark: {
        id: 'dark',
        name: 'AMOLED Black',
        header: '#111116',
        border: '#1e1e24',
        bg1: '#14141a',
        bg2: '#0d0d12',
        line: 'rgba(255, 255, 255, 0.02)'
      },
      forest: {
        id: 'forest',
        name: 'Forest Jungle',
        header: '#152618',
        border: '#1f3d23',
        bg1: '#244a29',
        bg2: '#1a361e',
        line: 'rgba(100, 220, 100, 0.04)'
      },
      space: {
        id: 'space',
        name: 'Cosmic Space',
        header: '#101026',
        border: '#1b1b42',
        bg1: '#212154',
        bg2: '#17173b',
        line: 'rgba(160, 140, 255, 0.05)'
      },
      ocean: {
        id: 'ocean',
        name: 'Deep Ocean',
        header: '#0a2238',
        border: '#103557',
        bg1: '#124673',
        bg2: '#0d3457',
        line: 'rgba(0, 210, 211, 0.04)'
      }
    };

    this.activeTheme = 'desert';
    this.load();
  }

  load() {
    let saved = 'desert';
    try {
      if (typeof localStorage !== 'undefined') {
        saved = localStorage.getItem('snake_selected_theme') || 'desert';
      }
    } catch (e) {
      console.warn('Could not load theme from storage:', e);
    }
    this.applyTheme(saved);
  }

  applyTheme(themeId) {
    const theme = this.themes[themeId] || this.themes.desert;
    this.activeTheme = theme.id;

    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme.id);
      document.documentElement.style.setProperty('--header-bg', theme.header);
      document.documentElement.style.setProperty('--border-bg', theme.border);
      document.documentElement.style.setProperty('--board-bg-1', theme.bg1);
      document.documentElement.style.setProperty('--board-bg-2', theme.bg2);
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('snake_selected_theme', theme.id);
    }

    // Update GridRenderer colors
    if (this.renderer && this.renderer.gridRenderer) {
      this.renderer.gridRenderer.setThemeColors(theme.bg2, theme.bg1, theme.line, theme.border);
    }

    bus.emit('theme:changed', theme);
  }

  getAll() {
    return Object.values(this.themes);
  }
}
