"use strict";

//client socket
var socket = io();
export default socket;

//ctx
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;
canvas.middle = canvas.width / 2; //y axis middle

// animate background
ctx.fillRect(0, 0, canvas.width, canvas.width);

//test square
ctx.fillStyle = "blue";
ctx.fillRect(50, 50, 50, 50);

window.addEventListener("keydown", (event) => {
  //client keydown
  switch (event.key) {
    case "a":
      console.log(event.key);
      socket.emit("keydown", "a");
      break;
    case "d":
      socket.emit("keydown", "d");
      break;
    case " ":
      socket.emit("keydown", " ");
      break;
  }
});

window.addEventListener("keyup", (event) => {
  //client keyup
  switch (event.key) {
    case "a":
      socket.emit("keyup", "a");
      break;
    case "d":
      socket.emit("keyup", "d");
      break;
  }
});

canvas.addEventListener("click", (event) => {
  //client click
  let click = {
    x: event.pageX,
    y: event.pageY,
  };
  socket.emit("click", click);
});

socket.on("playerState", (playerData) => {
  ctx.fillStyle = "red";

  ctx.fillRect(playerData.x, playerData.y, 50, 50);

  console.log("yeehaw");
});

function animate(data) {
  ctx.fillStyle = "red";
  ctx.fillRect(data.x, data.y, 50, 50);
}
