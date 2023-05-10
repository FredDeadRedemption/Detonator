"use strict";

//player sprite
exports.Sprite = class Sprite {
  constructor({ position, velocity, username, team, role }) {
    this.position = position;
    this.velocity = velocity;
    this.width = 60;
    this.height = 60;
    this.lastKey = "a";
    this.isAttacking;
    this.maxHealth = 100;
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
  }
};

//bomb sprite
exports.Bomb = class Bomb {
  constructor({ position, velocity, team }) {
    this.position = position;
    this.velocity = velocity;
    this.width = 27; //9*3 from its sprites pixels
    this.height = 27;
    this.blastRadius = {
      height: 300,
      width: 300,
    };
    this.team = team;
    this.damage = 25;
    this.timer = 450;
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
