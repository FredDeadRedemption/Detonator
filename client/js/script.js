"use strict";
//ctx
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const lobby = document.querySelector(".lobbyContainer");

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

  //render platform

  //render playerdata
  for (let i = 0; i < playerData.length; i++) {
    ctx.fillStyle = playerData[i].color;
    ctx.fillRect(playerData[i].x, playerData[i].y, 50, 50);
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.fillText(playerData[i].username,playerData[i].x+(25-(playerData[i].username.length)*3), playerData[i].y-20);

    //Usernames in lobby
    //usernameList.textContent = playerData[i].username;
    const node = document.createElement("li");
    let usernameText = document.createTextNode(playerData[i].username);
    node.appendChild(usernameText);
    //let usernameText = document.createElement(playerData[i].username);
    lobby.appendChild(node);
  }
  


});
