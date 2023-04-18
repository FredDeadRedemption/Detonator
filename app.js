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

const Sprite = require("./server/sprite.js");

var USER_LIST = [];
var player = undefined;

const { usernameIsInvalid } = require("./server/components/username");

const keys = {
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
  space: {
    pressed: false,
  },
};

//user connect
io.on("connection", (socket) => {
  console.log("\x1b[32m", "user connected: " + socket.id, "\x1b[0m");

  //recieve & emit message
  socket.on("usernameSelect", (userName) => {
    if (usernameIsInvalid(userName, USER_LIST)) {
      USER_LIST.push(userName);
      socket.userName = userName;
      socket.sprite = new Sprite({
        position: {
          x: 250,
          y: 180,
        },
        velocity: {
          x: 0,
          y: 5,
        },
      });
    }

    console.table(USER_LIST);
    console.log("username: " + userName);
    io.emit("usernameSelect", userName);
  });

  //dev log
  /*
  socket.onAny((event, args) => {
    console.log(event, args);
  });
  */

  //user disconnect
  socket.on("disconnect", () => {
    USER_LIST.splice(socket.userName);
    console.log("\x1b[31m", "user disconnected: " + socket.id, "\x1b[0m");
  });

  //user keydown
  socket.on("keydown", (event) => {
    switch (event) {
      case "a":
        keys.a.pressed = true;
        console.log("key: a");
        break;
      case "d":
        keys.d.pressed = true;
        console.log("key: d");
        break;
      case " ":
        if (player.position.y > 450) {
          player.velocity.y = -15;
        }
        break;
    }
  });

  //user keyup
  socket.on("keyup", (event) => {
    switch (event.key) {
      case "a":
        keys.a.pressed = false;
        break;
      case "d":
        keys.d.pressed = false;
        break;
    }
  });

  //user click
  socket.on("click", (click) => {
    console.log(click.x, click.y);
  });
});

setInterval(() => {
  io.emit("playerState", player);
}, 1000 / 25); //25 fps
