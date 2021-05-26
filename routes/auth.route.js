const router = require("express").Router();
require("dotenv").config();
const userRepo = require("../repository/user.repo");
const models = require("../models");
const jwt = require("jsonwebtoken");
const { forget_message } = require("../utils/mail.model");
const sendMail = require("../utils/mailer");
const crypto = require("crypto");
const authorization = require("../middlewares/authorize");
const bcrypt = require("bcryptjs");
const redis = require('../utils/caching');
const authorize = require("../middlewares/authorize");

router.post("/", async function (req, res) {
  const { email, password } = req.body;
  const findUser = await userRepo.getByEmail(email);
  if (!findUser) {
    return res.status(400).json({
      err: "Account does not exist!!!",
    });
  }
  if (findUser) {
    if (!userRepo.comparePassword(password, findUser.password)) {
      return res.status(400).json({
        err: "Password is wrong!!!",
      });
    }
    const token = jwt.sign({ id: findUser.id }, process.env.JWT_SECRET, {
      expiresIn: "60m",
    });

    // set refresh token to redis
    const refreshToken = jwt.sign({id: findUser.id}, process.env.JWT_SECRET, {
      expiresIn: "2d"
    });
    const isSet = await redis.set(refreshToken, findUser.id);
    const isSetExpire = redis.expire(
      refreshToken,
      60*60*24
    );
    if (isSet && isSetExpire) {
      console.log('---------- Save redis successfully! ----------');
    } else {
      return res.status(400).json({
        result: 0,
        message: 'Save redis failed'
      })
    }

    res.cookie("token", token, { expiresIn: "1d" });
    const { id, name, email, role, avatar_url } = findUser;
    return res.status(200).json({
      token,
      refreshToken,
      user: { id, name, email, role, avatar_url },
    });
  }
});

router.post("/forgot-password", async (req, res) => {
  crypto.randomBytes(32, async (err, buffer) => {
    if (err) {
      console.log(err);
    }
    const token = buffer.toString("hex");
    const findUser = await userRepo.getByEmail(req.body.email);
    if (!findUser) {
      return res
        .status(422)
        .json({ error: "User dont exists with that email" });
    }
    const cacheCode = redis.set(token, JSON.stringify({
      email: findUser.email,
      type: "forgot_password",
    }));
    console.log({ cacheCode })
    const expireTime = redis.expire(
      token,
      process.env.CONFIRM_EXP || 86400
    );
    if (cacheCode && expireTime) {
      sendMail(forget_message(findUser.email, token));
      return res.status(200).json(
        {
          result: 1,
          message: 'Check mail to reset password!'
        }
      );
    }
    return res.status(400).json({
      result: 0,
      error: 'Wrong',
    });
    // models.User.update(
    //   { reset_password_token: token },
    //   { where: { id: findUser.id } }
    // )
    //   .then((result) => {
    //     var mailOptions = {
    //       from: "admin@mammam.com",
    //       to: findUser.email,
    //       subject: "Reset password email",
    //       text: "That was easy!",
    //       html: `
    //       <p>You requested for password reset</p>
    //       <h5>click in this <a href="https://localhost:3000/reset/${token}">link</a> to reset password</h5>
    //       `,
    //     };
    //     const mail = sendMail(forget_message(findUser.email, token));
    //     return res.status(200).json({
    //       message: "Check email!",
    //     });
    //   })
    //   .catch((error) => {
    //     res.status(400).json({
    //       error,
    //     });
    //   });
    // });
  })
});

router.post("/new-password", async (req, res) => {
  const { password, resetToken } = req.body;
  redis.get(resetToken, async function (err, data) {
    console.log({ err, data })
    // confirm code not exists
    if (err || data === null) {
      return res.status(400).json({ result: 0, message: "Confirm code not exits" });
    } else {
      if (redis.del(resetToken)) {
        const parsedData = JSON.parse(data);
        const {email, type} = parsedData;
        switch (type) {
          case "forgot_password": {
            console.log({ email })
            bcrypt.hash(password, 12).then((hashedpassword) => {
              console.log({ hashedpassword })
              models.User.update(
                {
                  password: hashedpassword,
                  expire_token: null,
                },
                {
                  where: { email: email },
                }
              )
                .then(() => {
                  res.json({ result: 1,  message: "password updated success" });
                })
                .catch((error) => {
                  res.status(400).json({
                    result: 0,
                    error,
                  });
                });
            });
          }
        }
      } else {
        return res.status(500).json({result: 0, message: "something wrong"});
      }
    }
  })
});

router.post("/change-password", authorize, async (req, res) => {
  const { newPassword, password } = req.body;
  const { user } = req;
  if (!userRepo.comparePassword(password, user.password)) {
    return res.status(400).json({
      result: 0,
      message: "Old password is wrong!"
    })
  }
  const createdPassword = bcrypt.hashSync(newPassword, process.env.SALT || 10);
  await userRepo.update(user.id, { password: createdPassword })
  return res.status(200).json({
    result: 1,
    message: 'Change password successfully!'
  })
});

router.post("/refresh-token", async (req, res) => {
  const { refreshToken } = req.body;
  const userId = await redis.getAsync(refreshToken);
  console.log({ userId })
  if (!userId) {
    return res.status(400).json({
      result: 0,
      message: 'Invalid Refresh token'
    })
  }

  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  return res.status(200).json({
    token
  })
})
module.exports = router;
