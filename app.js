const express = require("express");

const app = express();

const http = require("http");

const server = http.createServer(app);

const port = 420;

const { Server } = require("socket.io");

const io = new Server(server);

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

//user connect
io.on("connection", (socket) => {
  console.log("\x1b[32m", "user connected: " + socket.id, "\x1b[0m");

  //recieve message from user
  socket.on("chat message", (msg) => {
    console.log("message: " + msg);
  });

  //user disconnect
  socket.on("disconnect", () => {
    console.log("\x1b[31m", "user disconnected: " + socket.id, "\x1b[0m");
  });
});
