const router = require("express").Router();
const userRepo = require("../repository/user.repo");
const followRepo = require("../repository/follow.repo");
const { register_message } = require("../utils/mail.model");
const sendMail = require("../utils/mailer");
const { route } = require("./auth.route");
const { sendNotification } = require('../socketHandler/notification.handler')
const notificationRepo = require("../repository/notification.repo");
const permitRole = require("../middlewares/permitRole");

const recipeRepo = require("../repository/recipe.repo");
const authorize = require("../middlewares/authorize");

router.post("/ban", authorize, permitRole('admin'), async function (req, res) {
    const user = req.body.user_id;
    const createdBan = await userRepo.banUser(user);
    if (createdBan) {
      res.status(200).json({
        result: 1,
        userBanned: createdBan
      });
    }
});

router.post("/unban", authorize, permitRole('admin'), async function (req, res) {
    const user = req.body.user_id;
    const createdUnban = await userRepo.unbanUser(user);
    if (createdUnban) {
      res.status(200).json({
        result: 1,
        userUnbanned: createdUnban
      });
    }
});

router.delete("/user", authorize, permitRole('admin'), async function (req, res) {
  const user = req.body.user_id;
  const userDeleted = await userRepo.remove(user);
  if (userDeleted) {
    res.status(200).json({
      result: 1,
      userDeleted: userDeleted
    });
  }
});

module.exports = router;