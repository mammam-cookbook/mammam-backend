const router = require("express").Router();
const userRepo = require("../repository/user.repo");
const { ban_message } = require("../utils/mail.model");
const { unban_message } = require("../utils/mail.model");
const { delete_message } = require("../utils/mail.model");
const { route } = require("./auth.route");
const { sendNotification } = require('../socketHandler/notification.handler')
const { sendNewEmailProducer } = require("../utils/jobQueue");
const notificationRepo = require("../repository/notification.repo");
const permitRole = require("../middlewares/permitRole");

const recipeRepo = require("../repository/recipe.repo");
const authorize = require("../middlewares/authorize");

const sendNoti = require("../utils/sendNotification");

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0; //for dev only, delete on production

router.post("/ban", authorize, permitRole('admin'), async function (req, res) {
    const user = req.body.user_id;
    const createdBan = await userRepo.banUser(user);
    const userEmail = await userRepo.getEmailById(user);
    if (createdBan) {
      sendNewEmailProducer(ban_message(userEmail.dataValues.email));
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
      sendNewEmailProducer(unban_message(userEmail.dataValues.email));
      res.status(200).json({
        result: 1,
        userUnbanned: createdUnban
      });
    }
});

router.delete("/user", authorize, permitRole('admin'), async function (req, res) {
  const user = req.body.user_id;
  const userEmail = await userRepo.getEmailById(user);
  const userDeleted = await userRepo.remove(user);
  if (userDeleted) {
    sendNewEmailProducer(delete_message(userEmail.dataValues.email));
    res.status(200).json({
      result: 1,
      userDeleted: userDeleted
    });
  }
});

router.post("/noti", async function (req, res) {
  const registrationToken = req.body.token;  
  let notification = {
    title: req.body.title,
    body: req.body.text
  }
  const message = {
    notification: notification,
    token: registrationToken
  };

  sendNoti.sendToOne(message);

  if (true) {
    res.status(200).json({
      result: 1,
    });
  }
});

router.post("/notis", async function (req, res) {
  const registrationToken = req.body.token;  
  let notification = {
    title: req.body.title,
    body: req.body.text
  }
  const message = {
    notification: notification,
    tokens: registrationToken
  };

  sendNoti.sendToMultiple(message);

  if (true) {
    res.status(200).json({
      result: 1,
    });
  }
});

router.post("/notiall", async function (req, res) {
  let notification = {
    title: req.body.title,
    body: req.body.text
  }
  const result = await userRepo.sendNotificationToAll(notification);
  if (result) {
    res.status(200).json({
      result: 1,
    });
  }
});

router.delete("/token", async function (req, res) {
  const user_id = req.body.user_id;
  const result = await userRepo.updateDeviceToken(null, user_id);
  if (result) {
    res.status(200).json({
      result: 1,
    });
  }
});

module.exports = router;