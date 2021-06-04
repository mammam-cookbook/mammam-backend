const router = require("express").Router();
const userRepo = require("../repository/user.repo");
const { ban_message } = require("../utils/mail.model");
const { unban_message } = require("../utils/mail.model");
const { delete_message } = require("../utils/mail.model");
const sendMail = require("../utils/mailer");
const { route } = require("./auth.route");
const { sendNotification } = require('../socketHandler/notification.handler')
const notificationRepo = require("../repository/notification.repo");
const permitRole = require("../middlewares/permitRole");

const recipeRepo = require("../repository/recipe.repo");
const authorize = require("../middlewares/authorize");

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0; //for dev only, delete on production

router.post("/ban", authorize, permitRole('admin'), async function (req, res) {
    const user = req.body.user_id;
    const createdBan = await userRepo.banUser(user);
    const userEmail = await userRepo.getEmailById(user);
    if (createdBan) {
      sendMail(ban_message(userEmail.dataValues.email));
      res.status(200).json({
        result: 1,
        userBanned: createdBan
      });
    }
});

router.post("/unban", authorize, permitRole('admin'), async function (req, res) {
    const user = req.body.user_id;
    const createdUnban = await userRepo.unbanUser(user);
    const userEmail = await userRepo.getEmailById(user);
    if (createdUnban) {
      sendMail(unban_message(userEmail.dataValues.email));
      res.status(200).json({
        result: 1,
        userUnbanned: createdUnban
      });
    }
});

router.delete("/user", authorize, permitRole('admin'), async function (req, res) {
  const user = req.body.user_id;
  const userDeleted = await userRepo.remove(user);
  const userEmail = await userRepo.getEmailById(user);
  if (userDeleted) {
    sendMail(delete_message(userEmail.dataValues.email));
    res.status(200).json({
      result: 1,
      userDeleted: userDeleted
    });
  }
});

module.exports = router;