const express = require("express");
const app = express();
require("dotenv").config();
//Log request
const morgan = require('morgan');
app.use(morgan('dev'));

const cors = require("cors");
app.use(cors());

//Use body parser
let bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: "5mb" }));


//Config route
app.use("/api/auth", require("./routes/auth.route"));
app.use("/api/user", require("./routes/user.route"));
app.use("/api/recipe", require("./routes/recipe.route"));

app.use(function (req, res, next) {
  console.log('------ req.body -------', req.body);
  res.status(404).send({
    message: "Resource not found!",
  });
});

app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
  })
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});