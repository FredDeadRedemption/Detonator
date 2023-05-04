const spriteHeight = 60;
const spriteWidth = 60;
const gameHealth = 100;

class Sprite {
  constructor({ position, velocity, username }) {
    this.position = position;
    this.velocity = velocity;
    this.width = spriteWidth;
    this.height = spriteHeight;
    this.lastKey;
    this.isAttacking;
    this.health = gameHealth;
    this.pressingKey = {
      a: false,
      d: false,
      space: false,
    };
    this.username = username;
    this.isJumping = false;
  }
}

exports.Sprite = Sprite;
