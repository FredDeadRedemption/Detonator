"use strict";
//canvas init
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;
canvas.middle = canvas.width / 2; //y axis middle

ctx.fillRect(0, 0, canvas.width, canvas.width); //background

//test square
ctx.fillStyle = "red";
ctx.fillRect(50, 50, 50, 50);
