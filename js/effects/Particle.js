/**
 * Particle represents a single physics-driven visual particle
 */
export class Particle {
  constructor(x, y, color, options = {}) {
    this.x = x;
    this.y = y;
    this.color = color || '#ffd700';

    const speed = options.speed !== undefined ? options.speed : (Math.random() * 90 + 30);
    const angle = options.angle !== undefined ? options.angle : (Math.random() * Math.PI * 2);

    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    this.radius = options.radius || (Math.random() * 3 + 2);
    this.alpha = 1.0;
    this.decay = options.decay || (Math.random() * 1.5 + 1.2); // Alphas per second
    this.gravity = options.gravity !== undefined ? options.gravity : 120; // Px per second^2
    this.friction = 0.96;
  }

  update(dt) {
    this.vy += this.gravity * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    this.vx *= Math.pow(this.friction, dt * 60);
    this.vy *= Math.pow(this.friction, dt * 60);

    this.alpha -= this.decay * dt;
    this.radius = Math.max(0, this.radius - dt * 1.2);
  }

  isAlive() {
    return this.alpha > 0 && this.radius > 0.2;
  }

  draw(ctx) {
    if (!this.isAlive()) return;

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, this.alpha));
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/**
 * FloatingText represents a rising floating score indicator (+1, +3, +10)
 */
export class FloatingText {
  constructor(text, x, y, color = '#ffd700', fontSize = 18) {
    this.text = text;
    this.x = x;
    this.y = y;
    this.color = color;
    this.fontSize = fontSize;

    this.vy = -55; // Floats upward at 55px/s
    this.alpha = 1.0;
    this.decay = 1.1; // Fades in ~0.9s
  }

  update(dt) {
    this.y += this.vy * dt;
    this.alpha -= this.decay * dt;
  }

  isAlive() {
    return this.alpha > 0;
  }

  draw(ctx) {
    if (!this.isAlive()) return;

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, this.alpha));
    ctx.font = `900 ${this.fontSize}px 'Outfit', 'Nunito', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Text shadow / outline for crisp readability
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.lineWidth = 3;
    ctx.strokeText(this.text, this.x, this.y);

    ctx.fillStyle = this.color;
    ctx.fillText(this.text, this.x, this.y);

    ctx.restore();
  }
}
