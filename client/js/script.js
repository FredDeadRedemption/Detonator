"use strict";
//ctx
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const lobby = document.querySelector(".lobbyContainer");

canvas.width = 1024;
canvas.height = 576;
canvas.middle = canvas.width / 2; //y axis middle
ctx.font = "25px Verdana";
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = "high";

//client socket
var socket = io();
export default socket;

//initial background animation
ctx.fillRect(0, 0, canvas.width, canvas.width);

let game = {
  isRunning: false,
  start() {
    this.isRunning = true;
  },
};

socket.on("usernameSelect", () => {
  console.log("username has been selected. Starting game..");
  game.start();
});

window.addEventListener("keydown", (event) => {
  //client keydown
  if (game.isRunning) {
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
      case "s":
        socket.emit("keydown", "s");
        break;
      case "k":
        socket.emit("keydown", "k");
        break;
    }
  }
});

window.addEventListener("keyup", (event) => {
  //client keyup
  if (game.isRunning) {
    switch (event.key) {
      case "a":
        socket.emit("keyup", "a");
        break;
      case "d":
        socket.emit("keyup", "d");
        break;
      case "s":
        socket.emit("keyup", "s");
        break;
    }
  }
});

canvas.addEventListener("click", (event) => {
  //client click
  if (game.isRunning) {
    let click = {
      x: event.pageX,
      y: event.pageY,
    };
    socket.emit("click", click);
  }
});

const backgroundImg = new Image();
backgroundImg.src = "/img/background.png";
const foxImgIdle = new Image();
foxImgIdle.src = "/img/fox.png";
const foxImgLeft = new Image();
foxImgLeft.src = "/img/fox_left.png";
const foxImgRight = new Image();
foxImgRight.src = "/img/fox_right.png";
const foxImgJump = new Image();
foxImgJump.src = "/img/fox_jump.png";
console.log(foxImgIdle.src);

let currentFrame = 0;
let imageFrame = 0;

let platformList = undefined;

socket.on("platform", (platforms) => {
  platformList = platforms;
});

//game tick
socket.on("playerState", (playerData) => {
  //render background
  ctx.fillStyle = "black";
  ctx.drawImage(backgroundImg, 0, 0, 1856, 1024, 0, 0, canvas.width, canvas.height);
  //ctx.fillRect(0, 0, canvas.width, canvas.width);

  //render platform
  for (let i in platformList) {
    ctx.fillStyle = platformList[i].color;
    ctx.fillRect(platformList[i].x, platformList[i].y, platformList[i].width, platformList[i].height);
  }

  //frame for animation loop
  currentFrame++;
  if (currentFrame > 30) {
    currentFrame = 0;
  }

  //update imageFrame based on gameframe
  if (currentFrame < 10) {
    imageFrame = 0;
  } else if (currentFrame > 10 && currentFrame < 20) {
    imageFrame = 60;
  } else if (currentFrame > 20) {
    imageFrame = 120;
  }

  //render playerdata
  for (let i = 0; i < playerData.length; i++) {
    //sprite animations
    if (playerData[i].isJumping) {
      //jumping
      ctx.drawImage(foxImgJump, 0, imageFrame, 60, 60, playerData[i].x, playerData[i].y, 60, 60);
    } else if (playerData[i].pressingKey.a) {
      //moving left
      ctx.drawImage(foxImgLeft, 0, imageFrame, 60, 60, playerData[i].x, playerData[i].y, 60, 60);
    } else if (playerData[i].pressingKey.d) {
      //moving right
      ctx.drawImage(foxImgRight, 0, imageFrame, 60, 60, playerData[i].x, playerData[i].y, 60, 60);
    } else {
      //idle
      ctx.drawImage(foxImgIdle, 0, imageFrame, 60, 60, playerData[i].x, playerData[i].y, 60, 60);
    }
    //username animation
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.fillText(playerData[i].username, playerData[i].x + (25 - (playerData[i].username.length / 2) * (25 / 2)), playerData[i].y - 20);

    //Usernames in lobby
    //usernameList.textContent = playerData[i].username;
  }
});

socket.on("username-select", (username) => {
  const list = document.createElement("li");
  let usernameText = document.createTextNode(username);
  //usernameText.style.color = "white";
  //node.appendChild(usernameText);
  lobby.appendChild(list);
});
