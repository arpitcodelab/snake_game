/**
 * Particle represents a gentle fruit splash droplet or floating score indicator.
 */
export class Particle {
  constructor(x, y, vx, vy, color, size, maxLife, type = 'drop') {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.size = size;
    this.maxLife = maxLife;
    this.life = maxLife;
    this.type = type; // 'drop', 'text'
    this.text = '';
    this.alpha = 1.0;
  }

  update(deltaSec) {
    this.life -= deltaSec;
    if (this.life < 0) this.life = 0;
    this.alpha = Math.max(0, this.life / this.maxLife);

    if (this.type === 'text') {
      this.y += this.vy * deltaSec;
      this.x += this.vx * deltaSec;
      this.vy *= 0.94;
    } else {
      this.x += this.vx * deltaSec;
      this.y += this.vy * deltaSec;
      this.vy += 120 * deltaSec; // gentle gravity for juice drops
      this.vx *= 0.94;
      this.vy *= 0.94;
    }
  }

  draw(ctx) {
    if (this.alpha <= 0) return;

    ctx.save();
    ctx.globalAlpha = this.alpha;

    if (this.type === 'text') {
      ctx.font = '800 16px "Nunito", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(this.text, this.x, this.y);
    } else {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, Math.max(0.5, this.size * this.alpha), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  get isDead() {
    return this.life <= 0;
  }
}
