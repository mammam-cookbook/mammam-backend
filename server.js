const express = require("express");
const socket_io = require("socket.io");
const jwt = require("jsonwebtoken");
var cron = require('node-cron');

const app = express();
require("dotenv").config();
//Log request
const morgan = require("morgan");
app.use(morgan("dev"));

const cors = require("cors");
app.use(cors());

// socket.io
const io = socket_io();

app.io = io;

app.set("socketio", io);

var task = cron.schedule('* * * * *', () =>  {
  // console.log('stopped task');
}, {
  scheduled: false
});

task.start();

io.use((socket, next) => {
  if (socket.handshake.query && socket.handshake.query.token) {
    const token = socket.handshake.query.token.split(" ")[1];
    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
      if (err) return next(new Error("Authentication error"));
      socket.userData = decoded;
      next();
    });
  } else {
    next(new Error("Authentication error"));
  }
}).on("connection", (socket) => {
  // Connection now authenticated to receive further events
  // socket.join(socket.userData.userId);
  // io.in(socket.userData.userId).clients((err, clients) => {
  //   userController.changeStatus(socket.userData.userId, clients, io);
  //   //console.log(clients);
  // });
  // socket.on("typing", (data) => {
  //   socket.to(data.userId).emit("typing", { roomId: data.roomId });
  // });
  // socket.on("stoppedTyping", (data) => {
  //   socket.to(data.userId).emit("stoppedTyping", { roomId: data.roomId });
  // });
  // socket.on("disconnect", () => {
  //   socket.leave(socket.userData.userId);
  //   io.in(socket.userData.userId).clients((err, clients) => {
  //     userController.changeStatus(socket.userData.userId, clients, io);
  //   });
  // });
  console.log("------- connection -------------");
});

//Use body parser
let bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: "5mb" }));

//Config route
app.get('/', (req, res) => {
  res.status(200).send({
    message: "Welcome to MAM API!",
  });
})
app.use("/api/auth", require("./routes/auth.route"));
app.use("/api/user", require("./routes/user.route"));
app.use("/api/recipe", require("./routes/recipe.route"));
app.use("/api/comment", require("./routes/comment.route"));
app.use("/api/collection", require("./routes/collection.route"));
app.use("/api/category", require("./routes/category.route"));
app.use("/api/reaction", require("./routes/reaction.route"));
app.use("/api/ingredient", require("./routes/ingredient.route"));
app.use("/api/shopinglist", require("./routes/shoping.route"));
app.use("/api/menu", require("./routes/menu.route"));
app.use("/api/notification", require("./routes/notification.route"));
app.use("/api/upvote", require("./routes/upvote.route"));
app.use("/api/challenge", require("./routes/challenge.route"));
app.use("/api/problem", require("./routes/problem.route"));
app.use("/api/report", require("./routes/report.route"));

app.use(function (req, res, next) {
  console.log("------ req.body -------", req.body);
  res.status(404).send({
    message: "Resource not found!",
  });
});

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

module.exports = app;