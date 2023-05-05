const express = require("express");

const app = express();

const http = require("http");
const { Platform } = require("./server/components/platform");

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

const Player = require("./server/components/sprite").Sprite;
const randomColor = require("./server/components/util").randomColor;

let SOCKET_LIST = []; //contains current connection
let PLAYER_LIST = []; //contains current player objects
let PLATFORM_LIST = [];

//settings
let gravity = 0.6;
let movementSpeed = 5.5;
let jumpPower = 16;


//spawn platform objects
let floor = new Platform({
  position: {
    x: -100, //100 pixels off screen to avoid falling off
    y: 566
  },
  height: 700,
  width: 1224, //100 pixels off screen to avoid falling off
  color: "rgb(50,105,50)"
});
PLATFORM_LIST.push({
  x: floor.position.x,
  y: floor.position.y,
  height: floor.height,
  width: floor.width,
  color: floor.color,
  unpassable: true,
});
let platform1 = new Platform({
  position: {
    x: 250,
    y: 400
  },
  height: 30,
  width: 200,
  color: "rgb(255,0,0)"
});
PLATFORM_LIST.push({
  x: platform1.position.x,
  y: platform1.position.y,
  height: platform1.height,
  width: platform1.width,
  color: platform1.color,
});
let platform2 = new Platform({
  position: {
    x: 450,
    y: 200
  },
  height: 30,
  width: 400,
  color: "rgb(0,0,255)"
});
PLATFORM_LIST.push({
  x: platform2.position.x,
  y: platform2.position.y,
  height: platform2.height,
  width: platform2.width,
  color: platform2.color,
});
let platform3 = new Platform({
  position: {
    x: 100,
    y: 100
  },
  height: 30,
  width: 150,
  color: "rgb(0,255,0)"
});
PLATFORM_LIST.push({
  x: platform3.position.x,
  y: platform3.position.y,
  height: platform3.height,
  width: platform3.width,
  color: platform3.color,
});


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
        break;
      case "d":
        player.pressingKey.d = true;
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

//gametick
setInterval(() => {
  let playerDataPacks = [];

  //loop players
  for (let i in PLAYER_LIST) {
    let player = PLAYER_LIST[i];

    //player physics
    player.position.x += player.velocity.x;
    player.position.y += player.velocity.y;
    player.velocity.x = 0;


    let playerFeetPos = player.position.y + player.height;

    //player jumping physics
       //Platform collision
      for(let i in PLATFORM_LIST) {
        let platformXWidth = PLATFORM_LIST[i].x + PLATFORM_LIST[i].width;
        
        //handle player collission with platform while falling (isJumping = true and velocity y > 0) and not holding s
        if (
          playerFeetPos >= PLATFORM_LIST[i].y && 
          !(playerFeetPos >= PLATFORM_LIST[i].y + PLATFORM_LIST[i].height) && 
          (player.position.x+(player.width/2) >= PLATFORM_LIST[i].x && 
          player.position.x+(player.width/2) <= platformXWidth) &&
          player.isJumping &&
          player.velocity.y > 0 &&
          (!player.pressingKey.s && !PLATFORM_LIST[i].unpassable || PLATFORM_LIST[i].unpassable)
        ) {
          player.velocity.y = 0;
          player.position.y = PLATFORM_LIST[i].y - player.height
          player.isJumping = false;
        }

        //handle player walking off edge
        if ((playerFeetPos >= PLATFORM_LIST[i].y && !(playerFeetPos >= PLATFORM_LIST[i].y + PLATFORM_LIST[i].height)&& 
          (player.position.x+(player.width/2) <= PLATFORM_LIST[i].x || player.position.x+(player.width/2) >= platformXWidth) &&
          !player.isJumping) || 
          (player.pressingKey.s && !PLATFORM_LIST[i].unpassable)
          ) {
            player.isJumping = true;
          }
      }
      if (player.isJumping) {
        player.velocity.y += gravity;
      }
    

    //player left/right movement
    if (player.pressingKey.a && player.position.x+(player.width/2) >= 0) {
      player.velocity.x = -movementSpeed;
    } else if (player.pressingKey.d && player.position.x+(player.width/2) <= 1024) {
      player.velocity.x = movementSpeed;
    }

    //player datapack
    playerDataPacks.push({
      x: player.position.x,
      y: player.position.y,
      pressingKey: {
        a: player.pressingKey.a,
        d: player.pressingKey.d,
      },
      imageSrc: player.imageSrc,
      username: player.username,
      isJumping: player.isJumping
    });
  }

  //emit player data packs
  for (let i in SOCKET_LIST) {
    let socket = SOCKET_LIST[i];
    socket.emit("playerState", playerDataPacks);
    //emit platform datapacks
    socket.emit("platform", PLATFORM_LIST);
    
  }

  
}, 1000 / 156); //~64ms tick
