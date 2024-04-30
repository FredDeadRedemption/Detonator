const express = require("express");

const app = express();

const server = require("http").createServer(app);

const port = 420;

const io = require("socket.io")(server);

require("./server/gamelogic.js")(io); //pass io server to constructor func in gamelogic.js

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
