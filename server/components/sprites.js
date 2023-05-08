"use strict";

//player sprite
exports.Sprite = class Sprite {
  constructor({ position, velocity, username }) {
    this.position = position;
    this.velocity = velocity;
    this.width = 60;
    this.height = 60;
    this.lastKey;
    this.isAttacking;
    this.health = 100;
    this.pressingKey = {
      a: false,
      d: false,
      space: false,
      s: false,
    };
    this.username = username;
    this.isJumping = true;
  }
};

//platform sprite
exports.Platform = class Platform {
  constructor({ position, height, width, color }) {
    this.position = position;
    this.height = height;
    this.width = width;
    this.color = color;
    this.unpassable = false;
  }
};

//bomb sprite
exports.Bomb = class Bomb {
  constructor({ position, velocity, team }) {
    this.position = position;
    this.velocity = velocity;
    this.blastRadius = {
      height: 200,
      width: 200,
    };
    this.team = team;
  }
};
