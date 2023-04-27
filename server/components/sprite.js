const spriteHeight = 50;
const spriteWidth = 50;
const gameHealth = 100;

class Sprite {
  constructor({ position, velocity, color, username }) {
    this.position = position;
    this.velocity = velocity;
    this.color = color;
    this.width = spriteWidth;
    this.height = spriteHeight;
    this.imageSrc;
    this.lastKey;
    this.isAttacking;
    this.health = gameHealth;
    this.pressingKey = {
      a: false,
      d: false,
      space: false,
    };
    this.username = username;
  }
}

exports.Sprite = Sprite;
