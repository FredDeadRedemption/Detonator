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
