const jwt = require('jsonwebtoken')
require("dotenv").config();

module.exports = (req,res,next) => {
  const {authorization} = req.headers;
  if(!authorization){
    req.userId = null
    next();
  } else {
    const token = authorization.replace("Bearer ","")
    jwt.verify(token,process.env.JWT_SECRET,(err,payload)=>{
        if(err){
         return   res.status(401).json({error: err})
        }
        const {id} = payload;
        req.userId = id;
    })
    next();
  }
}
