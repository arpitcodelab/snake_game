/**
 * 2D Vector mathematics helper for grid positions
 */
export class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = Math.round(x);
    this.y = Math.round(y);
  }

  set(x, y) {
    this.x = Math.round(x);
    this.y = Math.round(y);
    return this;
  }

  add(v) {
    return new Vector2(this.x + v.x, this.y + v.y);
  }

  subtract(v) {
    return new Vector2(this.x - v.x, this.y - v.y);
  }

  equals(v) {
    return v && this.x === v.x && this.y === v.y;
  }

  clone() {
    return new Vector2(this.x, this.y);
  }
}
