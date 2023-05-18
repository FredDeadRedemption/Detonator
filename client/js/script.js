"use strict";

//ctx
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const lobby = document.querySelector(".lobbyContainer");

//ctx settings
canvas.width = 1024;
canvas.height = 576;
canvas.middle = canvas.width / 2; //y axis middle
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = "high";

//font stuff
var f = new FontFace("Pixeloid", "url(/PixeloidSansBold.ttf)");

f.load().then((font) => {
  // Ready to use the font in a canvas context
  console.log("font ready");

  // Add font on the html page
  document.fonts.add(font);

  ctx.font = "25px Pixeloid";
});

//client socket
var socket = io();
export default socket;

//game
let game = {
  isRunning: false,
  start() {
    this.isRunning = true;
  },
};

let role = undefined;
let roleEmoji = undefined;

//DEBUG
socket.on("clientSelections", (selectedUsername, selectedTeam, selectedRole) => {
  role = selectedRole; //eventlisteners = client specific makes the sense
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
backgroundImg.src = "/img/cathedralBackground.png";

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
const platformImg1 = new Image();
platformImg1.src = "/img/metalBox1.png";
const platformImg2 = new Image();
platformImg2.src = "/img/metalBox2.png";
const platformImg3 = new Image();
platformImg3.src = "/img/metalBox3.png";

//bomb sprite img
const bombRedImg = new Image();
bombRedImg.src = "/img/bombRed.png";
const bombBlueImg = new Image();
bombBlueImg.src = "/img/bombBlue.png";
//aura
const bombAuraImg = new Image();
bombAuraImg.src = "/img/aura.png";

//explosion sprite img
const explosionImg = new Image();
explosionImg.src = "/img/explosion.png";

let currentFrame = 0;
let imageFrame = 0;

let platformList = undefined;
let bombList = undefined;
let explosionList = undefined;

let lowestTeamBombRed = 0;
let lowestTeamBombBlue = 0;

socket.on("platform", (platforms) => {
  platformList = platforms;
});

socket.on("bombState", (bombData) => {
  bombList = bombData;
});

socket.on("explosionState", (explosionData) => {
  explosionList = explosionData;
});

//game tick / animations
socket.on("playerState", (playerData) => {
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

  //render background image
  ctx.drawImage(backgroundImg, 0, 0, 682, 358, 0, 0, canvas.width, canvas.height);

  //render platform
  for (let i in platformList) {
    for (let j = 0; j < platformList[i].width; j++) {
      if (j % 32 == 0) {
        if (platformList[i].unpassable) {
          ctx.fillStyle = "rgb(55,55,55)";
          ctx.fillRect(platformList[i].position.x, platformList[i].position.y, platformList[i].width, platformList[i].height);
        } else {
          if (j == 0) {
            ctx.drawImage(platformImg2, 0, 0, 32, 32, platformList[i].position.x + j, platformList[i].position.y, 32, 32);
          } else if (j + 32 == platformList[i].width) {
            ctx.drawImage(platformImg3, 0, 0, 32, 32, platformList[i].position.x + j, platformList[i].position.y, 32, 32);
          } else {
            ctx.drawImage(platformImg1, 0, 0, 32, 32, platformList[i].position.x + j, platformList[i].position.y, 32, 32);
          }
        }
      }
    }
  }

//render bomb
  //Find which bomb explodes next
  for (let i in bombList) {
      if (bombList[i].team == "red") {
        lowestTeamBombRed = i;
        break;
      }
  }
  for (let i in bombList) {
      if (bombList[i].team == "blue") {
        lowestTeamBombBlue = i;
        break;
      }
  }

  for (let i in bombList) {

    if (i == lowestTeamBombBlue || i == lowestTeamBombRed) {
      //ctx.fillStyle = "rgb(255,0,255)";
      //ctx.fillRect(bombList[i].x, bombList[i].y, 60, 60);
      ctx.drawImage(bombAuraImg, 0, 0, 70, 70, bombList[i].x, bombList[i].y, 70, 70);
    }

    //Determine the color of the bomb
    let bombImg = undefined;
    if (bombList[i].team == "red") {
      bombImg = bombRedImg;
    } else if (bombList[i].team == "blue") {
      bombImg = bombBlueImg;
    }
    //draw the bombss
    if (bombList[i].velocityX != 0 && bombList[i].timer > 200) {
      //bomb rolling / flying
      ctx.drawImage(bombImg, 0, imageFrame, 70, 70, bombList[i].x, bombList[i].y, 70, 70);
    } else if (bombList[i].timer > 200) {
      //bomb standing still
      ctx.drawImage(bombImg, 0, 60, 70, 70, bombList[i].x, bombList[i].y, 70, 70);
    } else if (bombList[i].timer < 200 && imageFrame == 60) {
      //bomb blinking / despawning
      ctx.drawImage(bombImg, 0, imageFrame, 70, 70, bombList[i].x, bombList[i].y, 70, 70);
    }
    ctx.fillText(i, bombList[i].x, bombList[i].y);
  }

  //render explosion
  for (let i in explosionList) {
    ctx.drawImage(explosionImg, 0, imageFrame, 60, 60, explosionList[i].x, explosionList[i].y, explosionList[i].radius, explosionList[i].radius);
  }

  //render playerdata
  for (let i = 0; i < playerData.length; i++) {
    //sprite animations
    if (!playerData[i].hit || (playerData[i].hit && imageFrame == 60)) {
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
    //username animation with team color && role tag
    playerData[i].role === "bomber" ? (roleEmoji = "💣") : (roleEmoji = "🕹️");
    ctx.fillStyle = playerData[i].team;
    ctx.fillText(playerData[i].username + roleEmoji, playerData[i].x + (25 - (playerData[i].username.length / 2) * (25 / 2)), playerData[i].y - 20);

    //healthbar
    ctx.fillStyle = "rgb(255,0,0)";
    ctx.fillRect(playerData[i].x - (16 * playerData[i].maxHealth - 30), playerData[i].y - 48, playerData[i].maxHealth * 32, 8);
    ctx.fillStyle = "rgb(0,255,0)";
    ctx.fillRect(playerData[i].x - (16 * playerData[i].maxHealth - 30), playerData[i].y - 48, playerData[i].health * 32, 8);
  }
});
