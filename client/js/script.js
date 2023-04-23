"use strict";
//ctx
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;
canvas.middle = canvas.width / 2; //y axis middle

//client socket
var socket = io();
export default socket;

//initial background animation
ctx.fillRect(0, 0, canvas.width, canvas.width);

window.addEventListener("keydown", (event) => {
  //client keydown
  switch (event.key) {
    case "a":
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

//game tick
socket.on("playerState", (playerData) => {
  //render background
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.width);

  //render playerdata
  for (let i = 0; i < playerData.length; i++) {
    ctx.fillStyle = playerData[i].color;
    ctx.fillRect(playerData[i].x, playerData[i].y, 50, 50);
  }
});
