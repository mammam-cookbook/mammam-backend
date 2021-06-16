const jwt = require('jsonwebtoken')
require("dotenv").config();
var models =require('../models');
const redis = require('../utils/caching');
const { getById } = require('../repository/user.repo');

module.exports = async (req,res,next) => {
  const {authorization} = req.headers;
  if(!authorization){
     return res.status(401).json({error:"jwt must provide"})
  }
  const token = authorization.replace("Bearer ","")
  const stringifyUser = await redis.getAsync(token);
  console.log({ stringifyUser })
  if (stringifyUser) {
    const user = JSON.parse(stringifyUser)
    req.user = user
    next()
  } else {
    return res.status(401).json({error:"Access Token is invalid"})
  }
}
