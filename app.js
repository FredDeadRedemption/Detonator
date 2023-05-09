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

const Player = require("./server/components/sprites").Sprite;
const Platform = require("./server/components/sprites").Platform;
const Bomb = require("./server/components/sprites").Bomb;
const randomColor = require("./server/components/util").randomColor;

let SOCKET_LIST = []; //contains active connection
let PLAYER_LIST = []; //contains active player objects
let PLATFORM_LIST = [];
let BOMB_LIST = []; //contains active bombs

//settings
let gravity = 0.6;
let bombGravity = 0.5;
let movementSpeed = 5.5;
let jumpPower = 16;

//spawn platform objects
let platform = [];
    //Floor
platform[0] = new Platform({
  position: {
    x: -100, //100 pixels off screen to avoid falling off
    y: 566,
  },
  height: 700,
  width: 1224, //100 pixels off screen to avoid falling off
  color: "rgb(255, 255, 255)"
});
platform[0].unpassable = true;
    //Platform 1
platform[1] = new Platform({
  position: {
    x: 250,
    y: 400,
  },
  height: 30,
  width: 200,
  color: randomColor()
});
    //Platform 2
platform[2] = new Platform({
  position: {
    x: 450,
    y: 200,
  },
  height: 30,
  width: 400,
  color: randomColor()
});
    //Platform 3
platform[3] = new Platform({
  position: {
    x: 100,
    y: 100,
  },
  height: 30,
  width: 150,
  color: randomColor()
});

for(let i in platform) {
  PLATFORM_LIST.push({
    x: platform[i].position.x,
    y: platform[i].position.y,
    height: platform[i].height,
    width: platform[i].width,
    color: platform[i].color,
    unpassable: platform[i].unpassable,
  });
}

//user connect
io.on("connection", (socket) => {
  socket.id = Math.random();

  socket.emit("join-lobby", socket.id);
  console.log("\x1b[32m", "user connected: " + socket.id, "\x1b[0m");
  //store connection
  SOCKET_LIST[socket.id] = socket;

  socket.on("usernameSelect", (username) => {
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
    });

    //store player object
    PLAYER_LIST[socket.id] = player;

    socket.emit("usernameSelect", username);
    console.log("new player object spawned: ", PLAYER_LIST[socket.id]);
  });

  //user disconnect
  socket.on("disconnect", () => {
    delete SOCKET_LIST[socket.id];
    delete PLAYER_LIST[socket.id];
    console.log("\x1b[31m", "user disconnected: " + socket.id, "\x1b[0m");
  });

  //user keydown
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
        spawnBomb(player);
    }
  });

  //user keyup
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
  BOMB_LIST.push({
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
}

//gametick
setInterval(() => {
  let playerDataPacks = [];
  let bombDataPacks = [];

  //loop players
  for (let i in PLAYER_LIST) {
    let player = PLAYER_LIST[i];

    //player physics
    player.position.x += player.velocity.x;
    player.position.y += player.velocity.y;
    player.velocity.x = 0;

    let playerFeetPos = player.position.y + player.height;

    //Platform collision
    for (let i in PLATFORM_LIST) {
      let platformXWidth = PLATFORM_LIST[i].x + PLATFORM_LIST[i].width;

      //handle player collission with platform while falling (isJumping = true and velocity y > 0) and not holding s
      if (
        playerFeetPos >= PLATFORM_LIST[i].y &&
        !(playerFeetPos >= PLATFORM_LIST[i].y + PLATFORM_LIST[i].height) &&
        player.position.x + player.width / 2 >= PLATFORM_LIST[i].x &&
        player.position.x + player.width / 2 <= platformXWidth &&
        player.isJumping &&
        player.velocity.y > 0 &&
        ((!player.pressingKey.s && !PLATFORM_LIST[i].unpassable) || PLATFORM_LIST[i].unpassable)
      ) {
        console.log("collision: " + PLATFORM_LIST[i].unpassable);
        player.velocity.y = 0;
        player.position.y = PLATFORM_LIST[i].y - player.height;
        player.isJumping = false;
      }

      //handle player walking off edge by setting isjumping to true if the player walks off or holds s
      if (
        (playerFeetPos >= PLATFORM_LIST[i].y &&
          !(playerFeetPos >= PLATFORM_LIST[i].y + PLATFORM_LIST[i].height) && //The is between the top and bottom of the platform
          (player.position.x + player.width / 2 <= PLATFORM_LIST[i].x || player.position.x + player.width / 2 >= platformXWidth) &&
          !player.isJumping) ||
        (
          player.pressingKey.s && 
          !PLATFORM_LIST[i].unpassable &&
          (player.position.x + player.width / 2 >= PLATFORM_LIST[i].x && player.position.x + player.width / 2 <= platformXWidth) &&
          playerFeetPos == PLATFORM_LIST[i].y
        )
      ) {   
        player.isJumping = true;
        console.log("fall through: " + PLATFORM_LIST[i].unpassable);
      }
    }

    //player jumping physics
    if (player.isJumping) {
      player.velocity.y += gravity;
    }

    //player left/right movement
    if (player.pressingKey.a && player.position.x + player.width / 2 >= 0) {
      player.velocity.x = -movementSpeed;
    } else if (player.pressingKey.d && player.position.x + player.width / 2 <= 1024) {
      player.velocity.x = movementSpeed;
    }

    //update player data pack
    playerDataPacks.push({
      x: player.position.x,
      y: player.position.y,
      pressingKey: {
        a: player.pressingKey.a,
        d: player.pressingKey.d,
      },
      imageSrc: player.imageSrc,
      username: player.username,
      isJumping: player.isJumping,
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
    });
  }

  //emit player & bomb data packs to all socket connections
  for (let i in SOCKET_LIST) {
    let socket = SOCKET_LIST[i];
    socket.emit("playerState", playerDataPacks);
    socket.emit("bombState", bombDataPacks);
    //emit platform datapacks
    socket.emit("platform", PLATFORM_LIST);
  }
}, 1000 / 156); //~64ms tick
