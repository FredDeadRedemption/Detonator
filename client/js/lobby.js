"use strict";

//let userCount = undefined;

document.querySelector(".userCount").textContent = 0 + " / 4";

import socket from "./script.js";


socket.emit("join-lobby", 10);

socket.on("user-connected", userId => {
    console.log(userId + " has connected");
    
});

socket.on("user-count", userCount => {
    document.querySelector(".userCount").textContent = userCount + " / 4";
})


