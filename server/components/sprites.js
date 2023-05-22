"use strict";

//player sprite
exports.Sprite = class Sprite {
  constructor({ position, velocity, username, team, role }) {
    this.position = position;
    this.velocity = velocity;
    this.width = 60;
    this.height = 60;
    this.lastKey = "a";
    this.maxHealth = 3;
    this.health = this.maxHealth;
    this.pressingKey = {
      a: false,
      d: false,
      space: false,
      s: false,
    };
    this.username = username;
    this.team = team;
    this.role = role;
    this.isJumping = true;
    this.dead = false;
    this.terminalVelocity = 6.5;
    this.hit = false;
    this.hitTimer = 60 * 1.5;
    this.hitFrames = this.hitTimer;
  }
};

//bomb sprite
exports.Bomb = class Bomb {
  constructor({ position, velocity, team }) {
    this.position = position;
    this.velocity = velocity;
    this.width = 70;
    this.height = 70;
    this.blastRadius = 250;
    this.team = team;
    this.damage = 1;
    this.timer = 450;
    this.isFlying = true;
    this.friction = 0.01;
  }
};

//explosion sprite
exports.Explosion = class Explosion {
  constructor({ position, radius }) {
    this.position = position;
    this.radius = radius;
    this.fadeTime = 20;
  }
};
