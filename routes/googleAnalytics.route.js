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
const permitRole = require('../middlewares/permitRole');
const { getActiveUsers, getVisitors, getActiveUserDeviceCategory, getActiveUserLocaltions} = require('../repository/googleAnalytics.repo')
router.get("/", authorize, permitRole('admin'), async function (req, res) {
    try {
        const [numbersOfActiveUsers, numberOfVisitors] = await Promise.all([
            getActiveUsers(),
            getVisitors()
        ])
        return res.status(200).json({
            result: 1,
            data: {
                numberOfVisitors,
                numbersOfActiveUsers
            }
        })
    } catch (error) {
        return res.status(400).json({
            result: 0,
            message: error.message
        })
    }
});

module.exports = router;