//component imports
const Player = require("./components/sprites").Sprite;
const Bomb = require("./components/sprites").Bomb;
const Explosion = require("./components/sprites").Explosion;
const PLATFORM_LIST = require("./components/platforms").PLATFORM_LIST;
const dist = require("./components/util").distanceformula;

//dynamic lists
let SOCKET_LIST = []; //contains active connection
let PLAYER_LIST = []; //contains active player objects
let BOMB_LIST = []; //contains active bombs
let EXPLOSION_LIST = []; //contains active explosions

//settings
let gravity = 0.6;
let bombGravity = 0.5;
let movementSpeed = 5.5;
let throwingSpeed = 6.2;
let jumpPower = 16;

//win condition
let winCondition = 10;
let redScore = 0;
let blueScore = 0;
let winner = undefined;

//datapacks
let scoreDataPack = [];
let playerDataPacks = [];
let bombDataPacks = [];
let explosionDataPacks = [];

//suck it io
module.exports = (io) => {
  io.on("connection", (socket) => {
    socket.id = Math.random(); //reject characters, embrace integers.

    console.log("\x1b[32m", "user connected: " + socket.id, "\x1b[0m"); //notify server
    //store client connection
    SOCKET_LIST[socket.id] = socket;

    socket.on("clientSelections", (username, team, role) => {
      //spawn player object
      let player = new Player({
        position: {
          x: 512,
          y: 175,
        },
        velocity: {
          x: 0,
          y: 0,
        },
        username: username,
        team: team,
        role: role,
      });

      if (player.team == "red") player.position.x -= 400;
      if (player.team == "blue") player.position.x += 400;

      //store player object
      PLAYER_LIST[socket.id] = player;

      //sent data back to client to render
      socket.emit("clientSelections", username, team, role);

      //DEBUG
      console.log("new player object spawned: ", PLAYER_LIST[socket.id]);
    });

    //delete user data on disconnect
    socket.on("disconnect", () => {
      delete SOCKET_LIST[socket.id];
      delete PLAYER_LIST[socket.id];
      console.log("\x1b[31m", "user disconnected: " + socket.id, "\x1b[0m");
    });

    //user keydown events
    socket.on("keydown", (event) => {
      let player = PLAYER_LIST[socket.id];
      if ((player != undefined) && (!player.dead)) {
        switch (event) {
          case "a":
            player.pressingKey.a = true;
            player.lastKey = "a";
            break;
          case "d":
            player.pressingKey.d = true;
            player.lastKey = "d";
            break;
          case " ":
            if (!player.isJumping) {
              player.velocity.y = -jumpPower;
              player.isJumping = true;
            }
            break;
          case "s":
            player.pressingKey.s = true;
            break;
          case "k":
            player.role === "bomber" ? spawnBomb(player) : detonateBomb(player);
            break;
        }
      }
    });

    //user keyup events
    socket.on("keyup", (event) => {
      let player = PLAYER_LIST[socket.id];
      if (player != undefined) {
        switch (event) {
          case "a":
            player.pressingKey.a = false;
            break;
          case "d":
            player.pressingKey.d = false;
            break;
          case "s":
            player.pressingKey.s = false;
            break;
        }
      }
    });
  });
};

function spawnBomb(player) {
  //determine throwing direction
  let throwingDirection;
  player.lastKey === "a" ? (throwingDirection = -throwingSpeed) : (throwingDirection = throwingSpeed);

  //spawn bomb
  let bomb = new Bomb({
    position: {
      x: player.position.x,
      y: player.position.y,
    },
    velocity: {
      x: throwingDirection,
      y: -12,
    },
    team: player.team,
  });
  //store in bomb list
  BOMB_LIST.push({
    position: {
      x: bomb.position.x,
      y: bomb.position.y,
    },
    velocity: {
      x: bomb.velocity.x,
      y: bomb.velocity.y,
    },
    height: bomb.height,
    width: bomb.width,
    team: bomb.team,
    damage: bomb.damage,
    timer: bomb.timer,
    isFlying: bomb.isFlying,
    friction: bomb.friction,
    blastRadius: bomb.blastRadius,
  });
}

function detonateBomb(detonator) {
  //loop all bombs
  for (let i in BOMB_LIST) {
    let bomb = BOMB_LIST[i];

    //identify first bomb belonging to team
    if (bomb.team === detonator.team) {
      spawnExplosion(bomb, bomb.blastRadius);

      //hit req for all players
      for (let i in PLAYER_LIST) {
        let player = PLAYER_LIST[i];

        //in blast range
        if (dist(player, bomb) < bomb.blastRadius / 2 && !player.invincible) {
          //hit
          player.health = player.health - bomb.damage;

          if (player.health <= 0) {
            //kill player
            player.dead = true;
            console.log(player.username + " has died");
            if (player.team == "red") {
              blueScore++;
            } else if (player.team == "blue") {
              redScore++;
            }
            win();
            player.makeInvincible(4500);
          } else {
            player.makeInvincible(1500);
          }
          console.log("bomb was a hit and exploded");
        }
      }
      delete BOMB_LIST[i];
      break;
    }
  }
}

