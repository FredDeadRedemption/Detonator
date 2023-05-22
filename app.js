const express = require("express");

const app = express();

const server = require("http").createServer(app);

const port = 420;

const io = require("socket.io")(server);

require("./server/gamelogic.js")(io); //pass io server to constructor func in gamelogic.js

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/client/StartPage.html");
});
app.use(express.static(__dirname + "/client"));

server.listen(port, (error) => {
  if (error) {
    console.error("error: ", error);
  } else {
    console.log("server running on port: " + port);
  }
});

//mongoDB
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const User = require("./server/components/user.js");
const uri = "mongodb+srv://Admin:p2projekt@userdata.htaltmo.mongodb.net/?retryWrites=true&w=majority";

//connect
async function connect() {
  try {
    await mongoose.connect(uri);
    console.log("connected to MongoDB");
  } catch (error) {
    console.error(error);
  }
}
connect();

app.use(bodyParser.urlencoded({ extended: true }));

//Register and login
app.post("/register", async (req, res) => {
  console.log(req.body); // log the request body to the console
  const user = await User.create({
    username: req.body.username,
    password: req.body.password,
  });
  return res.redirect("/login.html");
});

app.post("/login", async function (req, res) {
  try {
    // check if the user exists
    const user = await User.findOne({ username: req.body.username });
    if (user) {
      //check if passwords matches
      const result = req.body.password === user.password;
      if (result) {
        res.redirect("/index.html");
      } else {
        res.status(400).json({ error: "password doesn't match" });
      }
    } else {
      res.status(400).json({ error: "User doesn't exist" });
    }
  } catch (error) {
    res.status(400).json({ error });
  }
});

//yeehaw!
