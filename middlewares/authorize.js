const jwt = require('jsonwebtoken')
require("dotenv").config();
var models =require('../models');
const redis = require('../utils/caching');
const { getById } = require('../repository/user.repo');

module.exports = (req,res,next) => {
  const {authorization} = req.headers;
  if(!authorization){
     return res.status(401).json({error:"jwt must provide"})
  }
  const token = authorization.replace("Bearer ","")
  jwt.verify(token,process.env.JWT_SECRET,(err,payload)=>{
      if(err){
       return   res.status(401).json({error:"you must be logged in"})
      }
      const {id} = payload;
      getById(id).then(userdata=>{
          req.user = userdata
          next()
      })
  })
}
