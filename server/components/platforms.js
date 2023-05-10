"use strict";

const Platform = require("./sprites").Platform;
const randomColor = require("./util").randomColor;

//spawn platform objects

//spawn platform objects
let PLATFORM_LIST = [];
let platform = [];
//Floor
platform[0] = new Platform({
  position: {
    x: -100, //100 pixels off screen to avoid falling off
    y: 566,
  },
  height: 700,
  width: 1224, //100 pixels off screen to avoid falling off
  color: "rgb(255, 255, 255)",
});
platform[0].unpassable = true;
//Platform 1
platform[1] = new Platform({
  position: {
    x: 250,
    y: 400,
  },
  height: 30,
  width: 200,
  color: randomColor(),
});
//Platform 2
platform[2] = new Platform({
  position: {
    x: 450,
    y: 200,
  },
  height: 30,
  width: 400,
  color: randomColor(),
});
//Platform 3
platform[3] = new Platform({
  position: {
    x: 100,
    y: 100,
  },
  height: 30,
  width: 150,
  color: randomColor(),
});

for (let i in platform) {
  PLATFORM_LIST.push({
    x: platform[i].position.x,
    y: platform[i].position.y,
    height: platform[i].height,
    width: platform[i].width,
    color: platform[i].color,
    unpassable: platform[i].unpassable,
  });
}

exports.allPlatforms = PLATFORM_LIST;
