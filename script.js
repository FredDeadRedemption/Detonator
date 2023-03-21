"use strict";
const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;
canvas.middle = canvas.width / 2; //y axis middle

c.fillRect(0, 0, canvas.width, canvas.width);

//test
c.fillStyle = "red";
c.fillRect(50, 50, 50, 50);
