const express = require("express");

const app = express();

const http = require("http");

const server = http.createServer(app);

const port = 420;

const io = require("socket.io")(server);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/client/StartPage.html");
});
app.use(express.static(__dirname + "/client"));

server.listen(port, (error) => {
  if (error) {
    console.error("error: ", error);
  } else {
    console.log("server running on port: " + port);
  }
});

//component imports
const Player = require("./server/components/sprites").Sprite;
const Bomb = require("./server/components/sprites").Bomb;
const Explosion = require("./server/components/sprites").Explosion;

let SOCKET_LIST = []; //contains active connection
let PLAYER_LIST = []; //contains active player objects
let PLATFORM_LIST = require("./server/components/platforms").PLATFORM_LIST;
let BOMB_LIST = []; //contains active bombs
let EXPLOSION_LIST = []; //contains active bombs

//settings
let gravity = 0.6;
let bombGravity = 0.5;
let movementSpeed = 5.5;
let jumpPower = 16;

//user connect
io.on("connection", (socket) => {
  socket.id = Math.random();

  socket.emit("join-lobby", socket.id);
  console.log("\x1b[32m", "user connected: " + socket.id, "\x1b[0m");
  //store connection
  SOCKET_LIST[socket.id] = socket;

  socket.on("clientSelections", (username, team, role) => {
    //spawn player object
    let player = new Player({
      position: {
        x: 300,
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

    //store player object
    PLAYER_LIST[socket.id] = player;

    socket.emit("clientSelections", username, team, role);
    console.log("new player object spawned: ", PLAYER_LIST[socket.id]);
  });

  //user disconnect
  socket.on("disconnect", () => {
    delete SOCKET_LIST[socket.id];
    delete PLAYER_LIST[socket.id];
    console.log("\x1b[31m", "user disconnected: " + socket.id, "\x1b[0m");
  });

  //user keydown events
  socket.on("keydown", (event) => {
    let player = PLAYER_LIST[socket.id];
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
  });

  function detonateBomb(player) {
    console.log(player.dead);
  }

  //user keyup events
  socket.on("keyup", (event) => {
    let player = PLAYER_LIST[socket.id];
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
  });

  //user click
  socket.on("click", (click) => {
    console.log(click.x, click.y);
  });
});

function spawnBomb(player) {
  //determine throwing direction
  let throwingDirection;
  player.lastKey == "a" ? (throwingDirection = -6) : (throwingDirection = 5);

  //spawn bomb & store in bomb list
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

  BOMB_LIST.push({
    position: {
      x: bomb.position.x,
      y: bomb.position.y,
    },
    velocity: {
      x: bomb.velocity.x,
      y: bomb.velocity.y,
    },
    team: bomb.team,
    damage: bomb.damage,
  });
}

function spawnExplosion(bomb, radius) {
  let explosion = new Explosion({
    position: {
      x: bomb.position.x,
      y: bomb.position.y,
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

//gametick
function gametick() {
  let playerDataPacks = [];
  let bombDataPacks = [];
  let explosionDataPacks = [];

  //loop players
  for (let i in PLAYER_LIST) {
    let player = PLAYER_LIST[i];

    //player death
    if (player.dead) {
      player.isJumping = true;
      player.position.y = -1000;
      player.position.x = 512;
      player.health = player.maxHealth;
      player.dead = false;
    }

    //player physics
    player.position.x += player.velocity.x;
    player.position.y += player.velocity.y;
    player.velocity.x = 0;

    let playerFeetPos = player.position.y + player.height;

    //Platform collision
    for (let i in PLATFORM_LIST) {
      let platformXWidth = PLATFORM_LIST[i].position.x + PLATFORM_LIST[i].width;

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
      }

      //handle player walking off edge by setting isjumping to true if the player walks off or holds s
      if (
        (playerFeetPos >= PLATFORM_LIST[i].position.y &&
          !(playerFeetPos >= PLATFORM_LIST[i].position.y + PLATFORM_LIST[i].height) && //The is between the top and bottom of the platform
          (player.position.x + player.width / 2 <= PLATFORM_LIST[i].position.x || player.position.x + player.width / 2 >= platformXWidth) &&
          !player.isJumping) ||
        (player.pressingKey.s && !PLATFORM_LIST[i].unpassable && player.position.x + player.width / 2 >= PLATFORM_LIST[i].position.x && player.position.x + player.width / 2 <= platformXWidth && playerFeetPos == PLATFORM_LIST[i].position.y)
      ) {
        player.isJumping = true;
      }
    }

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

    //bomb collision
    for (let i in BOMB_LIST) {
      let bomb = BOMB_LIST[i];

      //console.log("player x: " + player.position.x + ", y: " + player.position.y);
      //console.log("bomb x: " + bomb.position.x + ", y: " + bomb.position.y);
      //player
      if (bomb.position.x >= player.position.x && bomb.position.x <= player.position.x + player.width && bomb.position.y >= player.position.y && bomb.position.y <= player.position.y + player.height && bomb.team != player.team) {
        console.log("HIT!");
        spawnExplosion(bomb, 100);
        player.health = player.health - bomb.damage;
        if (player.health <= 0) {
          //kill player
          player.dead = true;
          console.log(player.username + " has died");
        }

        BOMB_LIST.splice(i, 1);
      }

      //platform

      //delete on out screen
      if (bomb.position.x < -32 || bomb.position.x > 1024 || bomb.position.y > 576) {
        BOMB_LIST.splice(i, 1);
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
    });
  }

  //loop bombs
  for (let i in BOMB_LIST) {
    let bomb = BOMB_LIST[i];

    //bomb physics
    bomb.position.x += bomb.velocity.x;
    bomb.position.y += bomb.velocity.y;
    //bomb.velocity.x = 0;
    bomb.velocity.y += bombGravity;

    //update bomb data pack
    bombDataPacks.push({
      x: bomb.position.x,
      y: bomb.position.y,
      team: bomb.team,
    });
  }

  //loop explosions
  for (let i in EXPLOSION_LIST) {
    let explosion = EXPLOSION_LIST[i];
    explosion.fadeTime = explosion.fadeTime - 1;
    if (explosion.fadeTime <= 0) {
      EXPLOSION_LIST.splice(i, 1);
    }
    //console.log(explosion.fadeTime);

    //update bomb data pack
    explosionDataPacks.push({
      x: explosion.position.x,
      y: explosion.position.y,
      radius: explosion.radius,
    });
  }

  //emit player & bomb data packs to all socket connections
  for (let i in SOCKET_LIST) {
    let socket = SOCKET_LIST[i];
    socket.emit("playerState", playerDataPacks);
    socket.emit("bombState", bombDataPacks);
    socket.emit("explosionState", explosionDataPacks);
    //emit platform datapacks
    socket.emit("platform", PLATFORM_LIST);
  }
}

//allows us to get time from program start
//alternative to "window.performance.now" which is not available in server environment
const { PerformanceObserver, performance } = require("node:perf_hooks");

//get current time from program start
let msPrev = performance.now();

//set to desired fps
const fps = 60;

//calculate ms pr. frame
const msPerFrame = 1000 / fps;

function requestAnimationFrame(f) {
  setImmediate(() => f(Date.now()));
}

//animate gametick in chosen fps
function animate() {
  //request next frame, msPrev is now actually previous time
  requestAnimationFrame(animate);

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
