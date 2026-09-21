import { bus } from '../core/EventBus.js';

/**
 * SkinSystem manages unlockable snake skins and milestone progression
 */
export class SkinSystem {
  constructor() {
    this.skins = {
      classic: {
        id: 'classic',
        name: 'Emerald Classic',
        head: '#4ecca3',
        body: '#45b28e',
        eye: '#12131a',
        eyeWhite: '#ffffff',
        milestone: 0,
        description: 'Default classic snake skin'
      },
      neon: {
        id: 'neon',
        name: 'Cyber Neon',
        head: '#00ffff',
        body: '#ff007f',
        eye: '#ffffff',
        eyeWhite: '#00ffff',
        milestone: 25,
        description: 'Unlocked at 25 total fruits'
      },
      forest: {
        id: 'forest',
        name: 'Jungle Viper',
        head: '#7bc67e',
        body: '#4caf50',
        eye: '#0d1a10',
        eyeWhite: '#ffeaa7',
        milestone: 50,
        description: 'Unlocked at 50 total fruits'
      },
      fire: {
        id: 'fire',
        name: 'Inferno Flame',
        head: '#ff4757',
        body: '#ffa502',
        eye: '#2f3542',
        eyeWhite: '#ffffff',
        milestone: 100,
        description: 'Unlocked at 100 total fruits'
      },
      ice: {
        id: 'ice',
        name: 'Frost Wyrm',
        head: '#70a1ff',
        body: '#2ed573',
        eye: '#1e3799',
        eyeWhite: '#ffffff',
        milestone: 150,
        description: 'Unlocked at 150 total fruits'
      },
      gold: {
        id: 'gold',
        name: 'Midas Gold',
        head: '#ffd700',
        body: '#eccc68',
        eye: '#000000',
        eyeWhite: '#ffffff',
        milestone: 250,
        description: 'Unlocked at 250 total fruits'
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

