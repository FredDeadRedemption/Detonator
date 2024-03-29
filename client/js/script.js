"use strict";

//ctx
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");



//ctx settings
canvas.width = 1024;
canvas.height = 576;
canvas.middle = canvas.width / 2; //y axis middle
ctx.imageSmoothingEnabled = false;

//font stuff
var f = new FontFace("Pixeloid", "url(/PixeloidSansBold.ttf)");

f.load().then((font) => {
  //ready to use the font in a canvas context
  console.log("font ready");

  //add font on the html page
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
      case "Escape":
        canvas.requestFullscreen();
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

//panda sprite img
const pandaImgIdle = new Image();
pandaImgIdle.src = "/img/players/panda/mega_man_panda_idle-sheet2x.png";
const pandaImgLeft = new Image();
pandaImgLeft.src = "/img/players/panda/mega_man_panda_running_left-sheet.png";
const pandaImgRight = new Image();
pandaImgRight.src = "/img/players/panda/mega_man_panda_running_right-sheet.png";
const pandaImgJump = new Image();
pandaImgJump.src = "/img/players/panda/mega_man_panda_falling.png"

//platform sprite img
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

//explosion sprite img
const blueArrowImg = new Image();
blueArrowImg.src = "/img/blue_arrow.png";

const redArrowImg = new Image();
redArrowImg.src = "/img/red_arrow.png";

const blueArrowBombImg = new Image();
blueArrowBombImg.src = "/img/blue_arrow_bomb.png";

const redArrowBombImg = new Image();
redArrowBombImg.src = "/img/red_arrow_bomb.png";

let currentFrame = 0;
let imageFrame = 0;

let platformList = undefined;
let bombList = undefined;
let explosionList = undefined;
let score = undefined;

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

socket.on("scoreState", (scoreData) => {
  score = scoreData;
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
    imageFrame = 60 * 2;
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

  //find which bomb explodes next for each team
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

  //only the freshest of bombs deserve an aura
  for (let i in bombList) {
    if (i == lowestTeamBombBlue || i == lowestTeamBombRed) {
      ctx.drawImage(bombAuraImg, 0, 0, 70, 70, bombList[i].x, bombList[i].y, 70, 70);
    }

    //determine the color of the bomb
    let bombImg = undefined;
    if (bombList[i].team == "red") {
      bombImg = bombRedImg;
    } else if (bombList[i].team == "blue") {
      bombImg = bombBlueImg;
    }
    //render bombs
    if (bombList[i].velocityX != 0 && bombList[i].timer > 200) {
      //bomb rolling / flying
      ctx.drawImage(bombImg, 0, imageFrame, 60, 60, bombList[i].x, bombList[i].y, 60, 60);
    } else if (bombList[i].timer > 200) {
      //bomb standing still
      ctx.drawImage(bombImg, 0, 60, 60, 60, bombList[i].x, bombList[i].y, 60, 60);
    } else if (bombList[i].timer < 200 && imageFrame == 60) {
      //bomb blinking / despawning
      ctx.drawImage(bombImg, 0, imageFrame, 60, 60, bombList[i].x, bombList[i].y, 60, 60);
    }
    //out of screen bomb arrow
    if(bombList[i].y < -10) {
      if(bombList[i].team === "red") {
        ctx.drawImage(redArrowBombImg, 0, 0, 32, 32, bombList[i].x, 4, 48, 48);
      }

      if(bombList[i].team === "blue") {
        ctx.drawImage(blueArrowBombImg, 0, 0, 32, 32, bombList[i].x, 4, 48, 48);
      }
    }
    //let j = parseInt(i) + 1; //renders bombcount starting at 1 instead of 0
    //ctx.fillText(j, bombList[i].x, bombList[i].y);
  }

  //render explosion
  for (let i in explosionList) {
    ctx.drawImage(explosionImg, 0, imageFrame, 60, 60, explosionList[i].x, explosionList[i].y, explosionList[i].radius, explosionList[i].radius);
  }

  //render playerdata
  for (let i = 0; i < playerData.length; i++) {
    //sprite animations
    if (!playerData[i].invincible || (playerData[i].invincible && imageFrame == 60)) {
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

    //out of screen player arrow
    if(playerData[i].y < -10) {
      if(playerData[i].team === "red") {
        ctx.drawImage(redArrowImg, 0, 0, 32, 18, playerData[i].x, 4, 64, 36);
      }

      if(playerData[i].team === "blue") {
        ctx.drawImage(blueArrowImg, 0, 0, 32, 18, playerData[i].x, 4, 64, 36);
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

  //Render score data
  ctx.fillStyle = "rgba(50,0,0,0.6)";
  ctx.fillRect((canvas.width * (1/3))-8,4,32,32);
  ctx.fillStyle = "rgba(50,50,50,0.6)";
  ctx.strokeRect((canvas.width * (1/3))-8,4,32,32);
  ctx.fillStyle = "red";
  ctx.fillText(score.redScore, canvas.width * (1/3), 30);
  ctx.fillStyle = "rgba(0,0,50,0.6)";
  ctx.fillRect((canvas.width * (2/3))-8,4,32,32);
  ctx.fillStyle = "rgba(50,50,50,0.6)";
  ctx.strokeRect((canvas.width * (2/3))-8,4,32,32);
  ctx.fillStyle = "blue";
  ctx.fillText(score.blueScore, canvas.width * (2/3), 30);
  if (score.winner != undefined) {
    ctx.fillstyle = score.winner;
    ctx.fillText(score.winner + " wins!", canvas.width * (1/2) - 70, 30);
  }
});


