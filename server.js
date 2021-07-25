const express = require("express");
const http = require('http');
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const jwt = require("jsonwebtoken");
var cron = require('node-cron');
const redis = require('./utils/caching');
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

const esclient = require('./repository/elasticsearch.repo');
const menuReminder = require('./cronJobs/menuReminder')

require("dotenv").config();
//Log request
const morgan = require("morgan");
app.use(morgan("dev"));

const cors = require("cors");
app.use(cors());

var task = cron.schedule('* * * * *', () => {
  console.log('Runing a job at 10am,4pm and 9pm at  Asia/Bangkok timezone');
  menuReminder.remindRecipeInMenu();
}, {
  scheduled: true,
  timezone: "Asia/Bangkok"
});

task.start();

app.io = io;
app.set("socketio", io);
io.use(async(socket, next) => {
  console.log("Connections", socket.handshake.query.token )
  if (socket.handshake.query.token) {
    const token = socket.handshake.query.token;
    if (!token) {
      next(new Error("Authentication error"))
    }
    const stringifyUser = await redis.getAsync(token);
    if (stringifyUser) {
      const user = JSON.parse(stringifyUser)
      socket.user = {...user, socketId: socket.id}
      next()
    }
  } else {
    next(new Error("Authentication error"))
  }
}).on('connection', (socket) => {
  socket.join(socket.user.id)
});



//Use body parser
let bodyParser = require("body-parser");
const { remindRecipeInMenu } = require("./cronJobs/menuReminder");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: "5mb" }));

esclient.checkConnection().then(data => {
  if (data) {
    esclient.init();
  }
});
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
app.use("/api/admin", require("./routes/admin.route"));

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
server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

module.exports = {
  app,
  io
};