const jwt = require('jsonwebtoken')
require("dotenv").config();
var models =require('../models');
var User = models.User;
const redis = require('../utils/caching');
const { getById } = require('../repository/user.repo');

module.exports = async (req,res,next) => {
  const {authorization} = req.headers;
  if(!authorization){
     return res.status(401).json({error:"jwt must provide"})
  }
  const token = authorization.replace("Bearer ","")
  verifyToken(token)
  const user = await User.findOne({
    where: {
      access_token: token
    }
  })
  if (user) {
    req.user = user
    next()
  } else {
    return res.status(401).json({error:"Access Token is invalid"})
  }
}

function verifyToken(token) {
  return jwt.verify(token,process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
          throw new Error(err.message);
      }
      return decoded;
  });
}
