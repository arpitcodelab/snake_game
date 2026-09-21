import { bus } from '../core/EventBus.js';

/**
 * SkinSystem manages unlockable snake skins and milestone progression
 */
export class SkinSystem {
  constructor() {
    this.skins = {
      classic: {
        id: 'classic',
        name: 'Emerald 3D Serpent',
        crest: '#bbf7d0',
        head: '#22c55e',
        headDark: '#14532d',
        body: '#16a34a',
        bodyDark: '#15803d',
        contour: '#052e16',
        spine: '#4ade80',
        eye: '#052e16',
        eyeWhite: '#ffffff',
        tongue: '#ef4444',
        milestone: 0,
        description: 'Glossy 3D emerald snake from snqke.png'
      },
      neon: {
        id: 'neon',
        name: 'Cyber Cobalt',
        crest: '#a5f3fc',
        head: '#00f2fe',
        headDark: '#0072ff',
        body: '#00c6ff',
        bodyDark: '#004db3',
        contour: '#0369a1',
        spine: '#00f2fe',
        eye: '#00f2fe',
        eyeWhite: '#ffffff',
        tongue: '#00f2fe',
        milestone: 25,
        description: 'High-tech cyber cobalt skin'
      },
      forest: {
        id: 'forest',
        name: 'Jungle Viper',
        crest: '#86efac',
        head: '#7bc67e',
        headDark: '#166534',
        body: '#4caf50',
        bodyDark: '#1e3a1e',
        contour: '#14532d',
        spine: '#86efac',
        eye: '#0d1a10',
        eyeWhite: '#ffeaa7',
        tongue: '#ef4444',
        milestone: 50,
        description: 'Unlocked at 50 total planets'
      },
      fire: {
        id: 'fire',
        name: 'Solar Plasma',
        crest: '#fde047',
        head: '#ff4757',
        headDark: '#991b1b',
        body: '#ffa502',
        bodyDark: '#c2410c',
        contour: '#7f1d1d',
        spine: '#fbbf24',
        eye: '#ffffff',
        eyeWhite: '#ffffff',
        tongue: '#f59e0b',
        milestone: 100,
        description: 'Unlocked at 100 total planets'
      },
      ice: {
        id: 'ice',
        name: 'Frost Comet',
        crest: '#e0f2fe',
        head: '#70a1ff',
        headDark: '#1e3a8a',
        body: '#38bdf8',
        bodyDark: '#0369a1',
        contour: '#0c4a6e',
        spine: '#bae6fd',
        eye: '#38bdf8',
        eyeWhite: '#ffffff',
        tongue: '#38bdf8',
        milestone: 150,
        description: 'Unlocked at 150 total planets'
      },
      gold: {
        id: 'gold',
        name: 'Cosmic Pulsar',
        crest: '#fef08a',
        head: '#ffd700',
        headDark: '#854d0e',
        body: '#eccc68',
        bodyDark: '#a16207',
        contour: '#713f12',
        spine: '#fde047',
        eye: '#000000',
        eyeWhite: '#ffffff',
        tongue: '#ffd700',
        milestone: 250,
        description: 'Unlocked at 250 total planets'
      }
    };

    this.activeSkinId = 'classic';
    this.totalFruits = 0;
    this.unlocked = ['classic'];

    this.load();
    this.setupListeners();
  }

  load() {
    try {
      if (typeof localStorage !== 'undefined') {
        this.totalFruits = parseInt(localStorage.getItem('snake_total_fruits') || '0', 10);
        const savedUnlocked = localStorage.getItem('snake_unlocked_skins');
        if (savedUnlocked) {
          this.unlocked = JSON.parse(savedUnlocked);
        }
        this.activeSkinId = localStorage.getItem('snake_selected_skin') || 'classic';
      }
    } catch (e) {
      console.warn('Could not load skin state:', e);
    }

    this.checkMilestones();
  }

  save() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('snake_total_fruits', this.totalFruits.toString());
        localStorage.setItem('snake_unlocked_skins', JSON.stringify(this.unlocked));
        localStorage.setItem('snake_selected_skin', this.activeSkinId);
      }
    } catch (e) {
      console.warn('Could not save skin state:', e);
    }
  }

  setupListeners() {
    bus.on('food:eaten', () => {
      this.totalFruits++;
      this.checkMilestones();
      this.save();
    });
  }

  checkMilestones() {
    for (const [id, skin] of Object.entries(this.skins)) {
      if (!this.unlocked.includes(id) && this.totalFruits >= skin.milestone) {
        this.unlocked.push(id);
        bus.emit('skin:unlocked', skin);
        console.log(`🎉 New skin unlocked: ${skin.name}!`);
      }
    }
  }

  isUnlocked(skinId) {
    return this.unlocked.includes(skinId);
  }

  selectSkin(skinId) {
    if (this.skins[skinId] && this.isUnlocked(skinId)) {
      this.activeSkinId = skinId;
      this.save();
      bus.emit('skin:changed', this.skins[skinId]);
      return true;
    }
    return false;
  }

  getActiveSkin() {
    return this.skins[this.activeSkinId] || this.skins.classic;
  }

  getAll() {
    return Object.values(this.skins).map(s => ({
      ...s,
      isUnlocked: this.isUnlocked(s.id)
    }));
  }
}

