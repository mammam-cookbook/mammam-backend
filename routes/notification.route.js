const router = require("express").Router();
const notificatioRepo = require("../repository/notification.repo");
const authorize = require('../middlewares/authorize');
const permitRole = require("../middlewares/permitRole");

router.get("/",authorize, async function (req, res) {
    const notifications = await notificatioRepo.listNotifications({ user_id: req.user.id });
    if (notifications) {
      res.status(200).json({
        result: 1,
        notifications
      });
    }
});

router.put("/:id",authorize, permitRole('user'), async function (req, res) {
    const {id} = req.params;
    const notification = await notificatioRepo.update(id, req.body);
    if (notification) {
      res.status(200).json({
        result: 1,
        notification
      });
    }
});

module.exports = router;