const express = require("express");

const app = express();

const http = require("http");

const server = http.createServer(app);

const port = 420;

const io = require("socket.io")(server);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/client/index.html");
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
const randomColor = require("./server/components/rngcolor").randomColor;

var SOCKET_LIST = [];
var PLAYER_LIST = [];

//settings
let gravity = 0.6;
let movementSpeed = 8;
let jumpPower = 18;

//user connect
io.on("connection", (socket) => {
  socket.id = Math.random();
  console.log("\x1b[32m", "user connected: " + socket.id, "\x1b[0m");
  SOCKET_LIST[socket.id] = socket;

  let player = new Player({
    id: socket.id,
    position: {
      x: 300,
      y: 175,
    },
    velocity: {
      x: 0,
      y: 5,
    },
    color: randomColor(),
  });

  PLAYER_LIST[socket.id] = player;

  console.log("new player object spawned: ", PLAYER_LIST[socket.id]);

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
        player.velocity.x = -movementSpeed;
        break;
      case "d":
        player.velocity.x = movementSpeed;
        break;
      case " ":
        if (player.position.y > 520) {
          player.velocity.y = -jumpPower;
        }
        break;
    }
  });

  //user keyup
  socket.on("keyup", (event) => {
    let player = PLAYER_LIST[socket.id];
    switch (event.key) {
      case "a":
        console.log("ye");
        player.velocity.x = 0;
        break;
      case "d":
        player.velocity.x = 0;
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

    if (player.position.y + player.height + player.velocity.y >= 576) {
      player.velocity.y = 0;
    } else player.velocity.y += gravity;

    //player datapack
    playerDataPacks.push({
      x: player.position.x,
      y: player.position.y,
      color: player.color,
    });
  }

  //emit player data packs
  for (let i in SOCKET_LIST) {
    let socket = SOCKET_LIST[i];
    socket.emit("playerState", playerDataPacks);
  }
}, 1000 / 156); //~64ms tick
