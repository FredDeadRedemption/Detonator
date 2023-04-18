const spriteHeight = 300;
const spriteWidth = 150;
const gameHealth = 1000;
const gravity = 15;

class Sprite {
  constructor({ position, velocity, team, imageSrc }) {
    this.position = position;
    this.velocity = velocity;
    this.team = team;
    this.width = spriteWidth;
    this.height = spriteHeight;
    this.image = new Image();
    this.image.src = imageSrc;
    this.lastKey;
    this.isAttacking;
    this.health = gameHealth;
  }

  draw() {
    ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
  }

  update() {
    this.draw();

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.position.y + this.height + this.velocity.y >= canvas.height) {
      this.velocity.y = 0;
    } else this.velocity.y += gravity;
  }
}

exports.Sprite = Sprite;
