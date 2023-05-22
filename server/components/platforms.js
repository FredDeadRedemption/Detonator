"use strict";

const defaultHeight = 16;

exports.PLATFORM_LIST = [
  //floor
  {
    position: {
      x: -100, //100 pixels off screen to avoid falling off
      y: 566,
    },
    height: 700,
    width: 1224, //100 pixels off screen to avoid falling off
    unpassable: true,
  },
  //platform 1
  {
    position: {
      x: 404,
      y: 400,
    },
    height: defaultHeight,
    width: 256,
    unpassable: false,
  },
  //platform 2
  {
    position: {
      x: 10,
      y: 349,
    },
    height: defaultHeight,
    width: 224,
    unpassable: false,
  },
  //platform 3
  {
    position: {
      x: 774,
      y: 351,
    },
    height: defaultHeight,
    width: 224,
    unpassable: false,
  },
  //platform 4
  {
    position: {
      x: 522,
      y: 220,
    },
    height: defaultHeight,
    width: 320,
    unpassable: false,
  },
  //platform 5
  {
    position: {
      x: 712,
      y: 101,
    },
    height: defaultHeight,
    width: 128,
    unpassable: false,
  },
  //platform 6
  {
    position: {
      x: 250,
      y: 99,
    },
    height: defaultHeight,
    width: 128,
    unpassable: false,
  },
];
