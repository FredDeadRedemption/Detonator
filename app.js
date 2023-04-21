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

var SOCKET_LIST = [];
var userNameList = [];
let i = 0;


const { usernameIsInvalid } = require("./server/components/username");

//user connect
io.on("connection", (socket) => {
  i++;
  socket.id = Math.random();
  
  console.log("\x1b[32m", "user connected: " + socket.id, "\x1b[0m");
  socket.x = 150;
  socket.y = 150;
  socket.username = undefined;
  SOCKET_LIST[socket.id] = socket;

  
  //join lobby
  socket.on("join-lobby", (userId) => {
    socket.broadcast.emit("user-connected", userId);
  });

  //recieve & emit message
  socket.on("usernameSelect", (userName) => {
    if (usernameIsInvalid(userName, SOCKET_LIST) && SOCKET_LIST.length < 5) {
      userNameList.push(userName);
      SOCKET_LIST[socket.id].username = userName;
      //socket.userName = userName;

      console.log(userNameList);
      for(let i in socket.id) {
        console.log(SOCKET_LIST[i].username);
      }
      io.emit("user-count", userNameList.length);
      console.log("user count" + userNameList.length);
    }
    
    console.log("username: " + userName);
    
    io.emit("usernameSelect", SOCKET_LIST.username);
  });
 

  //dev log
  /*
  socket.onAny((event, args) => {
    console.log(event, args);
  });
  */

  //user disconnect
  socket.on("disconnect", () => {
    //console.log(SOCKET_LIST);
    //SOCKET_LIST.splice(socket.userName);
    //console.log(SOCKET_LIST);
    i--;
    console.log("Username was deleted" + SOCKET_LIST[socket.id]);
    delete SOCKET_LIST[socket.id];
    console.log("Username was deleted" + SOCKET_LIST[socket.id]);
    console.log("\x1b[31m", "user disconnected: " + socket.id, "\x1b[0m");
  });

  //user keydown
  socket.on("keydown", (event) => {
    switch (event) {
      case "a":
        console.log("key: a");
        break;
      case "d":
        console.log("key: d");
        break;
      case " ":
        console.log("key: space");
        /*
        if (socket.position.y > 450) {
          socket.velocity.y = -15;
        }
        */
        break;
    }
  });

  //user keyup
  socket.on("keyup", (event) => {
    switch (event.key) {
      case "a":
        break;
      case "d":
        break;
    }
  });

  //user click
  socket.on("click", (click) => {
    console.log(click.x, click.y);
  });
});

//emit playerstate
setInterval(() => {
  var playerDataPacks = [];
  for (let i in SOCKET_LIST) {
    var socket = SOCKET_LIST[i];
    socket.x++;
    socket.y++;
    playerDataPacks.push({
      x: socket.x,
      y: socket.y,
    });
  }

  for (let i in SOCKET_LIST) {
    let socket = SOCKET_LIST[i];
    socket.emit("playerState", playerDataPacks);
  }
}, 1000 / 25); //25 fps