function spawnExplosion(bomb, radius) {
  //boom!
  let explosion = new Explosion({
    position: {
      x: bomb.position.x + bomb.width / 2,
      y: bomb.position.y + bomb.height / 2,
    },
    radius: radius,
  });
  EXPLOSION_LIST.push({
    position: {
      x: explosion.position.x - radius / 2,
      y: explosion.position.y - radius / 2,
    },
    radius: explosion.radius,
    fadeTime: explosion.fadeTime,
  });
}

function respawnAllPlayers() {
  for (i in PLAYER_LIST) {
    PLAYER_LIST[i].dead = true;
  }
}

function clearBombs() {
  for (i in BOMB_LIST) {
    delete BOMB_LIST[i];
  }
}

function reset() {
  respawnAllPlayers();
  clearBombs();
  setTimeout(function() {
    scoreDataPack = ({
      winner: undefined,
      redScore: 0,
      blueScore: 0,
    });
  }, 3000);
}

function win() {
  //Win condition
  if (redScore >= winCondition || blueScore >= winCondition) {
    if (redScore >= winCondition) {
      winner = "red";
    } else if (blueScore >= winCondition) {
      winner = "blue";
    }
    reset();
  }

  scoreDataPack = ({
    winner: winner,
    redScore: redScore,
    blueScore: blueScore,
  });
}

//call win to update score datapack
win();


