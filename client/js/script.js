"use strict";

//ctx
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const lobby = document.querySelector(".lobbyContainer");

//ctx settings
canvas.width = 1024;
canvas.height = 576;
canvas.middle = canvas.width / 2; //y axis middle
ctx.font = "25px Verdana";
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = "high";

//client socket
var socket = io();
export default socket;

//local game state handler
let game = {
  isRunning: false,
  start() {
    this.isRunning = true;
  },
};

let role = undefined;

//DEBUG
socket.on("clientSelections", (selectedUsername, selectedTeam, selectedRole) => {
  role = selectedRole;
  console.log(`Username: ${selectedUsername}\nTeam: ${selectedTeam}\nRole: ${selectedRole}\nStarting game..`);
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
        if (role === "bomber" && !cooldownActive) {
          ability();
        } else if (role === "detonator") {
          ability();
        }
        break;
    }
  }
});

let cooldownActive = false;

function ability() {
  socket.emit("keydown", "k");
  cooldownActive = true;
  setTimeout(() => {
    cooldownActive = false;
  }, 1500);
}

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

//background sprite img
const backgroundImg = new Image();
backgroundImg.src = "/img/background.png";

//fox sprite img
const foxImgIdle = new Image();
foxImgIdle.src = "/img/fox.png";
const foxImgLeft = new Image();
foxImgLeft.src = "/img/fox_left.png";
const foxImgRight = new Image();
foxImgRight.src = "/img/fox_right.png";
const foxImgJump = new Image();
foxImgJump.src = "/img/fox_jump.png";

//bomb sprite img
const platformImg = new Image();
platformImg.src = "/img/metalBox.png";

//bomb sprite img
const bombImg = new Image();
bombImg.src = "/img/bomb.png";

//explosion sprite img
const explosionImg = new Image();
explosionImg.src = "/img/explosion.png";

let currentFrame = 0;
let imageFrame = 0;

let platformList = undefined;
let bombList = undefined;
let explosionList = undefined;

socket.on("platform", (platforms) => {
  platformList = platforms;
});

socket.on("bombState", (bombData) => {
  bombList = bombData;
});

socket.on("explosionState", (explosionData) => {
  explosionList = explosionData;
});

//game tick
socket.on("playerState", (playerData) => {
  //render background image
  ctx.drawImage(backgroundImg, 0, 0, 1856, 1024, 0, 0, canvas.width, canvas.height);

  //render platform //////Det skal bare tegnes statisk på background image
  for (let i in platformList) {
    for(let j = 0; j < platformList[i].width; j++) {

      if(j % 16 == 0) {
        ctx.drawImage(platformImg, 0, 0, 16, 16, platformList[i].position.x+j, platformList[i].position.y, 16, 16);
      }
    }
  }

  //render bomb
  for (let i in bombList) {
    if (bombList[i].velocityX != 0 || bombList[i].velocityX == 0 && imageFrame == 60) { //Blink when bomb is still
      ctx.drawImage(bombImg, 0, imageFrame, 70, 70, bombList[i].x, bombList[i].y, 70, 70);
    }

    //DEBUG
    //ctx.font = "20px Verdana";
    //ctx.fillStyle = "rgb(255,255,255)";
    //ctx.fillText(bombList[i].velocityX, bombList[i].x - 32, bombList[i].y);
    // ctx.fillText(bombList[i].y, bombList[i].x - 32, bombList[i].y + 18);

    ctx.font = "25px Verdana"; //back to original
  }

  //render explosion
  for (let i in explosionList) {
    ctx.drawImage(explosionImg, 0, imageFrame, 60, 60, explosionList[i].x, explosionList[i].y, explosionList[i].radius, explosionList[i].radius);
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
    if (!playerData[i].hit || playerData[i].hit && imageFrame == 60) {
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
    }
    //username animation
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.fillText(playerData[i].username, playerData[i].x + (25 - (playerData[i].username.length / 2) * (25 / 2)), playerData[i].y - 20);
    //temporary team color animation
    ctx.fillStyle = playerData[i].team;
    ctx.fillRect(playerData[i].x + (playerData[i].username.length * (25 / 2) + 8), playerData[i].y - 36, 24, 24);
    //healthbar
    ctx.fillStyle = "rgb(255,0,0)";
    ctx.fillRect(playerData[i].x - ((16 * playerData[i].maxHealth) - 30), playerData[i].y - 48, playerData[i].maxHealth * 32, 8);
    ctx.fillStyle = "rgb(0,255,0)";
    ctx.fillRect(playerData[i].x - ((16 * playerData[i].maxHealth) - 30), playerData[i].y - 48, playerData[i].health * 32, 8);

    //Usernames in lobby
    //usernameList.textContent = playerData[i].username;

    //DEBUG
    // ctx.font = "20px Verdana";
    // ctx.fillStyle = "rgb(255,255,255)";
    // ctx.fillText(playerData[i].x, playerData[i].x - 32, playerData[i].y);
    // ctx.fillText(playerData[i].y, playerData[i].x - 32, playerData[i].y + 18);
    // ctx.fillStyle = "rgb(255,0,255)";
    // ctx.fillRect(playerData[i].x, playerData[i].y, 5, 5);

    // ctx.font = "25px Verdana"; //back to original
  }
});

socket.on("username-select", (username) => {
  const list = document.createElement("li");
  let usernameText = document.createTextNode(username);
  //usernameText.style.color = "white";
  //node.appendChild(usernameText);
  lobby.appendChild(list);
});
