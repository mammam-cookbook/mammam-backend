const router = require("express").Router();
const userRepo = require("../repository/user.repo");
const models = require("../models");
const jwt = require("jsonwebtoken");
const { forget_message } = require("../utils/mail.model");
const sendMail = require("../utils/mailer");
const crypto = require('crypto')
const authorization = require('../middlewares/authorize');
const bcrypt = require("bcryptjs");


router.post("/", async function (req, res) {
  const {email,password} = req.body;
  const findUser = await userRepo.getByEmail(email);
  if (!findUser) {
    return res.status(400).json({
      err : "Account does not exist!!!"
    }) 
  }
  if (findUser){
    if(!userRepo.comparePassword(password,findUser.password)){
      return res.status(400).json({
        err : "Password is wrong!!!"
      })
    }
    const token = jwt.sign({ id: findUser.id },"Skasdkajs6dkajsd6kjaksd6jkasd", {
      expiresIn: "10d"
    });
    console.log({ token });
    res.cookie("token", token, { expiresIn: "1d" });
    const { id, name, email } = findUser;
    return res.status(200).json({
      token,
      user: { id, name, email }
    });
  }
});

router.post('/forgot-password',async (req, res) => {
  crypto.randomBytes(32, async (err,buffer)=>{
    if (err){
      console.log(err)
    }
    const token = buffer.toString("hex")
    const findUser = await userRepo.getByEmail(req.body.email);
    if (!findUser) {
      return res.status(422).json({error:"User dont exists with that email"})
    }
    models.User.update({reset_password_token: token}, {where : {id : findUser.id} }).then(result=>{
        var mailOptions = {
          from: 'admin@mammam.com',
          to: findUser.email,
          subject: 'Reset password email',
          text: 'That was easy!',
          html: `
          <p>You requested for password reset</p>
          <h5>click in this <a href="https://localhost:3000/reset/${token}">link</a> to reset password</h5>
          `
        };
        const mail = sendMail(forget_message(findUser.email, token));
        return res.status(200).json({
          message: 'Check email!'
        })
      })
      .catch(error => {
        res.status(400).json({
          error
        })
      })
  })
})

router.post('/new-password', async (req,res)=> {
  const { password, resetToken } = req.body;
  const user = await models.User.findOne({where: { reset_password_token: resetToken }});
  if(!user){
    return res.status(422).json({error:"Try again session expired"})
  }
  bcrypt.hash(password,12).then(hashedpassword=>{
    models.User.update({password : hashedpassword, reset_password_token: null, expire_token: null }, {
     where : {id : user.id}
     }).then(()=>{
        res.json({message:"password updated success"})
    }).catch((error) => {
      res.status(400).json({
        error
      })
    })
 })
})
module.exports = router;