//gametick
function gametick() {
  //loop players
  for (let i in PLAYER_LIST) {
    let player = PLAYER_LIST[i];

    //player respawn
    if (player.dead && player.health != player.maxHealth) {
      player.isJumping = true;
      player.position.y = -1000;
      player.position.x = 512;
      player.health = player.maxHealth;
      if (player.team == "red") player.position.x -= 400;
      if (player.team == "blue") player.position.x += 400;
    }

    //player physics
    player.position.x += player.velocity.x;
    player.position.y += player.velocity.y;
    player.velocity.x = 0;

    //player jumping physics
    if (player.isJumping && player.velocity.y <= player.terminalVelocity) {
      player.velocity.y += gravity;
    }

    //player left/right movement
    if (player.pressingKey.a && player.position.x + player.width / 2 >= 0) {
      player.velocity.x = -movementSpeed;
    } else if (player.pressingKey.d && player.position.x + player.width / 2 <= 1024) {
      player.velocity.x = movementSpeed;
    }

    //player / platform collision
    for (let i in PLATFORM_LIST) {
      let platformXWidth = PLATFORM_LIST[i].position.x + PLATFORM_LIST[i].width;
      let playerFeetPos = player.position.y + player.height;

      //handle player collission with platform while falling (isJumping = true and velocity y > 0) and not holding s
      if (
        playerFeetPos >= PLATFORM_LIST[i].position.y &&
        !(playerFeetPos >= PLATFORM_LIST[i].position.y + PLATFORM_LIST[i].height) &&
        player.position.x + player.width / 2 >= PLATFORM_LIST[i].position.x &&
        player.position.x + player.width / 2 <= platformXWidth &&
        player.isJumping &&
        player.velocity.y > 0 &&
        ((!player.pressingKey.s && !PLATFORM_LIST[i].unpassable) || PLATFORM_LIST[i].unpassable)
      ) {
        player.velocity.y = 0;
        player.position.y = PLATFORM_LIST[i].position.y - player.height;
        player.isJumping = false;
        //player can move after dead, until platform collision
        if(player.dead) {
          player.dead = false;
        }
      }

      //handle player walking off edge by setting isjumping to true if the player walks off or holds s
      if (
        (playerFeetPos == PLATFORM_LIST[i].position.y &&
          (player.position.x + player.width / 2 <= PLATFORM_LIST[i].position.x || player.position.x + player.width / 2 >= platformXWidth) &&
          player.position.x + player.width / 2 >= PLATFORM_LIST[i].position.x - movementSpeed &&
          player.position.x + player.width / 2 <= platformXWidth + movementSpeed &&
          !player.isJumping) ||
        (
          player.pressingKey.s && 
          !PLATFORM_LIST[i].unpassable && 
          player.position.x + player.width / 2 >= PLATFORM_LIST[i].position.x &&
          player.position.x + player.width / 2 <= platformXWidth && 
          playerFeetPos == PLATFORM_LIST[i].position.y
        )
      ) {
        player.isJumping = true;
      }
    }

    //update player data pack
    playerDataPacks.push({
      x: player.position.x,
      y: player.position.y,
      pressingKey: {
        a: player.pressingKey.a,
        d: player.pressingKey.d,
      },
      username: player.username,
      isJumping: player.isJumping,
      team: player.team,
      maxHealth: player.maxHealth,
      health: player.health,
      invincible: player.invincible,
      role: player.role,
    });
  }

  //loop bombs
  for (let i in BOMB_LIST) {
    let bomb = BOMB_LIST[i];

    //bomb physics
    bomb.position.x += bomb.velocity.x;
    bomb.position.y += bomb.velocity.y;
    if (bomb.isFlying) {
      bomb.velocity.y += bombGravity;
    }

    //bomb friction
    if (bomb.velocity.x > 0) {
      bomb.velocity.x -= bomb.friction;
    } else if (bomb.velocity.x < 0) {
      bomb.velocity.x += bomb.friction;
    }

    //stop bomb
    if (
      bomb.velocity.x < bomb.friction && 
      bomb.velocity.x > -bomb.friction
        ) {
      bomb.velocity.x = 0;
    }

    //bombs bouncing off walls
    if ((bomb.position.x < 15 - bomb.width / 2 && bomb.velocity.x < 0) || (bomb.position.x > 1024 - bomb.width / 2 && bomb.velocity.x > 0)) {
      bomb.velocity.x = -bomb.velocity.x * 1.2; //lil xtra bounce
    }

    //despawn bomb after 450 ticks
    bomb.timer--;
    if (bomb.timer < 0) {
      delete BOMB_LIST[i];
    }

    //bomb platform collision
    for (i in PLATFORM_LIST) {
      bombFeetPos = bomb.position.y + bomb.height * 0.733; //ratio to avoid floating bomb (sprite has empty space)
      platform = PLATFORM_LIST[i];
      platformWidth = platform.position.x + platform.width;
      if (
        bombFeetPos >= platform.position.y &&
        !(bombFeetPos >= platform.position.y + platform.height) &&
        bomb.position.x + bomb.width / 2 >= platform.position.x &&
        bomb.position.x + bomb.width / 2 <= platformWidth &&
        bomb.velocity.y > 0 &&
        bomb.isFlying
      ) {
        bomb.velocity.y = 0;
        bomb.isFlying = false;
        bomb.position.y = platform.position.y - bomb.height * 0.733; //ratio to avoid floating bomb (sprite has empty space)
      }

      if (
        bomb.position.y == platform.position.y - bomb.height * 0.733 &&
        (bomb.position.x + bomb.width / 2 <= platform.position.x || bomb.position.x + bomb.width / 2 >= platformWidth) &&
        bomb.position.x + bomb.width / 2 >= platform.position.x - 20 &&
        bomb.position.x + bomb.width / 2 <= platformWidth + 20 && //avoids confusion when multiple platforms share same y level space
        !bomb.isFlying
      ) {
        bomb.isFlying = true;
      }
    }

    //update bomb data pack
    bombDataPacks.push({
      x: bomb.position.x,
      y: bomb.position.y,
      velocityX: bomb.velocity.x,
      team: bomb.team,
      timer: bomb.timer,
    });
  }

  //loop explosions
  for (let i in EXPLOSION_LIST) {
    let explosion = EXPLOSION_LIST[i];
    explosion.fadeTime--;
    if (explosion.fadeTime <= 0) {
      delete EXPLOSION_LIST[i];
    }

    //update explosion data pack
    explosionDataPacks.push({
      x: explosion.position.x,
      y: explosion.position.y,
      radius: explosion.radius,
    });
  }

  //emit player, platform and bomb data packs to all socket connections & reset datapacks
  for (let i in SOCKET_LIST) {
    let socket = SOCKET_LIST[i];
    socket.emit("playerState", playerDataPacks);
    socket.emit("bombState", bombDataPacks);
    socket.emit("explosionState", explosionDataPacks);
    socket.emit("platform", PLATFORM_LIST);
    socket.emit("scoreState", scoreDataPack);
  }
  playerDataPacks = [];
  bombDataPacks = [];
  explosionDataPacks = [];
} //gametick end

//performance town!!!
//allows us to get time from program start
//alternative to "window.performance.now" which is not available in server environment
const performance = require("perf_hooks").performance;

//get current time from program start
let msPrev = performance.now();

//set to desired fps
const fps = 60;

//calculate ms pr. frame
const msPerFrame = 1000 / fps;

//animate gametick in chosen fps
function animate() {
  //request next frame, msPrev is now actually previous time
  setImmediate(animate);

  //get current time from program start
  const msNow = performance.now();

  //time passed between current frame and previous frame
  const msPassed = msNow - msPrev;

  //execute gametick if enough time passed to match desired fps and subtract excess time, otherwise return
  if (msPassed < msPerFrame) {
    return;
  } else {
    const excessTime = msPassed % msPerFrame;
    msPrev = msNow - excessTime;
    gametick();
  }
}

animate();
