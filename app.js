const express = require("express");

const app = express();

const server = require("http").createServer(app);

const port = 4200;

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/client/index.html");
});
app.use("/client", express.static(__dirname + "/client"));

server.listen(port, (error) => {
  if (error) {
    console.error("error: ", error);
  } else {
    console.log("server running on port: " + port);
  }
});

const io = require("socket.io")(server, {});

io.on("connection", (socket) => {
  console.log("user connected: " + socket.id);
});
