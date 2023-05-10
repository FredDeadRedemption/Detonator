"use strict";

const randomColor = require("./util").randomColor;

exports.PLATFORM_LIST = [
  //floor
  {
    position: {
      x: -100, //100 pixels off screen to avoid falling off
      y: 566,
    },
    height: 700,
    width: 1224, //100 pixels off screen to avoid falling off
    color: "rgb(255, 255, 255)",
    unpassable: true,
  },
  //middle
  {
    position: {
      x: 250,
      y: 400,
    },
    height: 30,
    width: 200,
    color: randomColor(),
    unpassable: false,
  },
  //right
  {
    position: {
      x: 450,
      y: 200,
    },
    height: 30,
    width: 400,
    color: randomColor(),
    unpassable: false,
  },
  //left
  {
    position: {
      x: 100,
      y: 100,
    },
    height: 30,
    width: 150,
    color: randomColor(),
    unpassable: false,
  },
];
