const express = require("express");
const app = express();

//Log request
const morgan = require('morgan');
app.use(morgan('dev'));

const cors = require("cors");
app.use(cors());

app.get('/api', (req,res)=>{
    console.log("=============req===========");
    return res.json({
        a: 'Welcome'
    })
    // next()
})

app.use(function (req, res, next) {
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