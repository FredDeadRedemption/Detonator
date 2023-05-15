"use strict";

exports.randomColor = function randomColor() {
  const number = Math.random();
  let color;

  if (number <= 0.25) {
    color = "rgb(500, 175, 65)";
  } else if (number > 0.25 && number <= 0.5) {
    color = "rgb(60, 179, 113)";
  } else if (number > 0.5 && number <= 0.75) {
    color = "rgb(245, 0, 0)";
  } else if (number > 0.75) {
    color = "rgb(143, 188, 255)";
  }

  return color;
};

exports.distanceformula = function dist(player, bomb) {
  let x1 = player.position.x + player.width / 2;
  let x2 = bomb.position.x + bomb.width / 2;
  let y1 = player.position.y + player.height / 2;
  let y2 = bomb.position.y + bomb.height / 2;
  let d = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  return d;
};

exports.usernameIsInvalid = function usernameIsInvalid(username, userlist) {
  if (username.length > 36) {
    return false;
  }
  for (let i = 0; i < 4; i++) {
    if (username == userlist[i]) {
      return false;
    }
  }
  return true;
};
