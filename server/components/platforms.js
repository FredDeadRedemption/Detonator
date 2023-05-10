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
  //platform 1
  {
    position: {
      x: 404,
      y: 400,
    },
    height: 30,
    width: 250,
    color: randomColor(),
    unpassable: false,
  },
  //platform 2
  {
    position: {
      x: 10,
      y: 350,
    },
    height: 30,
    width: 240,
    color: randomColor(),
    unpassable: false,
  },
  //platform 3
  {
    position: {
      x: 774,
      y: 350,
    },
    height: 30,
    width: 240,
    color: randomColor(),
    unpassable: false,
  },
];
