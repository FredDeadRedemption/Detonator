const spriteHeight = 50;
const spriteWidth = 50;
const gameHealth = 100;
const gravity = 15;

class Sprite {
  constructor({ id, position, velocity, color }) {
    this.id = id;
    this.position = position;
    this.velocity = velocity;
    this.color = color;
    this.width = spriteWidth;
    this.height = spriteHeight;
    this.imageSrc;
    this.lastKey;
    this.isAttacking;
    this.health = gameHealth;
  }

  draw() {
    ctx.fillstyle = this.team;
    ctx.fillrect(this.position.x, this.position.y, this.width, this.height);
  }

  /*
  draw() {
    ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
  }
  */

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
