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
    width: 256,
    color: randomColor(),
    unpassable: false,
  },
  //platform 2
  {
    position: {
      x: 10,
      y: 349,
    },
    height: 30,
    width: 224,
    color: randomColor(),
    unpassable: false,
  },
  //platform 3
  {
    position: {
      x: 774,
      y: 351,
    },
    height: 30,
    width: 224,
    color: randomColor(),
    unpassable: false,
  },
  //platform 4
  {
    position: {
      x: 522,
      y: 220,
    },
    height: 30,
    width: 320,
    color: randomColor(),
    unpassable: false,
  },
  //platform 5
  {
    position: {
      x: 712,
      y: 101,
    },
    height: 30,
    width: 128,
    color: randomColor(),
    unpassable: false,
  },
  //platform 6
  {
    position: {
      x: 250,
      y: 99,
    },
    height: 30,
    width: 128,
    color: randomColor(),
    unpassable: false,
  },
];
