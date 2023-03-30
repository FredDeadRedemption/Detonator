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
app.use("/client", express.static(__dirname + "/client"));

//user connect
io.on("connection", (socket) => {
  console.log("user connected: " + socket.id);

  //user disconnect
  socket.on("disconnect", () => {
    console.log("user disconnected: " + socket.id);
  });
});

server.listen(port, (error) => {
  if (error) {
    console.error("error: ", error);
  } else {
    console.log("server running on port: " + port);
  }
});
